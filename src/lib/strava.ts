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
      'Backcountry Ski',
      'Nordic Ski',
      'Alpine Ski',
      'Ski',
      'Snowshoe'
    ]
    
    return activities.filter(activity => 
      skiTourTypes.includes(activity.sport_type) ||
      skiTourTypes.includes(activity.type) ||
      activity.name.toLowerCase().includes('ski tour') ||
      activity.name.toLowerCase().includes('backcountry') ||
      activity.name.toLowerCase().includes('mountaineering')
    )
  }

  // Decode Strava polyline to coordinates
  decodePolyline(polyline: string): Array<[number, number]> {
    if (!polyline) return []
    
    try {
      const coordinates = decode(polyline)
      // Convert from [lat, lng] to [lat, lng] format for Leaflet
      return coordinates.map(coord => [coord[0], coord[1]] as [number, number])
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
        north: 46.95,
        south: 46.80,
        east: 10.20,
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

  // Get activities from the last N months
  getRecentActivities(months = 12): Promise<StravaActivity[]> {
    const now = new Date()
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    const after = Math.floor(monthsAgo.getTime() / 1000)
    
    return this.getActivities(1, 200, after)
  }
}