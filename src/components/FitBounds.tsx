'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface FitBoundsProps {
  tracks: { polyline: [number, number][] }[]
  padding?: [number, number]
}

export default function FitBounds({ tracks, padding = [30, 30] }: FitBoundsProps) {
  const map = useMap()

  useEffect(() => {
    const allPoints: [number, number][] = tracks.flatMap(t => t.polyline)
    if (allPoints.length === 0) return

    const bounds = L.latLngBounds(allPoints.map(([lat, lng]) => [lat, lng]))
    map.fitBounds(bounds, { padding })
  }, [map, tracks, padding])

  return null
}
