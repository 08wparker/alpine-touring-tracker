'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { hauteRouteHuts, hautRouteSummits, Hut, Summit } from '@/data/hauteRoute'
import { loadBulkActivities, type BulkActivity } from '@/lib/bulkDataLoader'
import { useState, useEffect } from 'react'
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

interface DecodedTrack {
  id: number
  name: string
  polyline: [number, number][]
}

interface RouteMapProps {
  className?: string
  photos?: GeoPhoto[]
  trip?: Trip | null
  userTracks?: DecodedTrack[]
}

export default function RouteMap({ className = '', photos = [], trip, userTracks = [] }: RouteMapProps) {
  // Center the map on the Haute Route area (between Chamonix and Zermatt)
  const center: LatLngExpression = [46.0, 7.4]
  const zoom = 9

  // State for bulk activities
  const [bulkActivities, setBulkActivities] = useState<BulkActivity[]>([])

  // Load bulk activities on component mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = await loadBulkActivities('haute-route')
        setBulkActivities(activities)
      } catch (error) {
        console.error('Error loading bulk activities:', error)
      }
    }
    loadActivities()
  }, [])

  // France-Switzerland border coordinates (approximate) in the alpine region
  const franceSwitzerBorder: LatLngExpression[] = [
    [46.2500, 6.9000],
    [46.1800, 7.0000],
    [46.0700, 7.1000],
    [46.0300, 7.1500],
    [45.9800, 7.3000],
    [45.9500, 7.4000],
    [45.9700, 7.6000],
    [46.0500, 7.8000],
    [46.1200, 7.9000],
    [46.2000, 8.0000],
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
            <span>FR/CH Border</span>
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
        {hauteRouteHuts.map((hut: Hut) => (
          <Marker
            key={hut.id}
            position={[hut.coordinates[1], hut.coordinates[0]]}
            icon={hutIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{hut.name}</h3>
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
        {hautRouteSummits.map((summit: Summit) => (
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

        {/* France-Switzerland Border */}
        <Polyline
          positions={franceSwitzerBorder}
          color="#6b7280"
          weight={2}
          opacity={0.6}
          dashArray="6, 6"
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">France-Switzerland Border</h3>
              <p className="text-sm">International boundary through the Alps</p>
            </div>
          </Popup>
        </Polyline>

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
                <div className="text-sm">
                  <p><strong>Track Points:</strong> {activity.track.points.length}</p>
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
