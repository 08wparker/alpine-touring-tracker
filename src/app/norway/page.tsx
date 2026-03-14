'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto, ActivityForPhoto } from '@/lib/photoGeo'
import { Trip } from '@/types/trip'
import { StravaAPI, StravaActivity } from '@/lib/strava'
import { getAllUsersActivities, UserWithActivities } from '@/lib/firestoreCache'
import { UserTrackGroup } from '@/components/NorwayMap'

const NorwayMap = dynamic(() => import('@/components/NorwayMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

const PhotoUpload = dynamic(() => import('@/components/PhotoUpload'), { ssr: false })
const TripManager = dynamic(() => import('@/components/TripManager'), { ssr: false })
const UserActivities = dynamic(() => import('@/components/UserActivities'), { ssr: false })

interface DecodedTrack {
  id: number
  name: string
  polyline: [number, number][]
}

// Norway region bounds
const NORWAY_BOUNDS = { minLat: 62.0, maxLat: 62.8, minLng: 5.5, maxLng: 8.0 }

function isInNorway(activity: StravaActivity): boolean {
  const [lat, lng] = activity.start_latlng || [0, 0]
  return lat >= NORWAY_BOUNDS.minLat && lat <= NORWAY_BOUNDS.maxLat &&
         lng >= NORWAY_BOUNDS.minLng && lng <= NORWAY_BOUNDS.maxLng
}

// Assign distinct colors to users
const USER_COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']

export default function Norway() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)
  const [userTracks, setUserTracks] = useState<DecodedTrack[]>([])
  const [allUserTracks, setAllUserTracks] = useState<UserTrackGroup[]>([])
  const [currentUserActivities, setCurrentUserActivities] = useState<ActivityForPhoto[]>([])

  // Load all users' tracks from Firestore on mount
  useEffect(() => {
    getAllUsersActivities().then(allUsers => {
      if (allUsers.length === 0) return

      const api = new StravaAPI('')
      const trackGroups: UserTrackGroup[] = allUsers.map((user: UserWithActivities, idx: number) => {
        const norwayActivities = user.activities.filter(isInNorway)
        const tracks: DecodedTrack[] = norwayActivities
          .filter(a => a.map?.summary_polyline)
          .map(a => ({
            id: a.id,
            name: a.name,
            polyline: api.decodePolyline(a.map.summary_polyline)
          }))

        return {
          userId: user.userId,
          userName: user.name,
          color: USER_COLORS[idx % USER_COLORS.length],
          tracks,
        }
      }).filter(g => g.tracks.length > 0)

      setAllUserTracks(trackGroups)

      // Set current user's activities for photo interpolation
      if (session?.user?.id) {
        const currentUser = allUsers.find(u => u.userId === session.user!.id)
        if (currentUser) {
          const norwayActs = currentUser.activities.filter(isInNorway)
          setCurrentUserActivities(
            norwayActs
              .filter(a => a.map?.summary_polyline)
              .map(a => ({
                id: a.id,
                name: a.name,
                start_date: a.start_date,
                elapsed_time: a.elapsed_time,
                summary_polyline: a.map.summary_polyline,
              }))
          )
        }
      }
    }).catch(err => {
      console.error('Error loading multi-user tracks:', err)
    })
  }, [session?.user?.id])

  const handlePhotosAdded = useCallback((newPhotos: GeoPhoto[]) => {
    setPhotos(prev => {
      // Deduplicate by id (Firestore-loaded photos might already exist)
      const existingIds = new Set(prev.map(p => p.id))
      const unique = newPhotos.filter(p => !existingIds.has(p.id))
      return [...prev, ...unique]
    })
  }, [])

  const handleActivitySelect = useCallback((activity: StravaActivity) => {
    setSelectedActivity(activity)
  }, [])

  // Auto-load logged-in user's tracks when activities are fetched from Strava
  const handleActivitiesLoaded = useCallback((activities: StravaActivity[]) => {
    const api = new StravaAPI('')
    const tracks: DecodedTrack[] = activities
      .filter(a => a.map?.summary_polyline)
      .map(a => ({
        id: a.id,
        name: a.name,
        polyline: api.decodePolyline(a.map.summary_polyline)
      }))
    setUserTracks(tracks)

    // Also set activities for photo interpolation
    setCurrentUserActivities(
      activities
        .filter(a => a.map?.summary_polyline)
        .map(a => ({
          id: a.id,
          name: a.name,
          start_date: a.start_date,
          elapsed_time: a.elapsed_time,
          summary_polyline: a.map.summary_polyline,
        }))
    )
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <h1 className="text-4xl font-bold text-alpine-green">
          Romsdalsfjorden: Norway
        </h1>
      </div>
      <p className="text-mountain-gray mb-8 max-w-3xl">
        Boat-based ski touring in the Romsdal and Sunnmore Alps — steep couloirs, sea-to-summit descents,
        and dramatic fjord landscapes. Docking at Åndalsnes and Måndalen for day trips to iconic peaks.
      </p>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regional Map</h2>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <NorwayMap
            className="h-full w-full"
            photos={photos}
            trip={activeTrip}
            userTracks={userTracks}
            allUserTracks={allUserTracks}
          />
        </div>
      </div>

      {/* Strava Activities */}
      <div className="mb-8">
        <UserActivities
          region="norway"
          onActivitySelect={handleActivitySelect}
          onActivitiesLoaded={handleActivitiesLoaded}
          selectedActivityId={selectedActivity?.id}
        />
      </div>

      {/* Trip Manager & Photos side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <TripManager region="norway" onTripLoaded={setActiveTrip} />
        <PhotoUpload
          uploaderName={session?.user?.name || 'Anonymous'}
          onPhotosAdded={handlePhotosAdded}
          activities={currentUserActivities}
          region="norway"
          userId={session?.user?.id || ''}
        />
      </div>
    </div>
  )
}
