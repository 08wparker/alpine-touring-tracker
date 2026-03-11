export interface GPXPoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: string;
}

export interface GPXTrack {
  name: string;
  type: string;
  points: GPXPoint[];
}

export function parseGPX(gpxContent: string): GPXTrack {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
  
  // Get track info
  const trackElement = xmlDoc.querySelector('trk');
  const name = trackElement?.querySelector('name')?.textContent || 'Unknown Track';
  const type = trackElement?.querySelector('type')?.textContent || 'Unknown';
  
  // Get all track points
  const trackPoints = xmlDoc.querySelectorAll('trkpt');
  const points: GPXPoint[] = [];
  
  trackPoints.forEach(point => {
    const lat = parseFloat(point.getAttribute('lat') || '0');
    const lng = parseFloat(point.getAttribute('lon') || '0');
    const elevation = point.querySelector('ele')?.textContent;
    const time = point.querySelector('time')?.textContent;
    
    points.push({
      lat,
      lng,
      elevation: elevation ? parseFloat(elevation) : undefined,
      time: time || undefined,
    });
  });
  
  return {
    name,
    type,
    points,
  };
}

// Helper function to determine which region a track belongs to
export function getRegionForTrack(track: GPXTrack): string | null {
  if (track.points.length === 0) return null;
  
  // Get average coordinates to determine region
  const avgLat = track.points.reduce((sum, p) => sum + p.lat, 0) / track.points.length;
  const avgLng = track.points.reduce((sum, p) => sum + p.lng, 0) / track.points.length;
  
  // Haute Route region (Chamonix to Zermatt)
  if (avgLat >= 45.8 && avgLat <= 46.2 && avgLng >= 6.8 && avgLng <= 7.8) {
    return 'haute-route';
  }
  
  // Berner Oberland region (Jungfrau area)
  if (avgLat >= 46.4 && avgLat <= 46.7 && avgLng >= 7.8 && avgLng <= 8.3) {
    return 'berner-oberland';
  }
  
  // Ortler Group region (South Tyrol)
  if (avgLat >= 46.4 && avgLat <= 46.6 && avgLng >= 10.4 && avgLng <= 10.8) {
    return 'ortler';
  }

  // Silvretta Group region (Austria/Switzerland)
  if (avgLat >= 46.80 && avgLat <= 46.95 && avgLng >= 9.90 && avgLng <= 10.20) {
    return 'silvretta';
  }

  // Norway / Romsdalsfjorden region
  if (avgLat >= 62.0 && avgLat <= 62.8 && avgLng >= 5.5 && avgLng <= 8.0) {
    return 'norway';
  }

  return null;
}

// Convert GPX points to Leaflet polyline format
export function gpxToPolyline(track: GPXTrack): [number, number][] {
  return track.points.map(point => [point.lat, point.lng]);
}