'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trip } from '@/types/trip'
import { UserTrackGroup } from './NorwayMap'

interface TripManagerProps {
  region: string
  onTripLoaded?: (trip: Trip) => void
  allUserTracks?: UserTrackGroup[]
  photoCount?: number
}

export default function TripManager({ region, onTripLoaded, allUserTracks = [], photoCount = 0 }: TripManagerProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [tripName, setTripName] = useState('')
  const [userName, setUserName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const getUserId = useCallback(() => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem('touring-user-id')
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      localStorage.setItem('touring-user-id', id)
    }
    return id
  }, [])

  const getSavedName = useCallback(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('touring-user-name') || ''
  }, [])

  useEffect(() => {
    setUserName(getSavedName())
    fetchTrips()
  }, [getSavedName])

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips')
      const data = await res.json()
      const regionTrips = data.filter((t: Trip) => t.region === region)
      setTrips(regionTrips)

      // Auto-select the most recent trip for this region
      if (regionTrips.length > 0 && !activeTrip) {
        const latest = regionTrips[regionTrips.length - 1]
        setActiveTrip(latest)
        onTripLoaded?.(latest)
      }
    } catch {
      // No trips yet
    }
  }

  const createTrip = async () => {
    if (!tripName || !userName) {
      setError('Please enter trip name and your name')
      return
    }
    setLoading(true)
    setError('')
    try {
      localStorage.setItem('touring-user-name', userName)
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tripName,
          region,
          userName,
          userId: getUserId()
        })
      })
      const trip = await res.json()
      setActiveTrip(trip)
      onTripLoaded?.(trip)
      setShowCreate(false)
      setTripName('')
      fetchTrips()
    } catch {
      setError('Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  const joinTrip = async () => {
    if (!joinCode || !userName) {
      setError('Please enter join code and your name')
      return
    }
    setLoading(true)
    setError('')
    try {
      localStorage.setItem('touring-user-name', userName)
      const findRes = await fetch('/api/trips/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode })
      })
      if (!findRes.ok) {
        setError('Trip not found with that code')
        return
      }
      const foundTrip = await findRes.json()

      const joinRes = await fetch(`/api/trips/${foundTrip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          joinCode: joinCode.toUpperCase(),
          userName,
          userId: getUserId()
        })
      })
      const trip = await joinRes.json()
      setActiveTrip(trip)
      onTripLoaded?.(trip)
      setShowJoin(false)
      setJoinCode('')
      fetchTrips()
    } catch {
      setError('Failed to join trip')
    } finally {
      setLoading(false)
    }
  }

  const copyJoinCode = () => {
    if (!activeTrip) return
    navigator.clipboard.writeText(activeTrip.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Total tracks across all users
  const totalTracks = allUserTracks.reduce((sum, ug) => sum + ug.tracks.length, 0)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Trip Dashboard</h2>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-alpine-green">{allUserTracks.length}</div>
          <div className="text-xs text-mountain-gray">Skiers</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-alpine-green">{totalTracks}</div>
          <div className="text-xs text-mountain-gray">Tracks</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-alpine-green">{photoCount}</div>
          <div className="text-xs text-mountain-gray">Photos</div>
        </div>
      </div>

      {/* Participant list from Firestore */}
      {allUserTracks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-mountain-gray mb-2">Synced Skiers</h4>
          <div className="space-y-2">
            {allUserTracks.map(ug => (
              <div key={ug.userId} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ug.color }}></div>
                <span className="font-medium truncate">{ug.userName}</span>
                <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                  {ug.tracks.length} track{ug.tracks.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active trip with join code */}
      {activeTrip ? (
        <div className="border border-alpine-green/20 rounded-lg p-4 bg-alpine-green/5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold">{activeTrip.name}</h3>
            <button
              onClick={() => { setActiveTrip(null); onTripLoaded?.(null as unknown as Trip) }}
              className="text-xs text-mountain-gray hover:text-red-500"
            >
              Leave
            </button>
          </div>

          {/* Prominent join code */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-mountain-gray">Invite code:</span>
            <span className="font-mono font-bold text-alpine-green text-xl tracking-wider">
              {activeTrip.joinCode}
            </span>
            <button
              onClick={copyJoinCode}
              className="text-xs px-2 py-1 bg-alpine-green text-white rounded hover:bg-alpine-green-dark transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-mountain-gray">
            Share this code with your trip companions so they can join and see each other&apos;s tracks.
          </p>
        </div>
      ) : (
        <div>
          {/* Trip list */}
          {trips.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-mountain-gray mb-2">Your Trips</h4>
              {trips.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTrip(t); onTripLoaded?.(t) }}
                  className="block w-full text-left p-3 rounded border border-gray-200 hover:border-alpine-green mb-2 transition-colors"
                >
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-sm text-mountain-gray ml-2">
                    {t.participants.length} member{t.participants.length !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
              className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark transition-colors text-sm"
            >
              Create Trip
            </button>
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
              className="px-4 py-2 border border-alpine-green text-alpine-green rounded hover:bg-alpine-green hover:text-white transition-colors text-sm"
            >
              Join Trip
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Trip name (e.g. Romsdal March 2026)"
                value={tripName}
                onChange={e => setTripName(e.target.value)}
                className="w-full p-2 border rounded mb-2 text-sm"
              />
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full p-2 border rounded mb-2 text-sm"
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                onClick={createTrip}
                disabled={loading}
                className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark disabled:opacity-50 text-sm"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          )}

          {/* Join form */}
          {showJoin && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Join code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="w-full p-2 border rounded mb-2 font-mono uppercase text-sm"
                maxLength={6}
              />
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full p-2 border rounded mb-2 text-sm"
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                onClick={joinTrip}
                disabled={loading}
                className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark disabled:opacity-50 text-sm"
              >
                {loading ? 'Joining...' : 'Join'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
