'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto, ActivityForPhoto } from '@/lib/photoGeo'
import { StravaAPI, StravaActivity } from '@/lib/strava'
import { getAllUsersActivities, UserWithActivities, getTourNames, saveTourName } from '@/lib/firestoreCache'
import { UserTrackGroup, DayTrackGroup } from '@/components/NorwayMap'

const NorwayMap = dynamic(() => import('@/components/NorwayMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

const PhotoUpload = dynamic(() => import('@/components/PhotoUpload'), { ssr: false })
const UserActivities = dynamic(() => import('@/components/UserActivities'), { ssr: false })
const FullscreenPhoto = dynamic(() => import('@/components/FullscreenPhoto'), { ssr: false })
const PhotoCarousel = dynamic(() => import('@/components/PhotoCarousel'), { ssr: false })

interface DecodedTrack {
  id: number
  name: string
  date?: string
  polyline: [number, number][]
}

const NORWAY_BOUNDS = { minLat: 62.0, maxLat: 62.8, minLng: 5.5, maxLng: 8.0 }

function isInNorway(activity: StravaActivity): boolean {
  const [lat, lng] = activity.start_latlng || [0, 0]
  return lat >= NORWAY_BOUNDS.minLat && lat <= NORWAY_BOUNDS.maxLat &&
         lng >= NORWAY_BOUNDS.minLng && lng <= NORWAY_BOUNDS.maxLng
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

export default function Norway() {
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
    getTourNames('norway').then(setTourNames).catch(console.error)
  }, [])

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

      // Collect all Norway activities for photo interpolation
      const allActs: ActivityForPhoto[] = allUsers.flatMap(user =>
        user.activities.filter(isInNorway)
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

  const dayTracks = useMemo((): DayTrackGroup[] => {
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
      return [...prev, ...unique]
    })
  }, [])

  const handlePhotoDeleted = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }, [])

  const handlePhotoRenamed = useCallback((photoId: string, newCaption: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption: newCaption } : p))
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

  const startRenamingDay = (date: string) => {
    setEditingDay(date)
    setEditDayName(tourNames.get(date) || '')
  }

  const saveDayName = async (date: string) => {
    const name = editDayName.trim()
    try {
      await saveTourName('norway', date, name)
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

  // Find tour name for a photo by its date
  const handleShowOnMap = useCallback((date: string) => {
    setHiddenDays(new Set(dayTracks.filter(dg => dg.date !== date).map(dg => dg.date)))
    setFocusDay(date)
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setFocusDay(null), 1000)
  }, [dayTracks])

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
        <h1 className="text-3xl md:text-4xl font-bold text-alpine-green mb-2">
          Romsdalsfjorden: Norway
        </h1>
        <p className="text-mountain-gray max-w-3xl text-sm md:text-base">
          Boat-based ski touring in the Romsdal and Sunnmore Alps — steep couloirs, sea-to-summit descents,
          and dramatic fjord landscapes.
        </p>
      </div>

      {/* Interactive Map */}
      <div ref={mapRef} className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Regional Map</h2>
        <div className="h-[350px] md:h-[500px] rounded-lg overflow-hidden">
          <NorwayMap
            className="h-full w-full"
            photos={photos}
            userTracks={userTracks}
            allUserTracks={allUserTracks}
            dayTracks={dayTracks}
            hiddenDays={hiddenDays}
            onToggleDay={handleToggleDay}
            tourNames={tourNames}
            focusDay={focusDay}
            onFullscreenPhoto={setFullscreenPhoto}
          />
        </div>

        {/* Day legend below map */}
        {dayTracks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {dayTracks.map(dg => {
              const customName = tourNames.get(dg.date)

              if (editingDay === dg.date) {
                return (
                  <form
                    key={dg.date}
                    onSubmit={e => { e.preventDefault(); saveDayName(dg.date) }}
                    className="flex items-center gap-1 border border-alpine-green rounded-full px-2 py-1"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dg.color }}></div>
                    <input
                      type="text"
                      value={editDayName}
                      onChange={e => setEditDayName(e.target.value)}
                      placeholder={dg.label}
                      className="text-sm border-none outline-none w-28 bg-transparent"
                      autoFocus
                      onBlur={() => saveDayName(dg.date)}
                    />
                  </form>
                )
              }

              return (
                <div key={dg.date} className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleToggleDay(dg.date)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      hiddenDays.has(dg.date)
                        ? 'opacity-40 border-gray-200 bg-gray-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    title="Click to toggle visibility"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dg.color }}></div>
                    <span>{customName ? `${customName}` : dg.label}</span>
                    {customName && <span className="text-xs text-gray-400">{dg.label}</span>}
                    <span className="text-xs text-gray-400">{dg.tracks.length}</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => startRenamingDay(dg.date)}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Rename tour day"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
          region="norway"
          onActivitySelect={handleActivitySelect}
          onActivitiesLoaded={handleActivitiesLoaded}
          selectedActivityId={selectedActivity?.id}
        />
      </div>

      {/* Photos */}
      <div className="mb-6 md:mb-8">
        <PhotoUpload
          uploaderName={session?.user?.name || 'Anonymous'}
          onPhotosAdded={handlePhotosAdded}
          onPhotoDeleted={handlePhotoDeleted}
          onPhotoRenamed={handlePhotoRenamed}
          activities={currentUserActivities}
          allActivities={allActivitiesForPhotos}
          region="norway"
          userId={currentUserId}
          isAdmin={isAdmin}
        />
      </div>

      {/* Fullscreen photo overlay */}
      {fullscreenPhoto && (
        <FullscreenPhoto
          photo={fullscreenPhoto}
          tourName={getTourNameForPhoto(fullscreenPhoto)}
          onClose={() => setFullscreenPhoto(null)}
        />
      )}
    </div>
  )
}
