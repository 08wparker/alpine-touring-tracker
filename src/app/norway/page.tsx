'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto, ActivityForPhoto } from '@/lib/photoGeo'
import { Trip } from '@/types/trip'
import { StravaAPI, StravaActivity } from '@/lib/strava'
import { getAllUsersActivities, UserWithActivities } from '@/lib/firestoreCache'
import { UserTrackGroup, DayTrackGroup } from '@/components/NorwayMap'

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
  date?: string
  polyline: [number, number][]
}

// Norway region bounds
const NORWAY_BOUNDS = { minLat: 62.0, maxLat: 62.8, minLng: 5.5, maxLng: 8.0 }

function isInNorway(activity: StravaActivity): boolean {
  const [lat, lng] = activity.start_latlng || [0, 0]
  return lat >= NORWAY_BOUNDS.minLat && lat <= NORWAY_BOUNDS.maxLat &&
         lng >= NORWAY_BOUNDS.minLng && lng <= NORWAY_BOUNDS.maxLng
}

// Distinct colors for each day
const DAY_COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#d946ef', // fuchsia
]

// Format date string to readable label
function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Norway() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)
  const [userTracks, setUserTracks] = useState<DecodedTrack[]>([])
  const [allUserTracks, setAllUserTracks] = useState<UserTrackGroup[]>([])
  const [allDecodedTracks, setAllDecodedTracks] = useState<DecodedTrack[]>([])
  const [currentUserActivities, setCurrentUserActivities] = useState<ActivityForPhoto[]>([])
  const [hiddenDays, setHiddenDays] = useState<Set<string>>(new Set())

  // Load all users' tracks from Firestore on mount
  useEffect(() => {
    getAllUsersActivities().then(allUsers => {
      if (allUsers.length === 0) return

      const api = new StravaAPI('')
      const allTracks: DecodedTrack[] = []

      const trackGroups: UserTrackGroup[] = allUsers.map((user: UserWithActivities, idx: number) => {
        const norwayActivities = user.activities.filter(isInNorway)
        const tracks: DecodedTrack[] = norwayActivities
          .filter(a => a.map?.summary_polyline)
          .map(a => ({
            id: a.id,
            name: a.name,
            date: a.start_date_local?.split('T')[0] || a.start_date?.split('T')[0],
            polyline: api.decodePolyline(a.map.summary_polyline)
          }))

        allTracks.push(...tracks)

        return {
          userId: user.userId,
          userName: user.name,
          color: DAY_COLORS[idx % DAY_COLORS.length],
          tracks,
        }
      }).filter(g => g.tracks.length > 0)

      setAllUserTracks(trackGroups)
      setAllDecodedTracks(allTracks)

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

  // Build day-grouped tracks
  const dayTracks = useMemo((): DayTrackGroup[] => {
    const byDay = new Map<string, DecodedTrack[]>()

    for (const track of allDecodedTracks) {
      const day = track.date || 'unknown'
      if (!byDay.has(day)) byDay.set(day, [])
      byDay.get(day)!.push(track)
    }

    // Sort by date (newest first)
    const sortedDays = Array.from(byDay.entries())
      .filter(([day]) => day !== 'unknown')
      .sort(([a], [b]) => b.localeCompare(a))

    return sortedDays.map(([date, tracks], idx) => ({
      date,
      label: formatDayLabel(date),
      color: DAY_COLORS[idx % DAY_COLORS.length],
      tracks,
    }))
  }, [allDecodedTracks])

  const handlePhotosAdded = useCallback((newPhotos: GeoPhoto[]) => {
    setPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id))
      const unique = newPhotos.filter(p => !existingIds.has(p.id))
      return [...prev, ...unique]
    })
  }, [])

  const handleActivitySelect = useCallback((activity: StravaActivity) => {
    setSelectedActivity(activity)
  }, [])

  const handleActivitiesLoaded = useCallback((activities: StravaActivity[]) => {
    const api = new StravaAPI('')
    const tracks: DecodedTrack[] = activities
      .filter(a => a.map?.summary_polyline)
      .map(a => ({
        id: a.id,
        name: a.name,
        date: a.start_date_local?.split('T')[0] || a.start_date?.split('T')[0],
        polyline: api.decodePolyline(a.map.summary_polyline)
      }))
    setUserTracks(tracks)

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

  const handleToggleDay = useCallback((date: string) => {
    setHiddenDays(prev => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-alpine-green mb-2">
          Romsdalsfjorden: Norway
        </h1>
        <p className="text-mountain-gray max-w-3xl text-sm md:text-base">
          Boat-based ski touring in the Romsdal and Sunnmore Alps — steep couloirs, sea-to-summit descents,
          and dramatic fjord landscapes.
        </p>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Regional Map</h2>
        <div className="h-[350px] md:h-[500px] rounded-lg overflow-hidden">
          <NorwayMap
            className="h-full w-full"
            photos={photos}
            trip={activeTrip}
            userTracks={userTracks}
            allUserTracks={allUserTracks}
            dayTracks={dayTracks}
            hiddenDays={hiddenDays}
            onToggleDay={handleToggleDay}
          />
        </div>

        {/* Day legend below map */}
        {dayTracks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {dayTracks.map(dg => (
              <button
                key={dg.date}
                onClick={() => handleToggleDay(dg.date)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  hiddenDays.has(dg.date)
                    ? 'opacity-40 border-gray-200 bg-gray-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dg.color }}></div>
                <span>{dg.label}</span>
                <span className="text-xs text-gray-400">{dg.tracks.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Strava Activities */}
      <div className="mb-6 md:mb-8">
        <UserActivities
          region="norway"
          onActivitySelect={handleActivitySelect}
          onActivitiesLoaded={handleActivitiesLoaded}
          selectedActivityId={selectedActivity?.id}
        />
      </div>

      {/* Trip Manager & Photos side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        <TripManager
          region="norway"
          onTripLoaded={setActiveTrip}
          allUserTracks={allUserTracks}
          photoCount={photos.length}
        />
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
