'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto } from '@/lib/photoGeo'
import { Trip } from '@/types/trip'
import { StravaAPI, StravaActivity } from '@/lib/strava'

const SilvrettaMap = dynamic(() => import('@/components/SilvrettaMap'), {
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

export default function Silvretta() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)
  const [userTracks, setUserTracks] = useState<DecodedTrack[]>([])

  const handlePhotosAdded = useCallback((newPhotos: GeoPhoto[]) => {
    setPhotos(prev => [...prev, ...newPhotos])
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
        polyline: api.decodePolyline(a.map.summary_polyline)
      }))
    setUserTracks(tracks)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <img
          src="/piz_buin.jpg"
          alt="Piz Buin from Ochsentaler Glacier"
          className="w-24 h-24 flex-shrink-0 rounded-lg object-cover shadow-md"
        />
        <h1 className="text-4xl font-bold text-alpine-green">
          Silvretta Group: Austria-Switzerland
        </h1>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regional Map</h2>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <SilvrettaMap
            className="h-full w-full"
            photos={photos}
            trip={activeTrip}
            userTracks={userTracks}
          />
        </div>
      </div>

      {/* Strava Activities */}
      <div className="mb-8">
        <UserActivities
          region="silvretta"
          onActivitySelect={handleActivitySelect}
          onActivitiesLoaded={handleActivitiesLoaded}
          selectedActivityId={selectedActivity?.id}
        />
      </div>

      {/* Trip Manager & Photos side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <TripManager region="silvretta" onTripLoaded={setActiveTrip} />
        <PhotoUpload
          uploaderName={typeof window !== 'undefined' ? localStorage.getItem('touring-user-name') || 'Anonymous' : 'Anonymous'}
          onPhotosAdded={handlePhotosAdded}
        />
      </div>
    </div>
  )
}
