'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { hauteRouteHuts, hauteRouteStages, verbierVariantStages, hautRouteSummits, Hut, RouteStage, Summit } from '@/data/hauteRoute'
import { StravaActivity, StravaAPI } from '@/lib/strava'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

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

interface RouteMapProps {
  className?: string
  selectedActivity?: StravaActivity
  showUserTracks?: boolean
}

export default function RouteMap({ className = '', selectedActivity, showUserTracks = true }: RouteMapProps) {
  const { data: session } = useSession()
  const [userActivities, setUserActivities] = useState<StravaActivity[]>([])
  
  // Center the map on the Haute Route area (between Chamonix and Zermatt)
  const center: LatLngExpression = [46.0, 7.4]
  const zoom = 9

  // Fetch user activities when session is available
  useEffect(() => {
    if (session?.accessToken && showUserTracks) {
      fetchUserActivities()
    }
  }, [session, showUserTracks])

  const fetchUserActivities = async () => {
    if (!session?.accessToken) return
    
    try {
      const stravaAPI = new StravaAPI(session.accessToken)
      const activities = await stravaAPI.getRecentActivities(12)
      const skiTourActivities = stravaAPI.filterSkiTouringActivities(activities)
      const regionActivities = stravaAPI.filterActivitiesByRegion(skiTourActivities, 'haute-route')
      setUserActivities(regionActivities)
    } catch (error) {
      console.error('Error fetching user activities:', error)
    }
  }

  // Helper function to create route lines
  const createRouteLines = (stages: RouteStage[], color: string, routeType: string) => {
    return stages.map((stage: RouteStage) => {
      const startHut = hauteRouteHuts.find(h => h.id === stage.startHut)
      const endHut = hauteRouteHuts.find(h => h.id === stage.endHut)
      
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

  // Create route lines for both main route and Verbier variant
  const mainRouteLines = createRouteLines(hauteRouteStages, '#15803d', 'Main Route')
  const verbierRouteLines = createRouteLines(verbierVariantStages, '#dc2626', 'Verbier Variant')
  
  const allRouteLines = [...mainRouteLines, ...verbierRouteLines]

  // France-Switzerland border coordinates (approximate) in the alpine region
  const franceSwitzerBorder: LatLngExpression[] = [
    [46.2500, 6.9000], // Near Geneva
    [46.1800, 7.0000], // Chamonix area
    [46.0700, 7.1000], // Towards Martigny
    [46.0300, 7.1500], // Swiss border near Verbier
    [45.9800, 7.3000], // Near Gran San Bernardo
    [45.9500, 7.4000], // Valle d'Aosta border
    [45.9700, 7.6000], // Towards Zermatt
    [46.0500, 7.8000], // Near Zermatt
    [46.1200, 7.9000], // Monte Rosa area
    [46.2000, 8.0000], // Continuing east
  ]

  return (
    <div className={`${className} relative`}>
      {/* Route Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-sm">
        <h4 className="font-bold mb-2">Routes</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-700"></div>
            <span>Main Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-600" style={{backgroundImage: 'repeating-linear-gradient(to right, #dc2626 0px, #dc2626 5px, transparent 5px, transparent 10px)'}}></div>
            <span>Verbier Variant</span>
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
          {showUserTracks && session && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500"></div>
              <span>Your Ski Tours</span>
            </div>
          )}
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
        {hautRouteSummits.map((summit: Summit) => (
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
        
        {/* Route lines */}
        {allRouteLines.map((route) => 
          route && (
            <Polyline 
              key={route.id}
              positions={route.positions}
              color={route.color}
              weight={3}
              opacity={0.8}
              dashArray={route.routeType === 'Verbier Variant' ? '10, 10' : undefined}
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

        {/* User Activity Tracks */}
        {showUserTracks && userActivities.map((activity) => {
          if (!activity.map?.summary_polyline) return null
          
          const stravaAPI = new StravaAPI('') // No token needed for decoding
          const coordinates = stravaAPI.decodePolyline(activity.map.summary_polyline)
          
          if (coordinates.length === 0) return null
          
          const isSelected = selectedActivity?.id === activity.id
          
          return (
            <Polyline
              key={`user-activity-${activity.id}`}
              positions={coordinates}
              color={isSelected ? '#ff6b35' : '#ff9500'}
              weight={isSelected ? 4 : 3}
              opacity={isSelected ? 0.9 : 0.7}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-orange-600">🎿 {activity.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(activity.start_date_local).toLocaleDateString()}
                  </p>
                  <div className="text-sm">
                    <p><strong>Distance:</strong> {(activity.distance / 1000).toFixed(1)}km</p>
                    <p><strong>Elevation gain:</strong> {Math.round(activity.total_elevation_gain)}m</p>
                    <p><strong>Duration:</strong> {Math.floor(activity.moving_time / 3600)}h {Math.floor((activity.moving_time % 3600) / 60)}m</p>
                    <p><strong>Type:</strong> {activity.sport_type || activity.type}</p>
                  </div>
                </div>
              </Popup>
            </Polyline>
          )
        })}

        {/* Selected Activity Track (highlighted) */}
        {selectedActivity?.map?.summary_polyline && (
          (() => {
            const stravaAPI = new StravaAPI('')
            const coordinates = stravaAPI.decodePolyline(selectedActivity.map.summary_polyline)
            
            if (coordinates.length === 0) return null
            
            return (
              <Polyline
                key={`selected-activity-${selectedActivity.id}`}
                positions={coordinates}
                color="#ff4500"
                weight={5}
                opacity={1}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-orange-600">🎿 {selectedActivity.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Selected Activity</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(selectedActivity.start_date_local).toLocaleDateString()}
                    </p>
                    <div className="text-sm">
                      <p><strong>Distance:</strong> {(selectedActivity.distance / 1000).toFixed(1)}km</p>
                      <p><strong>Elevation gain:</strong> {Math.round(selectedActivity.total_elevation_gain)}m</p>
                      <p><strong>Duration:</strong> {Math.floor(selectedActivity.moving_time / 3600)}h {Math.floor((selectedActivity.moving_time % 3600) / 60)}m</p>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            )
          })()
        )}
      </MapContainer>
    </div>
  )
}