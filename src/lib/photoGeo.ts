import exifr from 'exifr'
import { decode } from '@googlemaps/polyline-codec'

export interface GeoPhoto {
  id: string
  previewUrl: string
  timestamp?: Date
  coordinates?: [number, number] // [lat, lng]
  source: 'exif' | 'gps-match' | 'interpolated' | 'manual' | 'none'
  caption: string
  uploaderName: string
  storageUrl?: string
  thumbnailUrl?: string
  activityId?: number
  region?: string
  userId?: string
}

interface TrackPoint {
  lat: number
  lng: number
  time?: string
  elevation?: number
}

export interface ActivityForPhoto {
  id: number
  name: string
  start_date: string
  elapsed_time: number
  summary_polyline: string
}

/**
 * Extract GPS coordinates and timestamp from a photo's EXIF data
 */
export async function extractPhotoGeo(file: File): Promise<{
  coordinates?: [number, number]
  timestamp?: Date
}> {
  try {
    const exif = await exifr.parse(file, {
      gps: true,
      pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude']
    })

    if (!exif) return {}

    const coordinates = exif.latitude && exif.longitude
      ? [exif.latitude, exif.longitude] as [number, number]
      : undefined

    const timestamp = exif.DateTimeOriginal || exif.CreateDate || undefined

    return { coordinates, timestamp }
  } catch (error) {
    console.error('Error reading EXIF data:', error)
    return {}
  }
}

/**
 * Interpolate position along a polyline based on time fraction.
 * Photo taken at time T during activity [startTime, startTime + elapsedTime]
 * → position at fraction (T - startTime) / elapsedTime along the polyline.
 */
export function interpolatePositionOnPolyline(
  photoTimestamp: Date,
  activityStartDate: string,
  activityElapsedTime: number,
  summaryPolyline: string
): [number, number] | null {
  if (!summaryPolyline || activityElapsedTime <= 0) return null

  const points = decode(summaryPolyline) as [number, number][]
  if (points.length < 2) return points.length === 1 ? points[0] : null

  const startMs = new Date(activityStartDate).getTime()
  const photoMs = photoTimestamp.getTime()
  const fraction = Math.max(0, Math.min(1, (photoMs - startMs) / (activityElapsedTime * 1000)))

  // Compute cumulative distances along polyline
  const distances: number[] = [0]
  for (let i = 1; i < points.length; i++) {
    const d = haversineDistance(points[i - 1], points[i])
    distances.push(distances[i - 1] + d)
  }

  const totalDistance = distances[distances.length - 1]
  if (totalDistance === 0) return points[0]

  const targetDistance = fraction * totalDistance

  // Find the segment containing the target distance
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] >= targetDistance) {
      const segFraction = (targetDistance - distances[i - 1]) / (distances[i] - distances[i - 1])
      const lat = points[i - 1][0] + segFraction * (points[i][0] - points[i - 1][0])
      const lng = points[i - 1][1] + segFraction * (points[i][1] - points[i - 1][1])
      return [lat, lng]
    }
  }

  return points[points.length - 1]
}

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const lat1 = a[0] * Math.PI / 180
  const lat2 = b[0] * Math.PI / 180
  const sinDlat = Math.sin(dLat / 2)
  const sinDlng = Math.sin(dLng / 2)
  const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/**
 * Find the activity whose time window contains the photo timestamp.
 * Tolerance: 30 min before start, 30 min after end.
 */
export function findBestActivityForPhoto(
  photoTimestamp: Date,
  activities: ActivityForPhoto[]
): ActivityForPhoto | null {
  const photoMs = photoTimestamp.getTime()
  const tolerance = 30 * 60 * 1000 // 30 minutes

  for (const activity of activities) {
    const startMs = new Date(activity.start_date).getTime()
    const endMs = startMs + activity.elapsed_time * 1000

    if (photoMs >= startMs - tolerance && photoMs <= endMs + tolerance) {
      return activity
    }
  }

  return null
}

/**
 * Match a photo timestamp to the nearest GPS track point
 */
export function matchTimestampToTrack(
  photoTime: Date,
  trackPoints: TrackPoint[],
  maxDeltaSeconds = 300
): [number, number] | null {
  if (!trackPoints.length) return null

  const photoMs = photoTime.getTime()
  let closestPoint: TrackPoint | null = null
  let closestDelta = Infinity

  for (const point of trackPoints) {
    if (!point.time) continue
    const pointMs = new Date(point.time).getTime()
    const delta = Math.abs(photoMs - pointMs)
    if (delta < closestDelta) {
      closestDelta = delta
      closestPoint = point
    }
  }

  if (closestPoint && closestDelta <= maxDeltaSeconds * 1000) {
    return [closestPoint.lat, closestPoint.lng]
  }

  return null
}

/**
 * Process a photo file and return a GeoPhoto with location data.
 * Now supports interpolation along Strava activity polylines.
 */
export async function processPhoto(
  file: File,
  uploaderName: string,
  trackPoints: TrackPoint[] = [],
  activities: ActivityForPhoto[] = []
): Promise<GeoPhoto> {
  const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const previewUrl = URL.createObjectURL(file)

  const { coordinates: exifCoords, timestamp } = await extractPhotoGeo(file)

  // Try to interpolate from timestamp first (needed for EXIF validation)
  let interpolatedCoords: [number, number] | null = null
  let interpolatedActivityId: number | undefined
  if (timestamp && activities.length > 0) {
    const activity = findBestActivityForPhoto(timestamp, activities)
    if (activity) {
      interpolatedCoords = interpolatePositionOnPolyline(
        timestamp,
        activity.start_date,
        activity.elapsed_time,
        activity.summary_polyline
      )
      interpolatedActivityId = activity.id
    }
  }

  // If EXIF has GPS, validate it against known tracks
  if (exifCoords) {
    let exifTrusted = true

    // If we have an interpolated position, check if EXIF is suspiciously far from it
    if (interpolatedCoords) {
      const distKm = haversineDistance(exifCoords, interpolatedCoords) / 1000
      if (distKm > 5) {
        // EXIF GPS is >5km from where the timestamp says we should be — likely a glitch
        console.warn(`Photo EXIF GPS is ${distKm.toFixed(1)}km from track position, using interpolation instead`)
        exifTrusted = false
      }
    }

    if (exifTrusted) {
      return {
        id,
        previewUrl,
        timestamp,
        coordinates: exifCoords,
        source: 'exif',
        caption: file.name.replace(/\.[^/.]+$/, ''),
        uploaderName
      }
    }
  }

  // Fallback 1: match timestamp to GPS track points (has time data)
  if (timestamp && trackPoints.length > 0) {
    const matched = matchTimestampToTrack(timestamp, trackPoints)
    if (matched) {
      return {
        id,
        previewUrl,
        timestamp,
        coordinates: matched,
        source: 'gps-match',
        caption: file.name.replace(/\.[^/.]+$/, ''),
        uploaderName
      }
    }
  }

  // Fallback 2: use interpolated position from activity polyline
  if (interpolatedCoords) {
    return {
      id,
      previewUrl,
      timestamp,
      coordinates: interpolatedCoords,
      source: 'interpolated',
      caption: file.name.replace(/\.[^/.]+$/, ''),
      uploaderName,
      activityId: interpolatedActivityId
    }
  }

  // No location found
  return {
    id,
    previewUrl,
    timestamp,
    source: 'none',
    caption: file.name.replace(/\.[^/.]+$/, ''),
    uploaderName
  }
}
