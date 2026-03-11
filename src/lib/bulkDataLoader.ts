import { parseGPX, getRegionForTrack, type GPXTrack } from './gpxParser';

// Known backcountry ski activities from the bulk export that are in our regions
const RELEVANT_ACTIVITIES = [
  {
    id: '8906999643',
    name: 'Epic day 1 in the Berner',
    filename: 'activities/8906999643.gpx',
    region: 'berner-oberland'
  },
  {
    id: '8918870224', 
    name: 'Trugberg- Berner day 3',
    filename: 'activities/8918870224.gpx',
    region: 'berner-oberland'
  },
  {
    id: '8923545365',
    name: 'Morning Backcountry Ski',
    filename: 'activities/8923545365.gpx',
    region: 'berner-oberland'
  },
  {
    id: '8934764294',
    name: 'Afternoon Backcountry Ski',
    filename: 'activities/8934764294.gpx',
    region: 'berner-oberland'
  },
  {
    id: '8934764827',
    name: 'Exit from Berner Oberland',
    filename: 'activities/8934764827.gpx',
    region: 'berner-oberland'
  }
];

export interface BulkActivity {
  id: string;
  name: string;
  region: string;
  track: GPXTrack;
  polyline: [number, number][];
}

export async function loadBulkActivities(region: string): Promise<BulkActivity[]> {
  const activities: BulkActivity[] = [];
  
  // Filter activities for the requested region
  const regionActivities = RELEVANT_ACTIVITIES.filter(activity => activity.region === region);
  
  for (const activity of regionActivities) {
    try {
      // Load the GPX file from the public directory
      const gpxPath = `/gpx/${activity.id}.gpx`;
      const response = await fetch(gpxPath);
      
      if (!response.ok) {
        console.warn(`Failed to load GPX file: ${gpxPath}`);
        continue;
      }
      
      const gpxContent = await response.text();
      const track = parseGPX(gpxContent);
      
      // Verify the track is in the expected region
      const detectedRegion = getRegionForTrack(track);
      if (detectedRegion !== region) {
        console.warn(`Track ${activity.name} detected in ${detectedRegion}, expected ${region}`);
      }
      
      activities.push({
        id: activity.id,
        name: activity.name,
        region: activity.region,
        track,
        polyline: track.points.map(p => [p.lat, p.lng])
      });
      
    } catch (error) {
      console.error(`Error loading activity ${activity.name}:`, error);
    }
  }
  
  return activities;
}

// For static loading during development, we'll copy the GPX files to the public directory
export function getStaticBulkActivities(region: string): BulkActivity[] {
  // This will be populated with pre-parsed data for static use
  const staticData: Record<string, BulkActivity[]> = {
    'berner-oberland': [
      {
        id: '8906999643',
        name: 'Epic day 1 in the Berner',
        region: 'berner-oberland',
        track: { name: 'Epic day 1 in the Berner', type: 'BackcountrySki', points: [] },
        polyline: [] // Will be populated with actual GPX data
      }
    ]
  };
  
  return staticData[region] || [];
}