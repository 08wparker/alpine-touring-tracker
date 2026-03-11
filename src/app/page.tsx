'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { StravaAPI, StravaActivity } from '@/lib/strava'

const BernerOberlandMap = dynamic(() => import('@/components/BernerOberlandMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

const UserActivities = dynamic(() => import('@/components/UserActivities'), { ssr: false })

interface DecodedTrack {
  id: number
  name: string
  polyline: [number, number][]
}

export default function Home() {
  const { data: session } = useSession()
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)
  const [userTracks, setUserTracks] = useState<DecodedTrack[]>([])

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
          src="/jungfrau.jpg"
          alt="Jungfrau massif"
          className="w-24 h-24 flex-shrink-0 rounded-lg object-cover shadow-md"
        />
        <h1 className="text-4xl font-bold text-alpine-green">
          Berner Oberland: Jungfrau Region
        </h1>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regional Map</h2>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <BernerOberlandMap
            className="h-full w-full"
            userTracks={userTracks}
          />
        </div>
      </div>

      {/* Strava Activities */}
      <div className="mb-8">
        <UserActivities
          region="berner-oberland"
          onActivitySelect={handleActivitySelect}
          onActivitiesLoaded={handleActivitiesLoaded}
          selectedActivityId={selectedActivity?.id}
        />
      </div>
    </div>
  )
}
