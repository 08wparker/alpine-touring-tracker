'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trip } from '@/types/trip'

interface TripManagerProps {
  region: string
  onTripLoaded?: (trip: Trip) => void
}

export default function TripManager({ region, onTripLoaded }: TripManagerProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [tripName, setTripName] = useState('')
  const [userName, setUserName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Generate a stable user ID
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
      setTrips(data.filter((t: Trip) => t.region === region))
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
      // Find trip by code
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

      // Join the trip
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Trip Groups</h2>

      {activeTrip ? (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{activeTrip.name}</h3>
              <p className="text-sm text-mountain-gray">
                Share code: <span className="font-mono font-bold text-alpine-green text-lg">{activeTrip.joinCode}</span>
              </p>
            </div>
            <button
              onClick={() => { setActiveTrip(null); onTripLoaded?.(null as unknown as Trip) }}
              className="text-sm text-mountain-gray hover:text-red-500"
            >
              Leave view
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-mountain-gray">Participants</h4>
            {activeTrip.participants.map(p => (
              <div key={p.userId} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="text-sm">{p.name}</span>
                <span className="text-xs text-gray-400">({p.tracks.length} tracks)</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Trip list for this region */}
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
                    {t.participants.length} participant{t.participants.length !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
              className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark transition-colors"
            >
              Create Trip
            </button>
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
              className="px-4 py-2 border border-alpine-green text-alpine-green rounded hover:bg-alpine-green hover:text-white transition-colors"
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
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                onClick={createTrip}
                disabled={loading}
                className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark disabled:opacity-50"
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
                className="w-full p-2 border rounded mb-2 font-mono uppercase"
                maxLength={6}
              />
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                onClick={joinTrip}
                disabled={loading}
                className="px-4 py-2 bg-alpine-green text-white rounded hover:bg-alpine-green-dark disabled:opacity-50"
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
