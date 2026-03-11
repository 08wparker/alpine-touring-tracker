'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { GeoPhoto } from '@/lib/photoGeo'
import { Trip } from '@/types/trip'
import { StravaAPI, StravaActivity } from '@/lib/strava'

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

export default function Norway() {
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
    // Decode the polyline and add to tracks
    if (activity.map?.summary_polyline) {
      const api = new StravaAPI(session?.accessToken || '')
      const decoded = api.decodePolyline(activity.map.summary_polyline)
      setUserTracks(prev => {
        // Don't add duplicates
        if (prev.find(t => t.id === activity.id)) return prev
        return [...prev, { id: activity.id, name: activity.name, polyline: decoded }]
      })
    }
  }, [session])

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
          />
        </div>
      </div>

      {/* Strava Activities */}
      <div className="mb-8">
        <UserActivities
          region="norway"
          onActivitySelect={handleActivitySelect}
          selectedActivityId={selectedActivity?.id}
        />
      </div>

      {/* Trip Manager & Photos side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <TripManager region="norway" onTripLoaded={setActiveTrip} />
        <PhotoUpload
          uploaderName={typeof window !== 'undefined' ? localStorage.getItem('touring-user-name') || 'Anonymous' : 'Anonymous'}
          onPhotosAdded={handlePhotosAdded}
        />
      </div>
    </div>
  )
}
