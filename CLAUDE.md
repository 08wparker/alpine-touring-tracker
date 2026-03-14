# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Project Architecture

Next.js 14 application for tracking alpine ski touring trips with Strava GPS integration and interactive Leaflet maps. Currently focused on three active regions: **Norway (Romsdalsfjorden)**, **Berner Oberland**, and **Silvretta**. Haute Route and Ortler are archived (components exist but removed from nav).

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Auth**: NextAuth.js with Strava OAuth (token refresh implemented)
- **Mapping**: Leaflet with react-leaflet for interactive maps
- **Styling**: TailwindCSS with custom alpine-themed colors
- **Language**: TypeScript
- **Photo EXIF**: `exifr` for GPS extraction from photos

### Active Pages & Navigation
- `/` — Berner Oberland (home page)
- `/silvretta` — Silvretta Group
- `/norway` — Romsdalsfjorden, Norway (current trip focus)
- Header nav in `src/app/layout.tsx` shows these three tabs

### Directory Structure
- `src/app/` — Next.js App Router pages and layouts
  - `/` and `/berner-oberland/` — Jungfrau region (both render same content)
  - `/norway/` — Norway page with PhotoUpload + TripManager
  - `/silvretta/` — Silvretta page
  - `/ortler/` — Archived (not in nav)
  - `/api/auth/[...nextauth]/` — Strava OAuth with token refresh
  - `/api/trips/` — Trip CRUD (JSON file storage in `data/trips/`)
  - `/api/trips/[id]/` — Single trip operations
  - `/api/trips/join/` — Join trip by code
- `src/components/` — React components
  - `NorwayMap.tsx` — Norway map with dock icons, summits, fjord outline, user tracks
  - `BernerOberlandMap.tsx` — Berner map with visited hut detection from Strava tracks
  - `SilvrettaMap.tsx` — Silvretta map with border visualization
  - `UserActivities.tsx` — Strava activity list with sessionStorage caching
  - `PhotoUpload.tsx` — Drag-and-drop photo upload with EXIF GPS extraction
  - `PhotoMarker.tsx` — Leaflet marker for geo-located photos
  - `TripManager.tsx` — Create/join trips with shareable codes
  - `StravaAuth.tsx` — Login/logout button
  - `AuthProvider.tsx` — NextAuth SessionProvider wrapper
  - `RouteMap.tsx`, `OrtlerMap.tsx` — Archived region maps
- `src/data/` — Static region data (huts, summits, interfaces)
  - `hauteRoute.ts` — Shared `Hut`, `Summit`, `RouteStage` interfaces
  - `bernerOberland.ts`, `silvretta.ts`, `ortler.ts`, `norway.ts`
- `src/lib/` — Utilities
  - `strava.ts` — Strava API client: `getAllActivities()`, region filtering, polyline decoding, ski tour filtering
  - `photoGeo.ts` — EXIF extraction, timestamp-to-track matching, photo processing
- `src/types/`
  - `trip.ts` — Trip, TripParticipant, TripTrack, TripPhoto interfaces
  - `next-auth.d.ts` — NextAuth type extensions

### Strava Integration
- **OAuth**: Strava login via NextAuth with automatic token refresh (6hr expiry)
- **API Client** (`src/lib/strava.ts`): Fetches all activities (paginated, 200/page, up to 30 pages), handles 429 rate limits gracefully
- **Activity Filtering**: By sport type (BackcountrySki, NordicSki, AlpineSki, Walk, Hike) and by region bounding box
- **Caching**: sessionStorage caches all activities; Refresh button clears cache; empty rate-limited results are NOT cached
- **Rate Limits**: Strava allows 100 requests per 15 minutes. With 2400+ activities across 13 pages, a full fetch uses ~13 requests. Avoid repeated fetches.
- **Region Bounds**:
  - Berner Oberland: 46.4-46.7°N, 7.8-8.3°E
  - Silvretta: 46.80-47.25°N, 9.90-10.30°E (widened for Arlberg)
  - Norway: 62.0-62.8°N, 5.5-8.0°E

### Map Features
- **GPS tracks**: Orange polylines from Strava API (decoded from summary_polyline)
- **Summit markers**: Red triangles for major peaks
- **Hut/Dock markers**: Blue house icons (Berner/Silvretta) or anchor icons (Norway boats)
- **Visited hut detection**: BernerOberlandMap checks Strava track endpoints against hut coordinates
- **Photo markers**: Camera icons from PhotoMarker component
- **All maps use dynamic imports with SSR disabled**

### Trip System (Partially Built)
- File-based storage in `data/trips/*.json`
- Create trip → get join code → others join with code
- Each participant has a unique color for their tracks
- TripManager component handles UI; API routes handle persistence
- **Not yet wired to Strava**: Tracks are added manually, not auto-imported

### Photo System (Partially Built)
- `photoGeo.ts` extracts EXIF GPS or matches photo timestamp to nearest GPS track point
- `PhotoUpload.tsx` handles drag-and-drop with processing status
- `PhotoMarker.tsx` renders geo-located photos on the map
- **Client-side only**: Photos stored as blob URLs, lost on refresh

### Custom Styling
- `alpine-green`: #15803d (primary), `alpine-green-light`: #16a34a, `alpine-green-dark`: #14532d
- `mountain-gray`: #6b7280, `snow-white`: #f8fafc
- Path alias: `@/*` → `./src/*`

### Key Constraints
- **No bulk export data**: All GPS data comes from Strava API, not local files
- **Strava rate limits**: Be conservative with API calls; cache aggressively
- **SSR disabled for maps**: Leaflet requires browser APIs
