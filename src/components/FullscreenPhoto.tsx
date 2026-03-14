'use client'

import { useEffect } from 'react'
import { GeoPhoto } from '@/lib/photoGeo'

export default function FullscreenPhoto({
  photo,
  tourName,
  onClose,
}: {
  photo: GeoPhoto
  tourName?: string
  onClose: () => void
}) {
  const imgSrc = photo.storageUrl || photo.thumbnailUrl || photo.previewUrl

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[2000] flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10"
      >
        &times;
      </button>

      <img
        src={imgSrc}
        alt={photo.caption}
        className="max-h-[80vh] max-w-[95vw] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />

      <div className="text-center mt-4 px-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-white text-xl font-semibold">{photo.caption}</h2>
        {tourName && (
          <p className="text-purple-300 text-sm mt-1">{tourName}</p>
        )}
        <p className="text-white/60 text-sm mt-1">
          {photo.uploaderName}
          {photo.timestamp && (
            <span className="ml-2">
              {photo.timestamp.toLocaleString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit'
              })}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
