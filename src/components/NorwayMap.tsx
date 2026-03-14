'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'

import { norwayHuts, norwaySummits } from '@/data/norway'
import { Hut, Summit } from '@/data/hauteRoute'
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

interface DecodedTrack {
  id: number
  name: string
  date?: string  // ISO date string for day grouping
  polyline: [number, number][]
}

export interface DayTrackGroup {
  date: string       // e.g. "2026-03-14"
  label: string      // e.g. "Mar 14"
  color: string
  tracks: DecodedTrack[]
}

export interface UserTrackGroup {
  userId: string
  userName: string
  color: string
  tracks: DecodedTrack[]
}

interface NorwayMapProps {
  className?: string
  photos?: GeoPhoto[]
  trip?: Trip | null
  userTracks?: DecodedTrack[]
  allUserTracks?: UserTrackGroup[]
  dayTracks?: DayTrackGroup[]
  hiddenDays?: Set<string>
  onToggleDay?: (date: string) => void
  hiddenUserIds?: Set<string>
  onToggleUser?: (userId: string) => void
}

export default function NorwayMap({ className = '', photos = [], trip, userTracks = [], allUserTracks = [], dayTracks = [], hiddenDays = new Set(), onToggleDay, hiddenUserIds = new Set(), onToggleUser }: NorwayMapProps) {
  // Center on Romsdalsfjorden area
  const center: LatLngExpression = [62.52, 7.65]
  const zoom = 9

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

        {/* Day-colored Strava tracks */}
        {dayTracks.filter(dg => !hiddenDays.has(dg.date)).map(dayGroup =>
          dayGroup.tracks.map(track => (
            <Polyline
              key={`day-${track.id}`}
              positions={track.polyline}
              color={dayGroup.color}
              weight={4}
              opacity={0.9}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{track.name}</h3>
                  <p className="text-sm" style={{ color: dayGroup.color }}>{dayGroup.label}</p>
                </div>
              </Popup>
            </Polyline>
          ))
        )}

        {/* Fallback: user-colored tracks (when no day data) */}
        {dayTracks.length === 0 && allUserTracks.filter(ug => !hiddenUserIds.has(ug.userId)).map(userGroup =>
          userGroup.tracks.map(track => (
            <Polyline
              key={`${userGroup.userId}-${track.id}`}
              positions={track.polyline}
              color={userGroup.color}
              weight={4}
              opacity={0.9}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{track.name}</h3>
                  <p className="text-sm" style={{ color: userGroup.color }}>by {userGroup.userName}</p>
                </div>
              </Popup>
            </Polyline>
          ))
        )}

        {/* Legacy single-user tracks (fallback) */}
        {allUserTracks.length === 0 && userTracks.map(track => (
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
