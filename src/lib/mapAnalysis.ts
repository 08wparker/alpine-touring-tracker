import { type BulkActivity } from './bulkDataLoader';

export interface GPSEndpoint {
  lat: number;
  lng: number;
  activityName: string;
  activityId: string;
}

export interface DetectedHut {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  confidence: number;
  sourceActivities: string[];
  visitedByGPS: boolean;
}

/**
 * Analyzes GPS track endpoints to find potential hut locations
 */
export class GPSHutDetector {
  private activities: BulkActivity[] = [];
  
  constructor(activities: BulkActivity[]) {
    this.activities = activities;
  }

  /**
   * Extract GPS endpoints that are likely to be at huts
   */
  getGPSEndpoints(): GPSEndpoint[] {
    const endpoints: GPSEndpoint[] = [];
    
    this.activities.forEach(activity => {
      // Skip exit/descent activities that don't end at huts
      const isExitDay = activity.name.toLowerCase().includes('exit') || 
                       activity.name.toLowerCase().includes('descent') ||
                       activity.name.toLowerCase().includes('return') ||
                       activity.name.toLowerCase().includes('out');
      
      if (activity.track.points.length > 0 && !isExitDay) {
        const endPoint = activity.track.points[activity.track.points.length - 1];
        
        endpoints.push({
          lat: endPoint.lat,
          lng: endPoint.lng,
          activityName: activity.name,
          activityId: activity.id
        });
      }
    });
    
    return endpoints;
  }

  /**
   * Cluster nearby GPS endpoints that likely represent the same hut
   */
  clusterEndpoints(endpoints: GPSEndpoint[], maxDistance = 0.1): GPSEndpoint[][] {
    const clusters: GPSEndpoint[][] = [];
    const used = new Set<number>();
    
    endpoints.forEach((endpoint, i) => {
      if (used.has(i)) return;
      
      const cluster = [endpoint];
      used.add(i);
      
      // Find nearby endpoints
      endpoints.forEach((other, j) => {
        if (i !== j && !used.has(j)) {
          const distance = this.calculateDistance(
            endpoint.lat, endpoint.lng,
            other.lat, other.lng
          );
          
          if (distance <= maxDistance) {
            cluster.push(other);
            used.add(j);
          }
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Generate detected huts from GPS data
   */
  detectHutsFromGPS(): DetectedHut[] {
    const endpoints = this.getGPSEndpoints();
    const clusters = this.clusterEndpoints(endpoints);
    
    const detectedHuts: DetectedHut[] = [];
    
    clusters.forEach((cluster, index) => {
      // Calculate centroid of cluster
      const avgLat = cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, p) => sum + p.lng, 0) / cluster.length;
      
      // Extract hut name from activity names
      const hutName = this.extractHutNameFromActivities(cluster.map(c => c.activityName));
      
      detectedHuts.push({
        id: `gps-detected-${index}`,
        name: hutName,
        coordinates: [avgLng, avgLat],
        confidence: Math.min(cluster.length / 3, 1), // Higher confidence with more visits
        sourceActivities: cluster.map(c => c.activityName),
        visitedByGPS: true
      });
    });
    
    return detectedHuts;
  }

  /**
   * Extract likely hut name from activity names
   */
  private extractHutNameFromActivities(activityNames: string[]): string {
    // Common patterns in activity names that might indicate destinations
    const patterns = [
      /to ([A-Za-zäöüÄÖÜ]+(?:hütte|hut|hutte))/i,
      /([A-Za-zäöüÄÖÜ]+(?:hütte|hut|hutte))/i,
      /day \d+ in the ([A-Za-z\s]+)/i,
      /([A-Za-z\s]+) day \d+/i
    ];
    
    // Try to extract hut names from activity names
    for (const activityName of activityNames) {
      for (const pattern of patterns) {
        const match = activityName.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    
    // Fallback: use a generic name based on activities
    if (activityNames.length === 1) {
      return `Hut (${activityNames[0]})`;
    } else {
      return `Mountain Hut (${activityNames.length} visits)`;
    }
  }

  /**
   * Get map tile URL for a given coordinate
   */
  getMapTileInfo(lat: number, lng: number, zoom: number = 15) {
    // Convert lat/lng to tile coordinates
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return {
      tileUrl: `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
      tileX: x,
      tileY: y,
      zoom: zoom
    };
  }
}

/**
 * Merge GPS-detected huts with existing hut data
 */
export function mergeHutData(existingHuts: any[], gpsDetectedHuts: DetectedHut[]): any[] {
  const mergedHuts = [...existingHuts];
  
  gpsDetectedHuts.forEach(gpsHut => {
    // Check if this GPS hut is close to any existing hut
    const nearbyExisting = existingHuts.find(existing => {
      const distance = new GPSHutDetector([]).calculateDistance(
        gpsHut.coordinates[1], gpsHut.coordinates[0],
        existing.coordinates[1], existing.coordinates[0]
      );
      return distance < 0.5; // Within 500m
    });
    
    if (nearbyExisting) {
      // Update existing hut with GPS-derived position
      nearbyExisting.coordinates = gpsHut.coordinates;
      nearbyExisting.visitedByGPS = true;
      nearbyExisting.gpsConfidence = gpsHut.confidence;
    } else {
      // Add as new GPS-detected hut
      mergedHuts.push({
        id: gpsHut.id,
        name: gpsHut.name,
        elevation: 0, // Unknown from GPS
        coordinates: gpsHut.coordinates,
        capacity: 0, // Unknown
        guardian: true, // Assume true for detected huts
        season: 'Unknown',
        description: `Hut detected from GPS tracks: ${gpsHut.sourceActivities.join(', ')}`,
        visitedByGPS: true,
        gpsConfidence: gpsHut.confidence,
        sourceActivities: gpsHut.sourceActivities
      });
    }
  });
  
  return mergedHuts;
}