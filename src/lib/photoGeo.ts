import exifr from 'exifr'

export interface GeoPhoto {
  id: string
  previewUrl: string
  timestamp?: Date
  coordinates?: [number, number] // [lat, lng]
  source: 'exif' | 'gps-match' | 'manual' | 'none'
  caption: string
  uploaderName: string
}

interface TrackPoint {
  lat: number
  lng: number
  time?: string
  elevation?: number
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
 * Process a photo file and return a GeoPhoto with location data
 */
export async function processPhoto(
  file: File,
  uploaderName: string,
  trackPoints: TrackPoint[] = []
): Promise<GeoPhoto> {
  const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const previewUrl = URL.createObjectURL(file)

  const { coordinates, timestamp } = await extractPhotoGeo(file)

  // If EXIF has GPS, use it directly
  if (coordinates) {
    return {
      id,
      previewUrl,
      timestamp,
      coordinates,
      source: 'exif',
      caption: file.name.replace(/\.[^/.]+$/, ''),
      uploaderName
    }
  }

  // Fallback: match timestamp to GPS track
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
