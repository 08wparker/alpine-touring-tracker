'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { processPhoto, GeoPhoto, ActivityForPhoto } from '@/lib/photoGeo'
import { uploadPhoto } from '@/lib/photoStorage'
import { savePhoto, getRegionPhotos } from '@/lib/firestoreCache'

interface PhotoUploadProps {
  uploaderName: string
  onPhotosAdded: (photos: GeoPhoto[]) => void
  activities?: ActivityForPhoto[]
  region?: string
  userId?: string
}

export default function PhotoUpload({
  uploaderName,
  onPhotosAdded,
  activities = [],
  region = '',
  userId = '',
}: PhotoUploadProps) {
  const [processing, setProcessing] = useState(false)
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loadedFromFirestore, setLoadedFromFirestore] = useState(false)

  // Load existing photos from Firestore on mount
  useEffect(() => {
    if (!region || loadedFromFirestore) return
    setLoadedFromFirestore(true)

    getRegionPhotos(region).then(existing => {
      if (existing.length > 0) {
        setPhotos(existing)
        onPhotosAdded(existing)
      }
    }).catch(err => {
      console.error('Error loading photos from Firestore:', err)
    })
  }, [region, loadedFromFirestore, onPhotosAdded])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    setProcessing(true)
    try {
      const newPhotos: GeoPhoto[] = []

      for (const file of imageFiles) {
        // Process photo with interpolation support
        const photo = await processPhoto(file, uploaderName, [], activities)
        photo.userId = userId
        photo.region = region

        // Upload to Firebase Storage (use 'anonymous' folder if no userId)
        try {
          const { storageUrl, thumbnailUrl } = await uploadPhoto(file, userId || 'anonymous', photo.id)
          photo.storageUrl = storageUrl
          photo.thumbnailUrl = thumbnailUrl
        } catch (err) {
          console.error('Error uploading to Storage:', err)
        }

        // Save metadata to Firestore
        if (region) {
          try {
            await savePhoto(photo, region)
          } catch (err) {
            console.error('Error saving photo metadata:', err)
          }
        }

        newPhotos.push(photo)
      }

      setPhotos(prev => [...prev, ...newPhotos])
      onPhotosAdded(newPhotos)
    } catch (error) {
      console.error('Error processing photos:', error)
    } finally {
      setProcessing(false)
    }
  }, [uploaderName, activities, onPhotosAdded, userId, region])

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
      case 'interpolated': return 'Track interpolated'
      case 'manual': return 'Manual'
      case 'none': return 'No location'
    }
  }

  const sourceColor = (source: GeoPhoto['source']) => {
    switch (source) {
      case 'exif': return 'bg-green-100 text-green-700'
      case 'gps-match': return 'bg-blue-100 text-blue-700'
      case 'interpolated': return 'bg-orange-100 text-orange-700'
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
            <span>Processing & uploading photos...</span>
          </div>
        ) : (
          <div>
            <p className="text-mountain-gray">Drop photos here or click to upload</p>
            <p className="text-sm text-gray-400 mt-1">Photos are placed on the map using EXIF GPS or track interpolation</p>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.thumbnailUrl || photo.storageUrl || photo.previewUrl}
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
