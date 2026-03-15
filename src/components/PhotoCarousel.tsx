'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { GeoPhoto } from '@/lib/photoGeo'

interface DayOption {
  date: string
  label: string
  color: string
}

interface PhotoCarouselProps {
  photos: GeoPhoto[]
  dayOptions: DayOption[]
  tourNames?: Map<string, string>
  onFullscreen?: (photo: GeoPhoto) => void
  onShowOnMap?: (date: string) => void
}

export default function PhotoCarousel({ photos, dayOptions, tourNames = new Map(), onFullscreen, onShowOnMap }: PhotoCarouselProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sort photos by timestamp, filter by selected day
  const filteredPhotos = useMemo(() => {
    let sorted = [...photos].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return ta - tb
    })

    if (selectedDay) {
      sorted = sorted.filter(p => {
        if (!p.timestamp) return false
        const photoDate = new Date(p.timestamp).toISOString().split('T')[0]
        return photoDate === selectedDay
      })
    }

    return sorted
  }, [photos, selectedDay])

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [selectedDay])

  // Auto-play slideshow
  useEffect(() => {
    if (isPlaying && filteredPhotos.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredPhotos.length)
      }, 4000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, filteredPhotos.length])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length)
    setIsPlaying(false)
  }, [filteredPhotos.length])

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filteredPhotos.length)
    setIsPlaying(false)
  }, [filteredPhotos.length])

  if (photos.length === 0) return null

  const currentPhoto = filteredPhotos[currentIndex]
  if (!currentPhoto) return null

  const imgSrc = currentPhoto.storageUrl || currentPhoto.thumbnailUrl || currentPhoto.previewUrl
  const photoDate = currentPhoto.timestamp
    ? new Date(currentPhoto.timestamp).toISOString().split('T')[0]
    : undefined
  const dayTourName = photoDate ? tourNames.get(photoDate) : undefined
  const dayOption = photoDate ? dayOptions.find(d => d.date === photoDate) : undefined

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Photo Gallery</h2>
        <span className="text-sm text-gray-500">{filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Day filter buttons */}
      {dayOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedDay(null)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              selectedDay === null
                ? 'bg-gray-800 text-white border-gray-800'
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            All Days
          </button>
          {dayOptions.map(day => {
            const customName = tourNames.get(day.date)
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedDay === day.date
                    ? 'text-white border-transparent'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                style={selectedDay === day.date ? { backgroundColor: day.color, borderColor: day.color } : undefined}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: day.color }}></div>
                <span>{customName || day.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main carousel */}
      <div className="relative">
        {/* Photo display */}
        <div
          className="relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
          style={{ minHeight: 300 }}
          onClick={() => onFullscreen?.(currentPhoto)}
        >
          <img
            src={imgSrc}
            alt={currentPhoto.caption}
            className="w-full h-auto max-h-[500px] object-contain mx-auto"
          />

          {/* Nav arrows */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}

          {/* Counter badge */}
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {filteredPhotos.length}
          </div>
        </div>

        {/* Caption area */}
        <div className="mt-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold truncate">{currentPhoto.caption}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {dayTourName && dayOption && (
                <span className="text-sm font-medium" style={{ color: dayOption.color }}>
                  {dayTourName} — {dayOption.label}
                </span>
              )}
              {!dayTourName && dayOption && (
                <span className="text-sm font-medium" style={{ color: dayOption.color }}>
                  {dayOption.label}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {currentPhoto.uploaderName}
                {currentPhoto.timestamp && (
                  <span className="ml-1 text-gray-400">
                    {new Date(currentPhoto.timestamp).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            {/* Show on Map button */}
            {onShowOnMap && photoDate && dayOption && (
              <button
                onClick={() => onShowOnMap(photoDate)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Show this day on map"
                style={{ color: dayOption.color }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </button>
            )}

            {/* Play/pause button */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={() => setIsPlaying(prev => !prev)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {filteredPhotos.length > 1 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {filteredPhotos.map((photo, idx) => {
              const src = photo.storageUrl || photo.thumbnailUrl || photo.previewUrl
              return (
                <button
                  key={photo.id}
                  onClick={() => goTo(idx)}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    idx === currentIndex ? 'border-blue-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
