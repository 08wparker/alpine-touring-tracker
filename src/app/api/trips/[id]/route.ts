import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Trip, PARTICIPANT_COLORS } from '@/types/trip'

const TRIPS_DIR = path.join(process.cwd(), 'data', 'trips')

function loadTrip(id: string): Trip | null {
  const filePath = path.join(TRIPS_DIR, `${id}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function saveTrip(trip: Trip) {
  fs.writeFileSync(path.join(TRIPS_DIR, `${trip.id}.json`), JSON.stringify(trip, null, 2))
}

// GET /api/trips/[id] — get trip details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trip = loadTrip(params.id)
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  return NextResponse.json(trip)
}

// PATCH /api/trips/[id] — join trip or add tracks
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trip = loadTrip(params.id)
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  const body = await request.json()

  // Join trip
  if (body.action === 'join') {
    const { joinCode, userName, userId } = body
    if (trip.joinCode !== joinCode) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 403 })
    }
    if (trip.participants.find(p => p.userId === userId)) {
      return NextResponse.json(trip) // Already joined
    }
    trip.participants.push({
      userId: userId || `user-${Date.now()}`,
      name: userName,
      color: PARTICIPANT_COLORS[trip.participants.length % PARTICIPANT_COLORS.length],
      tracks: []
    })
    saveTrip(trip)
    return NextResponse.json(trip)
  }

  // Add track
  if (body.action === 'addTrack') {
    const { userId, track } = body
    const participant = trip.participants.find(p => p.userId === userId)
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }
    participant.tracks.push(track)
    saveTrip(trip)
    return NextResponse.json(trip)
  }

  // Add photo
  if (body.action === 'addPhoto') {
    const photo = body.photo
    trip.photos.push(photo)
    saveTrip(trip)
    return NextResponse.json(trip)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
