'use client'

import { useState, useCallback, useRef } from 'react'
import { processPhoto, GeoPhoto } from '@/lib/photoGeo'

interface PhotoUploadProps {
  uploaderName: string
  onPhotosAdded: (photos: GeoPhoto[]) => void
  trackPoints?: Array<{ lat: number; lng: number; time?: string; elevation?: number }>
}

export default function PhotoUpload({ uploaderName, onPhotosAdded, trackPoints = [] }: PhotoUploadProps) {
  const [processing, setProcessing] = useState(false)
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    setProcessing(true)
    try {
      const newPhotos = await Promise.all(
        imageFiles.map(file => processPhoto(file, uploaderName, trackPoints))
      )
      setPhotos(prev => [...prev, ...newPhotos])
      onPhotosAdded(newPhotos)
    } catch (error) {
      console.error('Error processing photos:', error)
    } finally {
      setProcessing(false)
    }
  }, [uploaderName, trackPoints, onPhotosAdded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const sourceLabel = (source: GeoPhoto['source']) => {
    switch (source) {
      case 'exif': return 'GPS from photo'
      case 'gps-match': return 'Matched to track'
      case 'manual': return 'Manual'
      case 'none': return 'No location'
    }
  }

  const sourceColor = (source: GeoPhoto['source']) => {
    switch (source) {
      case 'exif': return 'bg-green-100 text-green-700'
      case 'gps-match': return 'bg-blue-100 text-blue-700'
      case 'manual': return 'bg-purple-100 text-purple-700'
      case 'none': return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Trip Photos</h2>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-alpine-green bg-alpine-green/5' : 'border-gray-300 hover:border-alpine-green'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={e => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        {processing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-alpine-green"></div>
            <span>Processing photos...</span>
          </div>
        ) : (
          <div>
            <p className="text-mountain-gray">Drop photos here or click to upload</p>
            <p className="text-sm text-gray-400 mt-1">GPS coordinates are automatically extracted from EXIF data</p>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.previewUrl}
                alt={photo.caption}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${sourceColor(photo.source)}`}>
                  {sourceLabel(photo.source)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
