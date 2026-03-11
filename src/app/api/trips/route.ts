import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Trip, PARTICIPANT_COLORS } from '@/types/trip'

const TRIPS_DIR = path.join(process.cwd(), 'data', 'trips')

function ensureDir() {
  if (!fs.existsSync(TRIPS_DIR)) {
    fs.mkdirSync(TRIPS_DIR, { recursive: true })
  }
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// GET /api/trips — list all trips
export async function GET() {
  ensureDir()
  const files = fs.readdirSync(TRIPS_DIR).filter(f => f.endsWith('.json'))
  const trips: Trip[] = files.map(f => {
    const data = fs.readFileSync(path.join(TRIPS_DIR, f), 'utf-8')
    return JSON.parse(data)
  })
  return NextResponse.json(trips)
}

// POST /api/trips — create a new trip
export async function POST(request: NextRequest) {
  ensureDir()
  const body = await request.json()
  const { name, region, userName, userId } = body

  if (!name || !region || !userName) {
    return NextResponse.json({ error: 'name, region, and userName are required' }, { status: 400 })
  }

  const trip: Trip = {
    id: `trip-${Date.now()}`,
    name,
    region,
    joinCode: generateCode(),
    createdAt: new Date().toISOString(),
    participants: [
      {
        userId: userId || `user-${Date.now()}`,
        name: userName,
        color: PARTICIPANT_COLORS[0],
        tracks: []
      }
    ],
    photos: []
  }

  fs.writeFileSync(path.join(TRIPS_DIR, `${trip.id}.json`), JSON.stringify(trip, null, 2))
  return NextResponse.json(trip, { status: 201 })
}
