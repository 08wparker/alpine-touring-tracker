'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { GeoPhoto } from '@/lib/photoGeo'
import { Trip } from '@/types/trip'

const NorwayMap = dynamic(() => import('@/components/NorwayMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

const PhotoUpload = dynamic(() => import('@/components/PhotoUpload'), { ssr: false })
const TripManager = dynamic(() => import('@/components/TripManager'), { ssr: false })

export default function Norway() {
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)

  const handlePhotosAdded = (newPhotos: GeoPhoto[]) => {
    setPhotos(prev => [...prev, ...newPhotos])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <h1 className="text-4xl font-bold text-alpine-green">
          Romsdalsfjorden: Norway
        </h1>
      </div>
      <p className="text-mountain-gray mb-8 max-w-3xl">
        Boat-based ski touring in the Romsdal and Sunnmore Alps — steep couloirs, sea-to-summit descents,
        and dramatic fjord landscapes. Docking at Andalsnes and Mandalen for day trips to iconic peaks.
      </p>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regional Map</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <NorwayMap className="h-full w-full" photos={photos} trip={activeTrip} />
        </div>
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
