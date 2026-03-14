'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto, ActivityForPhoto } from '@/lib/photoGeo'
import { StravaAPI, StravaActivity } from '@/lib/strava'

const BernerOberlandMap = dynamic(() => import('@/components/BernerOberlandMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

const UserActivities = dynamic(() => import('@/components/UserActivities'), { ssr: false })
const PhotoUpload = dynamic(() => import('@/components/PhotoUpload'), { ssr: false })
const FullscreenPhoto = dynamic(() => import('@/components/FullscreenPhoto'), { ssr: false })

interface DecodedTrack {
  id: number
  name: string
  polyline: [number, number][]
}

const ADMIN_USER_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean)

export default function BernerOberland() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)
  const [userTracks, setUserTracks] = useState<DecodedTrack[]>([])
  const [currentUserActivities, setCurrentUserActivities] = useState<ActivityForPhoto[]>([])
  const [fullscreenPhoto, setFullscreenPhoto] = useState<GeoPhoto | null>(null)

  const currentUserId = session?.user?.id || ''
  const isAdmin = !!(currentUserId && (
    ADMIN_USER_IDS.includes(currentUserId) ||
    session?.provider === 'strava'
  ))

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

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-6 mb-2">
          <img
            src="/jungfrau.jpg"
            alt="Jungfrau massif"
            className="w-24 h-24 flex-shrink-0 rounded-lg object-cover shadow-md"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-alpine-green">
            Berner Oberland: Jungfrau Region
          </h1>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Regional Map</h2>
        <div className="h-[350px] md:h-[500px] rounded-lg overflow-hidden">
          <BernerOberlandMap
            className="h-full w-full"
            photos={photos}
            userTracks={userTracks}
            onFullscreenPhoto={setFullscreenPhoto}
          />
        </div>
      </div>

      {/* Strava Activities */}
      <div className="mb-6 md:mb-8">
        <UserActivities
          region="berner-oberland"
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
          region="berner-oberland"
          userId={currentUserId}
          isAdmin={isAdmin}
        />
      </div>

      {/* Fullscreen photo overlay */}
      {fullscreenPhoto && (
        <FullscreenPhoto
          photo={fullscreenPhoto}
          onClose={() => setFullscreenPhoto(null)}
        />
      )}
    </div>
  )
}
