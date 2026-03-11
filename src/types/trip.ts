export interface TripParticipant {
  userId: string
  name: string
  profileImage?: string
  color: string
  tracks: TripTrack[]
}

export interface TripTrack {
  id: string
  name: string
  date: string
  polyline: [number, number][]  // [lat, lng][] for Leaflet
  elevationGain?: number
  distance?: number
}

export interface TripPhoto {
  id: string
  coordinates?: [number, number]  // [lat, lng]
  timestamp?: string
  caption: string
  uploaderName: string
  source: 'exif' | 'gps-match' | 'manual' | 'none'
  // Photo data stored as base64 data URL for simplicity
  dataUrl?: string
}

export interface Trip {
  id: string
  name: string
  region: string
  joinCode: string
  createdAt: string
  participants: TripParticipant[]
  photos: TripPhoto[]
}

// Colors assigned to participants in order
export const PARTICIPANT_COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
]
