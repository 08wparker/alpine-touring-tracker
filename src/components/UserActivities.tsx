'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { StravaAPI, StravaActivity } from '@/lib/strava'
import { saveUserActivities, getUserActivities, getUserMetadata } from '@/lib/firestoreCache'

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
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [dataSource, setDataSource] = useState<string>('')

  useEffect(() => {
    // Only fetch from Strava if logged in via Strava (not Google)
    if (session?.accessToken && session?.user?.id && session?.provider === 'strava') {
      fetchActivities()
    }
  }, [session, region])

  const processAndSetActivities = (allActivities: StravaActivity[], stravaAPI: StravaAPI) => {
    const skiTourActivities = stravaAPI.filterSkiTouringActivities(allActivities)
    const regionActivities = region
      ? stravaAPI.filterActivitiesByRegion(skiTourActivities, region)
      : skiTourActivities

    setActivities(regionActivities)
    onActivitiesLoaded?.(regionActivities)
  }

  const fetchActivities = async (forceSync = false) => {
    if (!session?.accessToken || !session?.user?.id) return

    const userId = session.user.id
    setLoading(true)
    setError(null)

    try {
      const stravaAPI = new StravaAPI(session.accessToken)
      const cacheKey = 'strava-all-activities'

      // --- Tier 1: sessionStorage (instant, current tab) ---
      if (!forceSync) {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const allActivities: StravaActivity[] = JSON.parse(cached)
          setDataSource('session cache')
          processAndSetActivities(allActivities, stravaAPI)

          // Check if Firestore has data; if not, backfill from sessionStorage
          console.log('[Firestore] Checking metadata for user:', userId, '| Activities in cache:', allActivities.length)
          getUserMetadata(userId).then(meta => {
            console.log('[Firestore] getUserMetadata result:', meta)
            if (meta) {
              setLastSynced(meta.lastSynced)
            } else if (allActivities.length > 0) {
              // Firestore is empty — backfill ski activities only
              const skiActivities = stravaAPI.filterSkiTouringActivities(allActivities)
              console.log('[Firestore] No metadata found, backfilling', skiActivities.length, 'ski activities...')
              saveUserActivities(
                userId,
                session.user.name || '',
                session.user.image || '',
                skiActivities
              ).then(() => {
                setLastSynced(new Date())
                console.log('[Firestore] Backfill complete!')
              }).catch(err => {
                console.error('[Firestore] Backfill FAILED:', err)
              })
            }
          }).catch(err => {
            console.error('[Firestore] getUserMetadata FAILED:', err)
          })

          setLoading(false)
          return
        }
      }

      // --- Tier 2: Firestore (fast, persistent) ---
      if (!forceSync) {
        try {
          const firestoreActivities = await getUserActivities(userId)
          if (firestoreActivities && firestoreActivities.length > 0) {
            setDataSource('Firestore')
            // Populate sessionStorage for next time
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(firestoreActivities))
            } catch {}

            const meta = await getUserMetadata(userId)
            if (meta) setLastSynced(meta.lastSynced)

            processAndSetActivities(firestoreActivities, stravaAPI)
            setLoading(false)
            return
          }
        } catch (err) {
          console.warn('Firestore cache miss or error, falling through to Strava:', err)
        }
      }

      // --- Tier 3: Strava API (slow, rate-limited) ---
      if (forceSync) {
        sessionStorage.removeItem(cacheKey)
      }

      setDataSource('Strava API')
      const allActivities = await stravaAPI.getAllActivities()

      // Only cache if we got meaningful results
      if (allActivities.length > 0) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(allActivities))
        } catch {}

        // Save ski activities only to Firestore in background
        const skiActivities = stravaAPI.filterSkiTouringActivities(allActivities)
        saveUserActivities(
          userId,
          session.user.name || '',
          session.user.image || '',
          skiActivities
        ).then(() => {
          setLastSynced(new Date())
        }).catch(err => {
          console.warn('Failed to save to Firestore:', err)
        })
      }

      processAndSetActivities(allActivities, stravaAPI)

      if (allActivities.length === 0) {
        setError('Strava rate limit reached — try again in a few minutes')
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Failed to load activities')
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

  const formatLastSynced = () => {
    if (!lastSynced) return null
    const now = new Date()
    const diffMs = now.getTime() - lastSynced.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
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

  // Google auth users can see all tracks but don't have Strava data
  if (session.provider === 'google') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Ski Tours</h2>
        <p className="text-mountain-gray">
          Signed in with Google — you can view all tracks on the map and upload photos.
          To see your own activities, sign in with Strava instead.
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
          <span>Loading activities{dataSource ? ` from ${dataSource}` : ''}...</span>
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
          onClick={() => fetchActivities(true)}
          className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark transition-colors"
        >
          Sync with Strava
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
        <div className="flex items-center gap-3">
          {lastSynced && (
            <span className="text-xs text-mountain-gray">
              Synced {formatLastSynced()}
            </span>
          )}
          <button
            onClick={() => fetchActivities(true)}
            className="text-sm px-3 py-1 text-alpine-green hover:bg-alpine-green hover:text-white rounded transition-colors"
          >
            Sync with Strava
          </button>
        </div>
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
