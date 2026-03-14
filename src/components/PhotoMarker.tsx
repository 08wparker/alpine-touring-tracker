'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { GeoPhoto } from '@/lib/photoGeo'

// Custom camera icon for photo markers
const photoIcon = new L.DivIcon({
  html: `<div class="photo-marker">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="14" rx="2" fill="#7c3aed" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="13" r="4" fill="#ffffff" stroke="#7c3aed" stroke-width="1"/>
      <circle cx="12" cy="13" r="2" fill="#7c3aed"/>
      <path d="M8 6L9 3H15L16 6" stroke="#ffffff" stroke-width="2" fill="#7c3aed"/>
    </svg>
  </div>`,
  className: 'custom-photo-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20]
})

interface PhotoMarkerProps {
  photo: GeoPhoto
}

export default function PhotoMarker({ photo }: PhotoMarkerProps) {
  if (!photo.coordinates) return null

  return (
    <Marker
      position={[photo.coordinates[0], photo.coordinates[1]]}
      icon={photoIcon}
    >
      <Popup>
        <div className="p-1 max-w-[200px]">
          <img
            src={photo.thumbnailUrl || photo.storageUrl || photo.previewUrl}
            alt={photo.caption}
            className="w-full h-auto rounded mb-2"
          />
          <p className="text-sm font-semibold">{photo.caption}</p>
          <p className="text-xs text-gray-500">by {photo.uploaderName}</p>
          {photo.timestamp && (
            <p className="text-xs text-gray-400">
              {photo.timestamp.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Location: {photo.source === 'exif' ? 'Photo GPS' : photo.source === 'interpolated' ? 'Track interpolated' : photo.source === 'gps-match' ? 'Track match' : 'Manual'}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
