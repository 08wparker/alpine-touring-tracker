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

This is a comprehensive Next.js 14 application for tracking alpine touring routes across four major Alpine regions: Haute Route (France/Switzerland), Berner Oberland (Switzerland), Ortler Group (South Tyrol/Italy), and Silvretta Group (Austria/Switzerland).

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Mapping**: Leaflet with react-leaflet for interactive maps
- **Styling**: TailwindCSS with custom alpine-themed colors
- **Language**: TypeScript with strict mode enabled
- **Font**: Inter from Google Fonts

### Application Structure
- **Multi-region support**: Four separate alpine touring regions
- **Tab-based navigation**: Switch between regions via header navigation
- **Interactive maps**: Leaflet-based maps for each region with custom markers and GPS tracking
- **Strava integration**: Real GPS track data from bulk export analysis
- **Responsive design**: Works on desktop and mobile devices

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
  - `/` - Haute Route (main page)
  - `/berner-oberland/` - Jungfrau region page
  - `/ortler/` - South Tyrol region page
  - `/silvretta/` - Silvretta group page
- `src/components/` - React components including map components
  - `RouteMap.tsx` - Haute Route interactive map with Strava integration
  - `BernerOberlandMap.tsx` - Jungfrau region map with GPS track analysis
  - `OrtlerMap.tsx` - Ortler group map
  - `SilvrettaMap.tsx` - Silvretta group map
- `src/data/` - Static data definitions for all regions
  - `hauteRoute.ts` - Haute Route data and shared interfaces
  - `bernerOberland.ts` - Jungfrau region data
  - `ortler.ts` - Ortler group data
  - `silvretta.ts` - Silvretta group data
- `src/lib/` - Utility libraries
  - `strava.ts` - Strava API integration and activity processing
  - `gpxParser.ts` - GPX file parsing utilities
  - `bulkDataLoader.ts` - Bulk Strava export data handling
  - `mapAnalysis.ts` - GPS-based hut positioning system

### Key Data Models
The application uses consistent data structures across all regions:

- **Hut**: Mountain huts with coordinates, capacity, contact info, and websites
- **Summit**: Mountain peaks with elevation, difficulty, prominence, and access routes
- **RouteStage**: Daily stages with difficulty, waypoints, elevation data, and descriptions
- **Waypoints**: Geographic points marking passes, glaciers, summits, and landmarks

### Interactive Map Features
Each region includes:
- **Hut markers**: Custom house-shaped icons with hut names underneath
  - **Visited huts**: Larger blue icons for huts you stayed at (GPS-detected)
  - **Other huts**: Smaller gray icons for reference huts
- **Summit markers**: Red triangle markers for major peaks
- **GPS tracks**: Orange lines showing actual Strava ski tour routes
- **GPS endpoints**: Red dots showing where tracks actually ended
- **Border visualization**: Dashed lines showing national/regional boundaries
- **Custom legends**: Explaining all map symbols and features
- **Real-time positioning**: Hut icons positioned using GPS track analysis

### Custom Styling
TailwindCSS is configured with alpine-themed colors:
- `alpine-green`: #15803d (primary theme color)
- `alpine-green-light`: #16a34a
- `alpine-green-dark`: #14532d
- `alpine-blue`: #1e40af (legacy)
- `mountain-gray`: #6b7280  
- `snow-white`: #f8fafc

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

### Regional Coverage

**Haute Route (France/Switzerland)**
- 8 mountain huts including Cabane de Prafleuri and Cabane du Mont Fort
- 7 major summits including Pigne d'Arolla and Matterhorn
- Main route (7 stages) + Verbier variant (2 stages)
- France-Switzerland border visualization

**Berner Oberland (Switzerland)**
- 7 key huts from Grindelwald to Jungfraujoch
- 7 iconic peaks including Jungfrau, Mönch, Eiger, and Finsteraarhorn
- Classic 7-day Jungfrau circuit
- UNESCO World Heritage region coverage

**Ortler Group (South Tyrol, Italy)**
- 7 strategic huts including Payerhütte and rifugios
- 7 major summits including Ortler (highest in Eastern Alps)
- 7-day Ortler circuit with two summit attempts
- Trilingual cultural region (German/Italian/Ladin)

**Silvretta Group (Austria/Switzerland)**
- 6 key huts including Wiesbadener Hütte and Jamtalhütte
- 6 major summits including Piz Buin and Fluchthorn
- 7-day Silvretta High Route through both countries
- Classic glacier skiing terrain

### Development Notes
- All map components use dynamic imports with SSR disabled
- Leaflet markers and icons are properly configured for Next.js
- Custom CSS for summit and hut markers includes hover animations
- Each region maintains consistent UI patterns and data structures
- Website links in hut popups open in new tabs
- Route lines include detailed stage information in popups

### Strava Integration & GPS Analysis
- **Bulk export support**: Processes Strava bulk export data from `bulk_export_stava_example/`
- **GPX parsing**: Extracts coordinates, elevation, and timestamps from GPX files
- **Activity filtering**: Identifies backcountry ski activities in relevant alpine regions
- **Hut highlighting**: Track endpoints determine which huts are highlighted as visited
- **Coordinate accuracy**: Fixed coordinates for Hollandia Hut (46°28'31.0"N 7°57'36.9"E) and Finsteraarhornhütte (46°31'18.9"N 8°06'52.7"E)
- **No automatic hut creation**: Removed GPS endpoint detection for creating new huts (users ended tours at summits too)
- **Visual system**: Blue icons show visited huts, gray icons show reference huts based on track proximity

### Key Data Sources
- **Swiss Alpine Club (SAC)**: Official hut coordinates from KMZ export in `hut_geo_info/`
- **Strava bulk export**: Real GPS tracks in `bulk_export_stava_example/export_28330904/`
- **Regional pictures**: Mountain photos in `/pictures/` and `/public/` directories
- **Manual curation**: Route data, hut details, and summit information