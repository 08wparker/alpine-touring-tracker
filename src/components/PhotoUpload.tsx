'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { processPhoto, GeoPhoto, ActivityForPhoto, findBestActivityForPhoto, interpolatePositionOnPolyline } from '@/lib/photoGeo'
import { uploadPhoto } from '@/lib/photoStorage'
import { savePhoto, getRegionPhotos, deletePhoto, updatePhotoCaption } from '@/lib/firestoreCache'

interface PhotoUploadProps {
  uploaderName: string
  onPhotosAdded: (photos: GeoPhoto[]) => void
  onPhotoDeleted?: (photoId: string) => void
  onPhotoRenamed?: (photoId: string, newCaption: string) => void
  activities?: ActivityForPhoto[]
  allActivities?: ActivityForPhoto[]
  region?: string
  userId?: string
  isAdmin?: boolean
}

export default function PhotoUpload({
  uploaderName,
  onPhotosAdded,
  onPhotoDeleted,
  onPhotoRenamed,
  activities = [],
  allActivities = [],
  region = '',
  userId = '',
  isAdmin = false,
}: PhotoUploadProps) {
  const [processing, setProcessing] = useState(false)
  const [photos, setPhotos] = useState<GeoPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loadedFromFirestore, setLoadedFromFirestore] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')

  // Combine all available activities for interpolation (prefer allActivities, fallback to own)
  const interpolationActivities = allActivities.length > 0 ? allActivities : activities

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

  // Re-interpolate photos that have timestamps but no coordinates when activities become available
  useEffect(() => {
    if (interpolationActivities.length === 0 || photos.length === 0) return

    const unlocated = photos.filter(p => p.source === 'none' && p.timestamp)
    if (unlocated.length === 0) return

    let updated = false
    const updatedPhotos = photos.map(photo => {
      if (photo.source !== 'none' || !photo.timestamp) return photo

      const ts = photo.timestamp instanceof Date ? photo.timestamp : new Date(photo.timestamp)
      const activity = findBestActivityForPhoto(ts, interpolationActivities)
      if (!activity) return photo

      const coords = interpolatePositionOnPolyline(
        ts,
        activity.start_date,
        activity.elapsed_time,
        activity.summary_polyline
      )
      if (!coords) return photo

      updated = true
      return { ...photo, coordinates: coords, source: 'interpolated' as const, activityId: activity.id }
    })

    if (updated) {
      setPhotos(updatedPhotos)
      onPhotosAdded(updatedPhotos)

      // Persist updated coordinates to Firestore
      updatedPhotos
        .filter(p => p.source === 'interpolated' && unlocated.some(u => u.id === p.id))
        .forEach(p => {
          savePhoto(p, region).catch(err => console.error('Error updating photo location:', err))
        })
    }
  }, [interpolationActivities, photos.length])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    setProcessing(true)
    try {
      const newPhotos: GeoPhoto[] = []

      for (const file of imageFiles) {
        const photo = await processPhoto(file, uploaderName, [], interpolationActivities)
        photo.userId = userId
        photo.region = region

        try {
          const { storageUrl, thumbnailUrl } = await uploadPhoto(file, userId || 'anonymous', photo.id)
          photo.storageUrl = storageUrl
          photo.thumbnailUrl = thumbnailUrl
        } catch (err) {
          console.error('Error uploading to Storage:', err)
        }

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

  const canManagePhoto = (photo: GeoPhoto) => {
    if (isAdmin) return true
    if (userId && photo.userId === userId) return true
    return false
  }

  const handleDelete = async (photo: GeoPhoto) => {
    if (!confirm(`Delete "${photo.caption}"?`)) return
    try {
      await deletePhoto(photo.id)
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      onPhotoDeleted?.(photo.id)
    } catch (err) {
      console.error('Error deleting photo:', err)
    }
  }

  const startRename = (photo: GeoPhoto) => {
    setEditingId(photo.id)
    setEditCaption(photo.caption)
  }

  const handleRename = async (photoId: string) => {
    if (!editCaption.trim()) return
    try {
      await updatePhotoCaption(photoId, editCaption.trim())
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption: editCaption.trim() } : p))
      onPhotoRenamed?.(photoId, editCaption.trim())
      setEditingId(null)
    } catch (err) {
      console.error('Error renaming photo:', err)
    }
  }

  const sourceLabel = (source: GeoPhoto['source']) => {
    switch (source) {
      case 'exif': return 'Photo GPS'
      case 'gps-match': return 'Track match'
      case 'interpolated': return 'Interpolated'
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
      <h2 className="text-2xl font-semibold mb-4">
        Trip Photos
        {photos.length > 0 && <span className="text-sm text-mountain-gray ml-2">({photos.length})</span>}
      </h2>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
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

              {/* Caption / rename */}
              <div className="mt-1">
                {editingId === photo.id ? (
                  <form onSubmit={e => { e.preventDefault(); handleRename(photo.id) }} className="flex gap-1">
                    <input
                      type="text"
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      className="text-xs border rounded px-1 py-0.5 w-full"
                      autoFocus
                      onBlur={() => handleRename(photo.id)}
                    />
                  </form>
                ) : (
                  <p className="text-xs text-gray-700 truncate">{photo.caption}</p>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${sourceColor(photo.source)}`}>
                    {sourceLabel(photo.source)}
                  </span>
                  {photo.uploaderName && (
                    <span className="text-xs text-gray-400 truncate">{photo.uploaderName}</span>
                  )}
                </div>
              </div>

              {/* Management buttons */}
              {canManagePhoto(photo) && (
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); startRename(photo) }}
                    className="bg-white/90 hover:bg-white rounded p-1 shadow text-xs"
                    title="Rename"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo) }}
                    className="bg-white/90 hover:bg-red-100 rounded p-1 shadow text-red-500 text-xs"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
