'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'
import { norwayHuts, norwaySummits, norwayTourRoute } from '@/data/norway'
import { Hut, Summit, RouteStage } from '@/data/hauteRoute'
import { loadBulkActivities, type BulkActivity } from '@/lib/bulkDataLoader'
import { GeoPhoto } from '@/lib/photoGeo'
import { Trip } from '@/types/trip'
import PhotoMarker from './PhotoMarker'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// Custom dock/anchor icon for boat docking locations
const dockIcon = new L.DivIcon({
  html: `<div class="dock-marker">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5" r="3" fill="#0369a1" stroke="#ffffff" stroke-width="2"/>
      <path d="M12 8V16" stroke="#0369a1" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M8 12H16" stroke="#0369a1" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M6 18C8 16 10 16 12 18C14 16 16 16 18 18" stroke="#0369a1" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  </div>`,
  className: 'custom-dock-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
})

// Custom summit icon
const summitIcon = new L.DivIcon({
  html: `<div class="summit-marker">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 20H2L12 2Z" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="2" fill="white"/>
    </svg>
  </div>`,
  className: 'custom-summit-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
})

interface NorwayMapProps {
  className?: string
  photos?: GeoPhoto[]
  trip?: Trip | null
}

export default function NorwayMap({ className = '', photos = [], trip }: NorwayMapProps) {
  // Center on Romsdalsfjorden
  const center: LatLngExpression = [62.45, 7.15]
  const zoom = 9

  // State for bulk activities
  const [bulkActivities, setBulkActivities] = useState<BulkActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Load bulk activities on component mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = await loadBulkActivities('norway')
        setBulkActivities(activities)
      } catch (error) {
        console.error('Error loading bulk activities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [])

  // Helper function to create route lines
  const createRouteLines = (stages: RouteStage[], color: string, routeType: string) => {
    return stages.map((stage: RouteStage) => {
      const startHut = norwayHuts.find(h => h.id === stage.startHut)
      const endHut = norwayHuts.find(h => h.id === stage.endHut)

      if (!startHut || !endHut) return null

      // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
      const positions: LatLngExpression[] = [
        [startHut.coordinates[1], startHut.coordinates[0]],
        ...stage.waypoints.map(wp => [wp.coordinates[1], wp.coordinates[0]] as LatLngExpression),
        [endHut.coordinates[1], endHut.coordinates[0]]
      ]

      return {
        id: stage.id,
        positions,
        stage,
        color,
        routeType
      }
    }).filter(Boolean)
  }

  const norwayRouteLines = createRouteLines(norwayTourRoute, '#15803d', 'Romsdalsfjorden Tour')

  // Romsdalsfjorden coastline (simplified)
  const fjordOutline: LatLngExpression[] = [
    [62.70, 6.80],
    [62.60, 7.10],
    [62.55, 7.40],
    [62.50, 7.60],
    [62.45, 7.70],
    [62.40, 7.50],
    [62.35, 7.20],
    [62.30, 6.90],
  ]

  return (
    <div className={`${className} relative`}>
      {/* Route Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-sm">
        <h4 className="font-bold mb-2">Map Features</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-700"></div>
            <span>Romsdalsfjorden Tour</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-orange-500"></div>
            <span>Real GPS Tracks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-400" style={{backgroundImage: 'repeating-linear-gradient(to right, #60a5fa 0px, #60a5fa 3px, transparent 3px, transparent 6px)'}}></div>
            <span>Fjord Coastline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L22 20H2L12 2Z" fill="#dc2626" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
              </svg>
            </div>
            <span>Major Summits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="5" r="3" fill="#0369a1" stroke="#ffffff" strokeWidth="2"/>
                <path d="M6 18C8 16 10 16 12 18C14 16 16 16 18 18" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <span>Boat Docks</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dock markers */}
        {norwayHuts.map((dock: Hut) => (
          <Marker
            key={dock.id}
            position={[dock.coordinates[1], dock.coordinates[0]]}
            icon={dockIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{dock.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Boat dock</p>
                <p className="text-sm mb-2">{dock.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Summit markers */}
        {norwaySummits.map((summit: Summit) => (
          <Marker
            key={summit.id}
            position={[summit.coordinates[1], summit.coordinates[0]]}
            icon={summitIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg text-red-600">{summit.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{summit.elevation}m</p>
                <p className="text-sm mb-2">{summit.description}</p>
                <div className="text-sm">
                  <p><strong>Prominence:</strong> {summit.prominence}m</p>
                  <p><strong>Difficulty:</strong> {summit.difficulty}</p>
                  {summit.firstAscent && <p><strong>First Ascent:</strong> {summit.firstAscent}</p>}
                  <p><strong>Route Access:</strong> {summit.routeAccess.join(', ')}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fjord outline */}
        <Polyline
          positions={fjordOutline}
          color="#60a5fa"
          weight={2}
          opacity={0.5}
          dashArray="6, 6"
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">Romsdalsfjorden</h3>
              <p className="text-sm">One of Norway&apos;s great fjords, surrounded by dramatic alpine peaks</p>
            </div>
          </Popup>
        </Polyline>

        {/* Route lines */}
        {norwayRouteLines.map((route) =>
          route && (
            <Polyline
              key={route.id}
              positions={route.positions}
              color={route.color}
              weight={3}
              opacity={0.8}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{route.stage.name}</h3>
                  <p className="text-sm text-gray-600">{route.routeType} - Day {route.stage.day}</p>
                  <p className="text-sm mb-2">{route.stage.description}</p>
                  <div className="text-sm">
                    <p><strong>Distance:</strong> {route.stage.distance}km</p>
                    <p><strong>Duration:</strong> {route.stage.duration}</p>
                    <p><strong>Difficulty:</strong> {route.stage.difficulty}</p>
                    <p><strong>Elevation gain:</strong> {route.stage.elevationGain}m</p>
                  </div>
                </div>
              </Popup>
            </Polyline>
          )
        )}

        {/* Real GPS tracks from bulk data */}
        {bulkActivities.map((activity) => (
          <Polyline
            key={`bulk-${activity.id}`}
            positions={activity.polyline}
            color="#f97316"
            weight={4}
            opacity={0.9}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{activity.name}</h3>
                <p className="text-sm text-gray-600">Real GPS Track - {activity.track.type}</p>
                <p className="text-sm mb-2">Actual backcountry ski tour from Strava data</p>
                <div className="text-sm">
                  <p><strong>Track Points:</strong> {activity.track.points.length}</p>
                  <p><strong>Activity ID:</strong> {activity.id}</p>
                  {activity.track.points.length > 0 && (
                    <>
                      <p><strong>Start Elevation:</strong> {activity.track.points[0].elevation?.toFixed(0)}m</p>
                      <p><strong>End Elevation:</strong> {activity.track.points[activity.track.points.length - 1].elevation?.toFixed(0)}m</p>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}
        {/* Photo markers */}
        {photos.filter(p => p.coordinates).map(photo => (
          <PhotoMarker key={photo.id} photo={photo} />
        ))}

        {/* Trip participant tracks */}
        {trip?.participants.map(participant =>
          participant.tracks.map(track => (
            <Polyline
              key={track.id}
              positions={track.polyline}
              color={participant.color}
              weight={4}
              opacity={0.9}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{track.name}</h3>
                  <p className="text-sm" style={{ color: participant.color }}>{participant.name}</p>
                  <p className="text-sm text-gray-500">{track.date}</p>
                </div>
              </Popup>
            </Polyline>
          ))
        )}
      </MapContainer>
    </div>
  )
}
