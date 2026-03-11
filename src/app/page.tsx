'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { StravaActivity } from '@/lib/strava'
import UserActivities from '@/components/UserActivities'

const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

export default function Home() {
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | undefined>()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <img 
          src="/matterhorn.jpg" 
          alt="Matterhorn from Domhütte" 
          className="w-24 h-24 flex-shrink-0 rounded-lg object-cover shadow-md"
        />
        <h1 className="text-4xl font-bold text-alpine-green">
          Haute Route: Chamonix to Zermatt
        </h1>
      </div>
      
      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Route Map</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <RouteMap 
            className="h-full w-full" 
            selectedActivity={selectedActivity}
            showUserTracks={true}
          />
        </div>
      </div>
      
    </div>
  )
}