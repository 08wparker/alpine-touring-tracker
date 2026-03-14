'use client'

import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { GeoPhoto } from '@/lib/photoGeo'

function makePhotoIcon(color: string) {
  return new L.DivIcon({
    html: `<div class="photo-marker">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="14" rx="2" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="13" r="4" fill="#ffffff" stroke="${color}" stroke-width="1"/>
        <circle cx="12" cy="13" r="2" fill="${color}"/>
        <path d="M8 6L9 3H15L16 6" stroke="#ffffff" stroke-width="2" fill="${color}"/>
      </svg>
    </div>`,
    className: 'custom-photo-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  })
}

const defaultIcon = makePhotoIcon('#7c3aed')

interface PhotoMarkerProps {
  photo: GeoPhoto
  tourName?: string
  color?: string
  onFullscreen?: (photo: GeoPhoto) => void
}

export default function PhotoMarker({ photo, tourName, color, onFullscreen }: PhotoMarkerProps) {
  const icon = useMemo(() => color ? makePhotoIcon(color) : defaultIcon, [color])

  if (!photo.coordinates) return null
  const imgSrc = photo.storageUrl || photo.thumbnailUrl || photo.previewUrl

  return (
    <Marker
      position={[photo.coordinates[0], photo.coordinates[1]]}
      icon={icon}
    >
      <Popup maxWidth={280} minWidth={200}>
        <div className="p-0">
          <img
            src={imgSrc}
            alt={photo.caption}
            className="w-full h-auto rounded-t cursor-pointer"
            style={{ maxHeight: 200, objectFit: 'cover' }}
            onClick={(e) => {
              e.stopPropagation()
              onFullscreen?.(photo)
            }}
          />
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold leading-tight">{photo.caption}</p>
            {tourName && (
              <p className="text-xs font-medium mt-0.5" style={{ color: color || '#7c3aed' }}>{tourName}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {photo.uploaderName}
              {photo.timestamp && (
                <span className="ml-1 text-gray-400">
                  {photo.timestamp.toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              )}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
