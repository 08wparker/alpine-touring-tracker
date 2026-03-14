import { decode } from '@googlemaps/polyline-codec'

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  start_date_local: string
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: {
    id: string
    summary_polyline: string
    resource_state: number
  }
  start_latlng: [number, number]
  end_latlng: [number, number]
  location_city: string
  location_state: string
  location_country: string
  suffer_score?: number
}

export interface StravaDetailedActivity extends StravaActivity {
  description: string
  photos: {
    primary?: {
      urls: {
        100: string
        600: string
      }
    }
  }
  gear?: {
    id: string
    name: string
  }
  segment_efforts: Array<{
    id: number
    name: string
    elapsed_time: number
    moving_time: number
    start_date: string
    start_date_local: string
    distance: number
    segment: {
      id: number
      name: string
      activity_type: string
      distance: number
      average_grade: number
      maximum_grade: number
      elevation_high: number
      elevation_low: number
      start_latlng: [number, number]
      end_latlng: [number, number]
    }
  }>
}

export class StravaAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getActivities(page = 1, perPage = 30, after?: number, before?: number): Promise<StravaActivity[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    })
    
    if (after) params.append('after', after.toString())
    if (before) params.append('before', before.toString())

    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`)
    }

    return response.json()
  }

  async getActivity(id: number): Promise<StravaDetailedActivity> {
    const response = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`)
    }

    return response.json()
  }

  // Filter activities by ski touring types
  filterSkiTouringActivities(activities: StravaActivity[]): StravaActivity[] {
    const skiTourTypes = [
      'BackcountrySki',
      'Backcountry Ski',
      'NordicSki',
      'Nordic Ski',
      'AlpineSki',
      'Alpine Ski',
      'Ski',
      'Snowshoe',
      'Walk',
      'Hike'
    ]

    return activities.filter(activity =>
      skiTourTypes.includes(activity.sport_type) ||
      skiTourTypes.includes(activity.type) ||
      activity.name.toLowerCase().includes('ski tour') ||
      activity.name.toLowerCase().includes('backcountry') ||
      activity.name.toLowerCase().includes('ski') ||
      activity.name.toLowerCase().includes('mountaineering')
    )
  }

  // Haversine distance in km between two [lat, lng] points
  static haversineKm(a: [number, number], b: [number, number]): number {
    const R = 6371
    const dLat = (b[0] - a[0]) * Math.PI / 180
    const dLng = (b[1] - a[1]) * Math.PI / 180
    const sinLat = Math.sin(dLat / 2)
    const sinLng = Math.sin(dLng / 2)
    const h = sinLat * sinLat +
      Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * sinLng * sinLng
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  }

  // Remove GPS outlier points that are impossibly far from neighbors
  static sanitizePolyline(points: Array<[number, number]>, maxJumpKm = 5): Array<[number, number]> {
    if (points.length < 3) return points

    const clean: Array<[number, number]> = [points[0]]
    for (let i = 1; i < points.length - 1; i++) {
      const prev = clean[clean.length - 1]
      const curr = points[i]
      const next = points[i + 1]
      const distPrev = StravaAPI.haversineKm(prev, curr)
      const distNext = StravaAPI.haversineKm(curr, next)
      // Keep point if it's within maxJumpKm of at least one neighbor
      if (distPrev <= maxJumpKm || distNext <= maxJumpKm) {
        clean.push(curr)
      }
    }
    // Always keep last point if it's close to its predecessor
    const last = points[points.length - 1]
    if (StravaAPI.haversineKm(clean[clean.length - 1], last) <= maxJumpKm) {
      clean.push(last)
    }
    return clean
  }

  // Decode Strava polyline to coordinates, removing GPS outliers
  decodePolyline(polyline: string): Array<[number, number]> {
    if (!polyline) return []

    try {
      const coordinates = decode(polyline)
      const points = coordinates.map(coord => [coord[0], coord[1]] as [number, number])
      return StravaAPI.sanitizePolyline(points)
    } catch (error) {
      console.error('Error decoding polyline:', error)
      return []
    }
  }

  // Filter activities by region (rough geographic bounds)
  filterActivitiesByRegion(activities: StravaActivity[], region: 'haute-route' | 'berner-oberland' | 'ortler' | 'silvretta' | 'norway'): StravaActivity[] {
    const regionBounds = {
      'haute-route': {
        north: 46.2,
        south: 45.8,
        east: 7.8,
        west: 6.8
      },
      'berner-oberland': {
        north: 46.7,
        south: 46.4,
        east: 8.3,
        west: 7.8
      },
      'ortler': {
        north: 46.6,
        south: 46.4,
        east: 10.8,
        west: 10.4
      },
      'silvretta': {
        north: 47.25,
        south: 46.80,
        east: 10.30,
        west: 9.90
      },
      'norway': {
        north: 62.8,
        south: 62.0,
        east: 8.0,
        west: 5.5
      }
    }

    const bounds = regionBounds[region]
    
    return activities.filter(activity => {
      if (!activity.start_latlng || activity.start_latlng.length !== 2) return false
      
      const [lat, lng] = activity.start_latlng
      return lat >= bounds.south && 
             lat <= bounds.north && 
             lng >= bounds.west && 
             lng <= bounds.east
    })
  }

  // Get activities from the last N months (paginated to get all)
  async getRecentActivities(months = 12): Promise<StravaActivity[]> {
    const now = new Date()
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    const after = Math.floor(monthsAgo.getTime() / 1000)

    const allActivities: StravaActivity[] = []
    let page = 1
    const perPage = 200

    while (true) {
      const batch = await this.getActivities(page, perPage, after)
      allActivities.push(...batch)
      if (batch.length < perPage) break
      page++
      if (page > 10) break // safety limit
    }

    return allActivities
  }

  // Get all activities (no time filter, paginated, handles rate limits)
  async getAllActivities(): Promise<StravaActivity[]> {
    const allActivities: StravaActivity[] = []
    let page = 1
    const perPage = 200

    while (true) {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      })

      const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (response.status === 429) {
        console.warn(`Strava rate limit hit on page ${page}, returning ${allActivities.length} activities fetched so far`)
        break
      }

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`)
      }

      const batch = await response.json()
      allActivities.push(...batch)
      if (batch.length < perPage) break
      page++
      if (page > 30) break // safety limit
    }

    return allActivities
  }
}