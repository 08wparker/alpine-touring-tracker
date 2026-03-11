const fs = require('fs');
const path = require('path');

// Read the SAC coordinates data
const sacDataPath = path.join(__dirname, '../../sac-hut-coordinates.json');
const sacData = JSON.parse(fs.readFileSync(sacDataPath, 'utf8'));

// Mapping between our hut IDs and SAC hut names
const hutNameMappings = {
  'konkordiahut': 'Konkordiahütte',
  'hollandia': 'Hollandia Hut', 
  'oberaarjochhut': 'Oberaarjochhütte',
  'glecksteinhut': 'Glecksteinhütte',
  'schreckhorn': 'Schreckhornhütte', // if we add this hut
  'mutthornhut': 'Mutthornhütte',
  'monchsjochhut': 'Mönchsjoch Hütte'
};

function findSACCoordinates(ourHutId) {
  const sacName = hutNameMappings[ourHutId];
  if (!sacName) return null;
  
  // Look in all huts from SAC data
  const foundHut = sacData.allHuts.find(hut => hut.name === sacName);
  return foundHut ? foundHut.coordinates : null;
}

function generateCoordinateUpdates() {
  console.log('=== COORDINATE UPDATE RECOMMENDATIONS ===\n');
  
  Object.keys(hutNameMappings).forEach(ourId => {
    const sacCoords = findSACCoordinates(ourId);
    if (sacCoords) {
      console.log(`${ourId}:`);
      console.log(`  SAC Name: ${hutNameMappings[ourId]}`);
      console.log(`  Recommended coordinates: [${sacCoords[0]}, ${sacCoords[1]}]`);
      console.log('');
    }
  });
  
  // Special handling for huts not in SAC data
  console.log('=== HUTS NOT IN SAC DATA ===\n');
  console.log('finsteraarhornhut:');
  console.log('  Note: Not found in SAC data - likely private/non-SAC hut');
  console.log('  Current coordinates may need verification from other sources');
  console.log('  Consider: Swiss Topo maps, Alpine Club websites, or GPS coordinates');
  console.log('');
  
  // Check our current Berner Oberland huts against available SAC data
  console.log('=== AVAILABLE SAC HUTS NOT IN OUR DATA ===\n');
  const bernerOberlandSACHuts = sacData.relevantHuts['berner-oberland'] || [];
  const unmappedHuts = bernerOberlandSACHuts.filter(hut => 
    !Object.values(hutNameMappings).includes(hut.name)
  );
  
  unmappedHuts.forEach(hut => {
    console.log(`${hut.name}: [${hut.coordinates[0]}, ${hut.coordinates[1]}]`);
  });
}

function main() {
  generateCoordinateUpdates();
}

main();