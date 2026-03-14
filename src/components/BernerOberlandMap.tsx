'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { bernerOberlandHuts, bernerOberlandSummits } from '@/data/bernerOberland'
import { Summit } from '@/data/hauteRoute'
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

// Custom hut icon (regular huts)
const hutIcon = new L.DivIcon({
  html: `<div class="hut-marker">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z" fill="#94a3b8" stroke="#ffffff" stroke-width="2"/>
      <path d="M9 9H15V13H9V9Z" fill="#ffffff"/>
    </svg>
  </div>`,
  className: 'custom-hut-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20]
})

// Custom visited hut icon (highlighted)
const visitedHutIcon = new L.DivIcon({
  html: `<div class="visited-hut-marker">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      <path d="M9 9H15V13H9V9Z" fill="#ffffff"/>
    </svg>
  </div>`,
  className: 'custom-visited-hut-icon',
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

interface DecodedTrack {
  id: number
  name: string
  polyline: [number, number][]
}

interface BernerOberlandMapProps {
  className?: string
  photos?: GeoPhoto[]
  trip?: Trip | null
  userTracks?: DecodedTrack[]
}

export default function BernerOberlandMap({ className = '', photos = [], trip, userTracks = [] }: BernerOberlandMapProps) {
  // Center the map on the Jungfrau region
  const center: LatLngExpression = [46.55, 8.05]
  const zoom = 10

  // Determine visited huts based on user track endpoints
  const getVisitedHuts = () => {
    const visitedHutIds = new Set<string>()

    userTracks.forEach(track => {
      if (track.polyline.length > 0) {
        const endPoint = track.polyline[track.polyline.length - 1]

        bernerOberlandHuts.forEach(hut => {
          const hutLat = hut.coordinates[1]
          const hutLng = hut.coordinates[0]
          const distance = getDistance(endPoint[0], endPoint[1], hutLat, hutLng)

          if (distance < 0.3) {
            visitedHutIds.add(hut.id)
          }
        })
      }
    })

    return visitedHutIds
  }

  // Helper function to calculate distance in kilometers
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const visitedHuts = getVisitedHuts()

  // Switzerland border coordinates (approximate) in the Bernese region
  const swissBorder: LatLngExpression[] = [
    [46.4000, 7.8000],
    [46.4500, 8.0000],
    [46.5000, 8.2000],
    [46.6000, 8.3000],
    [46.6500, 8.1000],
    [46.6000, 7.9000],
  ]

  return (
    <div className={`${className} relative`}>
      {/* Route Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-sm">
        <h4 className="font-bold mb-2">Map Features</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-orange-500"></div>
            <span>Real GPS Tracks</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z" fill="#2563eb" stroke="#ffffff" strokeWidth="2"/>
                <path d="M9 9H15V13H9V9Z" fill="#ffffff"/>
              </svg>
            </div>
            <span>Huts You Stayed At</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z" fill="#94a3b8" stroke="#ffffff" strokeWidth="2"/>
                <path d="M9 9H15V13H9V9Z" fill="#ffffff"/>
              </svg>
            </div>
            <span>Other Huts</span>
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
        {bernerOberlandHuts.map((hut: any) => {
          const isVisited = visitedHuts.has(hut.id)
          const iconToUse = isVisited ? visitedHutIcon : hutIcon

          return (
            <Marker
              key={hut.id}
              position={[hut.coordinates[1], hut.coordinates[0]]}
              icon={iconToUse}
            >
              <Tooltip
                permanent
                direction="bottom"
                offset={[0, 10]}
                className={`hut-label ${isVisited ? 'visited-hut-label' : 'unvisited-hut-label'}`}
              >
                <span className={`text-xs font-semibold ${isVisited ? 'text-blue-800' : 'text-gray-600'}`}>
                  {hut.name}
                </span>
              </Tooltip>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">
                    {isVisited ? '' : ''}{hut.name}
                  </h3>
                  {isVisited && <p className="text-sm text-green-600 font-semibold mb-2">You stayed here!</p>}
                  <p className="text-sm text-gray-600 mb-2">{hut.elevation}m</p>
                  <p className="text-sm mb-2">{hut.description}</p>
                  <div className="text-sm">
                    {hut.capacity > 0 && <p><strong>Capacity:</strong> {hut.capacity}</p>}
                    {hut.season && <p><strong>Season:</strong> {hut.season}</p>}
                    {hut.contact && <p><strong>Contact:</strong> {hut.contact}</p>}
                    {hut.website && (
                      <p><strong>Website:</strong> <a href={hut.website} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Visit Website</a></p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Summit markers */}
        {bernerOberlandSummits.map((summit: Summit) => (
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

        {/* Regional Border */}
        <Polyline
          positions={swissBorder}
          color="#6b7280"
          weight={2}
          opacity={0.6}
          dashArray="6, 6"
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">Bernese Oberland Region</h3>
              <p className="text-sm">High alpine region of the Bernese Alps</p>
            </div>
          </Popup>
        </Polyline>

        {/* User Strava tracks */}
        {userTracks.map(track => (
          <Polyline
            key={`user-${track.id}`}
            positions={track.polyline}
            color="#f97316"
            weight={4}
            opacity={0.9}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{track.name}</h3>
                <p className="text-sm text-gray-600">Strava GPS Track</p>
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
