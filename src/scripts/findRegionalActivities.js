const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

// Define our alpine regions with coordinate boundaries
const REGIONS = {
  'haute-route': {
    name: 'Haute Route (Chamonix to Zermatt)',
    bounds: { minLat: 45.8, maxLat: 46.2, minLng: 6.8, maxLng: 7.8 }
  },
  'berner-oberland': {
    name: 'Berner Oberland (Jungfrau)',
    bounds: { minLat: 46.4, maxLat: 46.7, minLng: 7.8, maxLng: 8.3 }
  },
  'ortler': {
    name: 'Ortler Group (South Tyrol)',
    bounds: { minLat: 46.4, maxLat: 46.6, minLng: 10.4, maxLng: 10.8 }
  }
};

function isInRegion(lat, lng, region) {
  const bounds = REGIONS[region].bounds;
  return lat >= bounds.minLat && lat <= bounds.maxLat && 
         lng >= bounds.minLng && lng <= bounds.maxLng;
}

function parseGPXFile(filePath) {
  try {
    const gpxContent = fs.readFileSync(filePath, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
    
    const trackPoints = xmlDoc.getElementsByTagName('trkpt');
    const points = [];
    
    for (let i = 0; i < trackPoints.length; i++) {
      const point = trackPoints[i];
      const lat = parseFloat(point.getAttribute('lat'));
      const lng = parseFloat(point.getAttribute('lon'));
      points.push({ lat, lng });
    }
    
    return points;
  } catch (error) {
    console.error(`Error parsing GPX file ${filePath}:`, error.message);
    return [];
  }
}

function analyzeActivity(activityId, activityName, activityType, gpxFile) {
  if (!gpxFile || !gpxFile.includes('.gpx')) {
    return null;
  }
  
  const gpxPath = path.join(__dirname, '../../bulk_export_stava_example/export_28330904/activities', gpxFile);
  
  if (!fs.existsSync(gpxPath)) {
    return null;
  }
  
  const points = parseGPXFile(gpxPath);
  if (points.length === 0) {
    return null;
  }
  
  // Calculate center point
  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  
  // Check which region this activity belongs to
  for (const regionKey of Object.keys(REGIONS)) {
    if (isInRegion(avgLat, avgLng, regionKey)) {
      return {
        id: activityId,
        name: activityName,
        type: activityType,
        region: regionKey,
        gpxFile: gpxFile,
        centerPoint: { lat: avgLat, lng: avgLng },
        pointCount: points.length
      };
    }
  }
  
  return null;
}

function main() {
  const csvPath = path.join(__dirname, '../../bulk_export_stava_example/export_28330904/activities.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  // Find relevant column indices
  const idIndex = headers.findIndex(h => h.includes('Activity ID'));
  const nameIndex = headers.findIndex(h => h.includes('Activity Name'));
  const typeIndex = headers.findIndex(h => h.includes('Activity Type'));
  const filenameIndex = headers.findIndex(h => h.includes('Filename'));
  
  const regionalActivities = {
    'haute-route': [],
    'berner-oberland': [],
    'ortler': []
  };
  
  console.log('Analyzing activities for alpine regions...\n');
  console.log(`Found column indices: ID=${idIndex}, Name=${nameIndex}, Type=${typeIndex}, Filename=${filenameIndex}`);
  
  let skiActivities = 0;
  let processedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (processedCount >= 10) break; // Debug: limit to first 10 for now
    
    const line = lines[i];
    if (!line.trim()) continue;
    
    const columns = line.split(',');
    const activityId = columns[idIndex]?.replace(/"/g, '');
    const activityName = columns[nameIndex]?.replace(/"/g, '');
    const activityType = columns[typeIndex]?.replace(/"/g, '');
    const filename = columns[filenameIndex]?.replace(/"/g, '');
    
    console.log(`Processing: ${activityName} (${activityType}) - File: ${filename}`);
    
    // Only analyze skiing activities
    if (activityType && (activityType.includes('Ski') || activityType.includes('ski'))) {
      skiActivities++;
      console.log(`  -> This is a ski activity, analyzing...`);
      const result = analyzeActivity(activityId, activityName, activityType, filename);
      if (result) {
        regionalActivities[result.region].push(result);
        console.log(`Found: ${result.name} (${result.type}) in ${REGIONS[result.region].name}`);
        console.log(`  Center: ${result.centerPoint.lat.toFixed(4)}, ${result.centerPoint.lng.toFixed(4)}`);
        console.log(`  Points: ${result.pointCount}, File: ${result.gpxFile}\n`);
      } else {
        console.log(`  -> No regional match or couldn't parse GPX`);
      }
    }
    processedCount++;
  }
  
  console.log(`\nDebug: Processed ${processedCount} activities, found ${skiActivities} ski activities`);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  for (const region of Object.keys(regionalActivities)) {
    const activities = regionalActivities[region];
    console.log(`\n${REGIONS[region].name}: ${activities.length} activities`);
    activities.forEach(activity => {
      console.log(`  - ${activity.name} (${activity.id})`);
    });
  }
  
  // Write results to file
  fs.writeFileSync(
    path.join(__dirname, '../../regional-activities.json'),
    JSON.stringify(regionalActivities, null, 2)
  );
  
  console.log('\nResults saved to regional-activities.json');
}

main();