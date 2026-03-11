'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { ortlerHuts, ortlerSummits, ortlerCircuitRoute } from '@/data/ortler'
import { Hut, Summit, RouteStage } from '@/data/hauteRoute'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// Custom hut icon
const hutIcon = new L.DivIcon({
  html: `<div class="hut-marker">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      <path d="M9 9H15V13H9V9Z" fill="#ffffff"/>
    </svg>
  </div>`,
  className: 'custom-hut-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
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

interface OrtlerMapProps {
  className?: string
}

export default function OrtlerMap({ className = '' }: OrtlerMapProps) {
  // Center the map on the Ortler region
  const center: LatLngExpression = [46.50, 10.60]
  const zoom = 10

  // Helper function to create route lines
  const createRouteLines = (stages: RouteStage[], color: string, routeType: string) => {
    return stages.map((stage: RouteStage) => {
      const startHut = ortlerHuts.find(h => h.id === stage.startHut)
      const endHut = ortlerHuts.find(h => h.id === stage.endHut)
      
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

  // Create route lines for Ortler circuit
  const ortlerRouteLines = createRouteLines(ortlerCircuitRoute, '#15803d', 'Ortler Circuit')
  
  const allRouteLines = [...ortlerRouteLines]

  // Italy-Austria-Switzerland border coordinates (approximate) in the Ortler region
  const alpineBorder: LatLngExpression[] = [
    [46.4000, 10.4000], // Western approach
    [46.4500, 10.5000], // Stelvio area
    [46.5500, 10.6000], // Central Ortler
    [46.5000, 10.8000], // Eastern peaks
    [46.4500, 10.7500], // Southern border
    [46.4200, 10.6000], // Return to valley
  ]

  return (
    <div className={`${className} relative`}>
      {/* Route Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-sm">
        <h4 className="font-bold mb-2">Map Features</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-700"></div>
            <span>Ortler Circuit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-500" style={{backgroundImage: 'repeating-linear-gradient(to right, #6b7280 0px, #6b7280 3px, transparent 3px, transparent 6px)'}}></div>
            <span>Regional Border</span>
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
                <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z" fill="#2563eb" stroke="#ffffff" strokeWidth="2"/>
                <path d="M9 9H15V13H9V9Z" fill="#ffffff"/>
              </svg>
            </div>
            <span>Mountain Huts</span>
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
        
        {/* Hut markers */}
        {ortlerHuts.map((hut: Hut) => (
          <Marker 
            key={hut.id} 
            position={[hut.coordinates[1], hut.coordinates[0]]}
            icon={hutIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">🏠 {hut.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{hut.elevation}m</p>
                <p className="text-sm mb-2">{hut.description}</p>
                <div className="text-sm">
                  <p><strong>Capacity:</strong> {hut.capacity}</p>
                  <p><strong>Season:</strong> {hut.season}</p>
                  {hut.contact && <p><strong>Contact:</strong> {hut.contact}</p>}
                  {hut.website && (
                    <p><strong>Website:</strong> <a href={hut.website} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Visit Website</a></p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Summit markers */}
        {ortlerSummits.map((summit: Summit) => (
          <Marker 
            key={summit.id} 
            position={[summit.coordinates[1], summit.coordinates[0]]}
            icon={summitIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg text-red-600">⛰️ {summit.name}</h3>
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
        
        {/* Regional Border */}
        <Polyline 
          positions={alpineBorder}
          color="#6b7280"
          weight={2}
          opacity={0.6}
          dashArray="6, 6"
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">Ortler Group Region</h3>
              <p className="text-sm">South Tyrol alpine region, Eastern Alps</p>
            </div>
          </Popup>
        </Polyline>
        
        {/* Route lines */}
        {allRouteLines.map((route) => 
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
      </MapContainer>
    </div>
  )
}