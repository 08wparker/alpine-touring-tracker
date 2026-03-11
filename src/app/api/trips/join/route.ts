import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Trip } from '@/types/trip'

const TRIPS_DIR = path.join(process.cwd(), 'data', 'trips')

// POST /api/trips/join — find trip by join code
export async function POST(request: NextRequest) {
  const { joinCode } = await request.json()

  if (!joinCode) {
    return NextResponse.json({ error: 'joinCode is required' }, { status: 400 })
  }

  if (!fs.existsSync(TRIPS_DIR)) {
    return NextResponse.json({ error: 'No trips found' }, { status: 404 })
  }

  const files = fs.readdirSync(TRIPS_DIR).filter(f => f.endsWith('.json'))
  for (const f of files) {
    const trip: Trip = JSON.parse(fs.readFileSync(path.join(TRIPS_DIR, f), 'utf-8'))
    if (trip.joinCode === joinCode.toUpperCase()) {
      return NextResponse.json(trip)
    }
  }

  return NextResponse.json({ error: 'Trip not found with that code' }, { status: 404 })
}
