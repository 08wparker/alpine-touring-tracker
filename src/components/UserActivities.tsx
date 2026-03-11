'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { StravaAPI, StravaActivity } from '@/lib/strava'

interface UserActivitiesProps {
  region?: 'haute-route' | 'berner-oberland' | 'ortler' | 'silvretta' | 'norway'
  onActivitySelect?: (activity: StravaActivity) => void
  onActivitiesLoaded?: (activities: StravaActivity[]) => void
  selectedActivityId?: number
}

export default function UserActivities({
  region,
  onActivitySelect,
  onActivitiesLoaded,
  selectedActivityId
}: UserActivitiesProps) {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.accessToken) {
      fetchActivities()
    }
  }, [session, region])

  const fetchActivities = async () => {
    if (!session?.accessToken) return

    setLoading(true)
    setError(null)

    try {
      const stravaAPI = new StravaAPI(session.accessToken)

      // Check sessionStorage cache first to avoid rate limits
      const cacheKey = 'strava-all-activities'
      let allActivities: StravaActivity[]
      const cached = sessionStorage.getItem(cacheKey)

      if (cached) {
        allActivities = JSON.parse(cached)
      } else {
        allActivities = await stravaAPI.getAllActivities()
        try { sessionStorage.setItem(cacheKey, JSON.stringify(allActivities)) } catch {}
      }

      // Filter to ski touring activities
      const skiTourActivities = stravaAPI.filterSkiTouringActivities(allActivities)

      // Filter by region if specified
      const regionActivities = region
        ? stravaAPI.filterActivitiesByRegion(skiTourActivities, region)
        : skiTourActivities

      setActivities(regionActivities)
      onActivitiesLoaded?.(regionActivities)
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Failed to load activities from Strava')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatElevation = (meters: number) => {
    return `${Math.round(meters)}m`
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Ski Tours</h2>
        <p className="text-mountain-gray">
          Connect your Strava account to see your ski touring activities overlaid on the maps.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Ski Tours</h2>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-alpine-green"></div>
          <span>Loading activities...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Ski Tours</h2>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchActivities}
          className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Your Ski Tours
          {region && (
            <span className="text-sm text-mountain-gray ml-2">
              ({region.replace('-', ' ')})
            </span>
          )}
        </h2>
        <button
          onClick={fetchActivities}
          className="text-sm px-3 py-1 text-alpine-green hover:bg-alpine-green hover:text-white rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="text-mountain-gray">
          No ski touring activities found in this region. 
          {region && " Try a different region or check your Strava activity types."}
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => onActivitySelect?.(activity)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedActivityId === activity.id
                  ? 'border-alpine-green bg-alpine-green/5'
                  : 'border-gray-200 hover:border-alpine-green hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate">{activity.name}</h3>
                <span className="text-sm text-mountain-gray whitespace-nowrap ml-2">
                  {formatDate(activity.start_date_local)}
                </span>
              </div>
              
              <div className="text-sm text-mountain-gray mb-2">
                <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                  {activity.sport_type || activity.type}
                </span>
                {activity.location_city && (
                  <span>{activity.location_city}, {activity.location_country}</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-mountain-gray">Distance</div>
                  <div className="font-semibold">{formatDistance(activity.distance)}</div>
                </div>
                <div>
                  <div className="text-mountain-gray">Duration</div>
                  <div className="font-semibold">{formatDuration(activity.moving_time)}</div>
                </div>
                <div>
                  <div className="text-mountain-gray">Elevation</div>
                  <div className="font-semibold">{formatElevation(activity.total_elevation_gain)}</div>
                </div>
                <div>
                  <div className="text-mountain-gray">Kudos</div>
                  <div className="font-semibold">❤️ {activity.kudos_count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}