'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto, ActivityForPhoto } from '@/lib/photoGeo'
import { StravaAPI, StravaActivity } from '@/lib/strava'
import { getAllUsersActivities, UserWithActivities, getTourNames, saveTourName } from '@/lib/firestoreCache'
import { UserTrackGroup, DayTrackGroup } from '@/components/NorwayMap'

const SilvrettaMap = dynamic(() => import('@/components/SilvrettaMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

const PhotoUpload = dynamic(() => import('@/components/PhotoUpload'), { ssr: false })
const TripManager = dynamic(() => import('@/components/TripManager'), { ssr: false })
const UserActivities = dynamic(() => import('@/components/UserActivities'), { ssr: false })
const FullscreenPhoto = dynamic(() => import('@/components/FullscreenPhoto'), { ssr: false })
const PhotoCarousel = dynamic(() => import('@/components/PhotoCarousel'), { ssr: false })
const DaySelector = dynamic(() => import('@/components/DaySelector'), { ssr: false })

interface DecodedTrack {
  id: number
  name: string
  date?: string
  polyline: [number, number][]
}

const SILVRETTA_BOUNDS = { minLat: 46.80, maxLat: 47.25, minLng: 9.90, maxLng: 10.30 }

function isInSilvretta(activity: StravaActivity): boolean {
  const [lat, lng] = activity.start_latlng || [0, 0]
  return lat >= SILVRETTA_BOUNDS.minLat && lat <= SILVRETTA_BOUNDS.maxLat &&
         lng >= SILVRETTA_BOUNDS.minLng && lng <= SILVRETTA_BOUNDS.maxLng
}

const DAY_COLORS = [
  '#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f59e0b', '#6366f1', '#84cc16', '#06b6d4', '#d946ef',
]

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ADMIN_USER_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean)

export default function Silvretta() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)
  const [userTracks, setUserTracks] = useState<DecodedTrack[]>([])
  const [allUserTracks, setAllUserTracks] = useState<UserTrackGroup[]>([])
  const [allDecodedTracks, setAllDecodedTracks] = useState<DecodedTrack[]>([])
  const [currentUserActivities, setCurrentUserActivities] = useState<ActivityForPhoto[]>([])
  const [allActivitiesForPhotos, setAllActivitiesForPhotos] = useState<ActivityForPhoto[]>([])
  const [hiddenDays, setHiddenDays] = useState<Set<string>>(new Set())
  const [fullscreenPhoto, setFullscreenPhoto] = useState<GeoPhoto | null>(null)
  const [tourNames, setTourNames] = useState<Map<string, string>>(new Map())
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editDayName, setEditDayName] = useState('')
  const [focusDay, setFocusDay] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const currentUserId = session?.user?.id || ''
  const isAdmin = !!(currentUserId && (
    ADMIN_USER_IDS.includes(currentUserId) ||
    session?.provider === 'strava'
  ))

  // Load tour names from Firestore
  useEffect(() => {
    getTourNames('silvretta').then(setTourNames).catch(console.error)
  }, [])

  // Load all users' tracks from Firestore on mount
  useEffect(() => {
    getAllUsersActivities().then(allUsers => {
      if (allUsers.length === 0) return

      const api = new StravaAPI('')
      const allTracks: DecodedTrack[] = []

      const trackGroups: UserTrackGroup[] = allUsers.map((user: UserWithActivities, idx: number) => {
        const silvrettaActivities = user.activities.filter(isInSilvretta)
        const tracks: DecodedTrack[] = silvrettaActivities
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

      // Collect all Silvretta activities for photo interpolation
      const allActs: ActivityForPhoto[] = allUsers.flatMap(user =>
        user.activities.filter(isInSilvretta)
          .filter(a => a.map?.summary_polyline)
          .map(a => ({
            id: a.id,
            name: a.name,
            start_date: a.start_date,
            elapsed_time: a.elapsed_time,
            summary_polyline: a.map.summary_polyline,
          }))
      )
      setAllActivitiesForPhotos(allActs)

      if (session?.user?.id) {
        const currentUser = allUsers.find(u => u.userId === session.user!.id)
        if (currentUser) {
          const silvrettaActs = currentUser.activities.filter(isInSilvretta)
          setCurrentUserActivities(
            silvrettaActs
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

  const dayTracks = useMemo((): DayTrackGroup[] => {
    if (allDecodedTracks.length === 0) return []
    const byDay = new Map<string, DecodedTrack[]>()
    for (const track of allDecodedTracks) {
      const day = track.date || 'unknown'
      if (!byDay.has(day)) byDay.set(day, [])
      byDay.get(day)!.push(track)
    }
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
      if (unique.length === 0 && newPhotos.length === prev.length) return newPhotos
      return unique.length > 0 ? [...prev, ...unique] : prev
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
  }, [])

  const handleSelectDay = useCallback((date: string) => {
    if (!date) {
      setHiddenDays(new Set())
      setFocusDay(null)
      return
    }
    const visibleDays = dayTracks.filter(dg => !hiddenDays.has(dg.date))
    if (visibleDays.length === 1 && visibleDays[0].date === date) {
      setHiddenDays(new Set())
      setFocusDay(null)
    } else {
      setHiddenDays(new Set(dayTracks.filter(dg => dg.date !== date).map(dg => dg.date)))
      setFocusDay(date)
      setTimeout(() => setFocusDay(null), 1000)
    }
  }, [dayTracks, hiddenDays])

  const startRenamingDay = (date: string) => {
    setEditingDay(date)
    setEditDayName(tourNames.get(date) || '')
  }

  const saveDayName = async (date: string) => {
    const name = editDayName.trim()
    try {
      await saveTourName('silvretta', date, name)
      setTourNames(prev => {
        const next = new Map(prev)
        if (name) {
          next.set(date, name)
        } else {
          next.delete(date)
        }
        return next
      })
    } catch (err) {
      console.error('Error saving tour name:', err)
    }
    setEditingDay(null)
  }

  const handleShowOnMap = useCallback((date: string) => {
    handleSelectDay(date)
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [handleSelectDay])

  const getTourNameForPhoto = useCallback((photo: GeoPhoto): string | undefined => {
    if (!photo.timestamp) return undefined
    const photoDate = new Date(photo.timestamp).toISOString().split('T')[0]
    const customName = tourNames.get(photoDate)
    const dayGroup = dayTracks.find(dg => dg.date === photoDate)
    if (customName && dayGroup) return `${customName} — ${dayGroup.label}`
    if (customName) return customName
    return dayGroup?.label
  }, [tourNames, dayTracks])

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-6 mb-2">
          <img
            src="/piz_buin.jpg"
            alt="Piz Buin from Ochsentaler Glacier"
            className="w-24 h-24 flex-shrink-0 rounded-lg object-cover shadow-md"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-alpine-green">
            Silvretta Group: Austria-Switzerland
          </h1>
        </div>
      </div>

      {/* Interactive Map */}
      <div ref={mapRef} className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Regional Map</h2>

        {/* Day selector above map */}
        <DaySelector
          dayTracks={dayTracks}
          hiddenDays={hiddenDays}
          onSelectDay={handleSelectDay}
          tourNames={tourNames}
          isAdmin={isAdmin}
          editingDay={editingDay}
          editDayName={editDayName}
          onStartRenaming={startRenamingDay}
          onEditDayNameChange={setEditDayName}
          onSaveDayName={saveDayName}
        />

        <div className="h-[350px] md:h-[500px] rounded-lg overflow-hidden">
          <SilvrettaMap
            className="h-full w-full"
            photos={photos}
            userTracks={userTracks}
            allUserTracks={allUserTracks}
            dayTracks={dayTracks}
            hiddenDays={hiddenDays}
            tourNames={tourNames}
            focusDay={focusDay}
            onFullscreenPhoto={setFullscreenPhoto}
          />
        </div>
      </div>

      {/* Photo Carousel */}
      {photos.length > 0 && (
        <div className="mb-6 md:mb-8">
          <PhotoCarousel
            photos={photos}
            dayOptions={dayTracks.map(dg => ({ date: dg.date, label: dg.label, color: dg.color }))}
            tourNames={tourNames}
            onFullscreen={setFullscreenPhoto}
            onShowOnMap={handleShowOnMap}
          />
        </div>
      )}

      {/* Strava Activities */}
      <div className="mb-6 md:mb-8">
        <UserActivities
          region="silvretta"
          onActivitySelect={handleActivitySelect}
          onActivitiesLoaded={handleActivitiesLoaded}
          selectedActivityId={selectedActivity?.id}
        />
      </div>

      {/* Trip Manager & Photos side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        <TripManager region="silvretta" onTripLoaded={() => {}} />
        <PhotoUpload
          uploaderName={typeof window !== 'undefined' ? localStorage.getItem('touring-user-name') || 'Anonymous' : 'Anonymous'}
          onPhotosAdded={handlePhotosAdded}
          activities={currentUserActivities}
          allActivities={allActivitiesForPhotos}
          region="silvretta"
          userId={currentUserId}
          isAdmin={isAdmin}
        />
      </div>

      {/* Fullscreen photo overlay */}
      {fullscreenPhoto && (
        <FullscreenPhoto
          photo={fullscreenPhoto}
          onClose={() => setFullscreenPhoto(null)}
          tourName={getTourNameForPhoto(fullscreenPhoto)}
        />
      )}
    </div>
  )
}
