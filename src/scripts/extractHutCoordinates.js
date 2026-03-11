const fs = require('fs');
const path = require('path');

// Parse the KML file and extract hut coordinates
function parseKMLForHuts() {
  const kmlPath = path.join(__dirname, '../../hut_geo_info/doc.kml');
  const kmlContent = fs.readFileSync(kmlPath, 'utf8');
  
  // Extract all placemarks with name and coordinates
  const placemarkRegex = /<Placemark>(.*?)<\/Placemark>/gs;
  const nameRegex = /<name>(.*?)<\/name>/;
  const coordinatesRegex = /<coordinates>\s*(.*?)\s*<\/coordinates>/s;
  
  const huts = [];
  let match;
  
  while ((match = placemarkRegex.exec(kmlContent)) !== null) {
    const placemarkContent = match[1];
    const nameMatch = nameRegex.exec(placemarkContent);
    const coordMatch = coordinatesRegex.exec(placemarkContent);
    
    if (nameMatch && coordMatch) {
      const name = nameMatch[1].trim();
      const coordString = coordMatch[1].trim();
      const [lng, lat, elevation] = coordString.split(',').map(s => parseFloat(s.trim()));
      
      if (!isNaN(lng) && !isNaN(lat)) {
        huts.push({
          name,
          coordinates: [lng, lat],
          elevation: elevation || null
        });
      }
    }
  }
  
  return huts;
}

// Find huts relevant to our alpine regions
function findRelevantHuts(allHuts) {
  const regions = {
    'berner-oberland': {
      bounds: { minLat: 46.4, maxLat: 46.7, minLng: 7.8, maxLng: 8.3 },
      huts: []
    },
    'haute-route': {
      bounds: { minLat: 45.8, maxLat: 46.2, minLng: 6.8, maxLng: 7.8 },
      huts: []
    },
    'silvretta': {
      bounds: { minLat: 46.8, maxLat: 47.0, minLng: 9.9, maxLng: 10.2 },
      huts: []
    }
  };
  
  const relevantHuts = {};
  
  allHuts.forEach(hut => {
    const [lng, lat] = hut.coordinates;
    
    Object.keys(regions).forEach(regionKey => {
      const bounds = regions[regionKey].bounds;
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLng && lng <= bounds.maxLng) {
        if (!relevantHuts[regionKey]) {
          relevantHuts[regionKey] = [];
        }
        relevantHuts[regionKey].push(hut);
      }
    });
  });
  
  return relevantHuts;
}

// Main function
function main() {
  console.log('Extracting hut coordinates from Swiss Alpine Club KML...\n');
  
  const allHuts = parseKMLForHuts();
  console.log(`Total huts found: ${allHuts.length}`);
  
  const relevantHuts = findRelevantHuts(allHuts);
  
  console.log('\n=== RELEVANT HUTS BY REGION ===\n');
  
  Object.keys(relevantHuts).forEach(region => {
    const huts = relevantHuts[region];
    console.log(`${region.toUpperCase()}: ${huts.length} huts`);
    huts.forEach(hut => {
      console.log(`  ${hut.name}: [${hut.coordinates[0].toFixed(6)}, ${hut.coordinates[1].toFixed(6)}]`);
    });
    console.log('');
  });
  
  // Check for specific huts we know about
  console.log('=== CHECKING CURRENT HUTS ===\n');
  
  const currentHuts = [
    'Konkordiahütte',
    'Hollandia Hut',
    'Jungfraujoch',
    'Finsteraarhornhütte',
    'Wiesbadener Hütte',
    'Cabane du Trient',
    'Cabane de Bertol'
  ];
  
  currentHuts.forEach(hutName => {
    const found = allHuts.find(h => 
      h.name.toLowerCase().includes(hutName.toLowerCase()) ||
      hutName.toLowerCase().includes(h.name.toLowerCase())
    );
    if (found) {
      console.log(`✓ ${hutName} found as "${found.name}"`);
      console.log(`  Coordinates: [${found.coordinates[0].toFixed(6)}, ${found.coordinates[1].toFixed(6)}]`);
    } else {
      console.log(`✗ ${hutName} not found`);
    }
  });
  
  // Save results
  const outputPath = path.join(__dirname, '../../sac-hut-coordinates.json');
  fs.writeFileSync(outputPath, JSON.stringify({ allHuts, relevantHuts }, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

main();