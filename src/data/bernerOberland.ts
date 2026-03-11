import { Hut, Summit, RouteStage } from './hauteRoute'

export const bernerOberlandHuts: Hut[] = [
  {
    id: 'jungfraujoch',
    name: 'Jungfraujoch',
    elevation: 3454,
    coordinates: [7.9847, 46.5472],
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    contact: 'Railway station',
    website: 'https://www.jungfrau.ch',
    description: 'Top of Europe railway station, starting point for high-altitude ski touring in the Aletsch region.'
  },
  {
    id: 'konkordiahut',
    name: 'Konkordiahütte',
    elevation: 2850,
    coordinates: [8.053211, 46.500441],
    capacity: 140,
    guardian: true,
    season: 'March - October',
    contact: '+41 33 971 36 61',
    website: 'https://www.konkordia.ch',
    description: 'Spectacular hut on the Konkordiaplatz, gateway to the Aletsch Glacier and surrounding 4000m peaks.'
  },
  {
    id: 'hollandia',
    name: 'Hollandiahütte',
    elevation: 3238,
    coordinates: [7.960250, 46.475278],
    capacity: 34,
    guardian: true,
    season: 'March - September',
    contact: '+41 27 927 19 28',
    website: 'https://www.hollandiahutte.ch',
    description: 'High mountain refuge near the Lötschen Pass, access point for Grosser Aletschhorn and touring routes.'
  },
  {
    id: 'finsteraarhornhut',
    name: 'Finsteraarhornhütte',
    elevation: 3048,
    coordinates: [8.114639, 46.521917],
    capacity: 110,
    guardian: true,
    season: 'March - September',
    contact: '+41 33 973 11 21',
    website: 'https://www.finsteraarhorn.ch',
    description: 'Historic hut beneath the Finsteraarhorn, oldest high-altitude hut in the Alps, built in 1876.'
  },
  {
    id: 'oberaarjochhut',
    name: 'Oberaarjochhütte',
    elevation: 2752,
    coordinates: [8.173025, 46.526039],
    capacity: 80,
    guardian: true,
    season: 'June - September',
    contact: '+41 33 973 11 14',
    website: 'https://www.oberaarjoch.ch',
    description: 'Mountain hut at the Oberaar Pass, access to the Oberaarhorn and Bernese 4000m peaks.'
  },
  {
    id: 'lauteraarhutte',
    name: 'Lauteraarhütte',
    elevation: 2392,
    coordinates: [8.1833, 46.5667],
    capacity: 90,
    guardian: true,
    season: 'June - September',
    contact: '+41 33 973 11 10',
    website: 'https://www.lauteraar.ch',
    description: 'Valley-based hut providing access to the Lauteraarhorn and approach routes to higher peaks.'
  },
  {
    id: 'grindelwald',
    name: 'Grindelwald',
    elevation: 1034,
    coordinates: [8.0333, 46.6244],
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    contact: 'Resort village',
    website: 'https://www.grindelwald.ch',
    description: 'Famous alpine resort village, gateway to the Jungfrau region and starting point for many tours.'
  }
]

export const bernerOberlandSummits: Summit[] = [
  {
    id: 'jungfrau',
    name: 'Jungfrau',
    elevation: 4158,
    coordinates: [7.9625, 46.5367],
    prominence: 675,
    firstAscent: '1811',
    difficulty: 'Very Difficult',
    description: 'The Virgin - iconic peak of the Bernese Alps, UNESCO World Heritage site with spectacular north face.',
    routeAccess: ['jungfraujoch', 'konkordiahut']
  },
  {
    id: 'monch',
    name: 'Mönch',
    elevation: 4110,
    coordinates: [7.9972, 46.5583],
    prominence: 230,
    firstAscent: '1857',
    difficulty: 'Difficult',
    description: 'The Monk - central peak of the Jungfrau triumvirate, classic ski mountaineering objective.',
    routeAccess: ['jungfraujoch', 'konkordiahut']
  },
  {
    id: 'eiger',
    name: 'Eiger',
    elevation: 3970,
    coordinates: [8.0058, 46.5775],
    prominence: 362,
    firstAscent: '1858',
    difficulty: 'Very Difficult',
    description: 'The Ogre - famous for its dramatic north face, one of the great challenges of alpinism.',
    routeAccess: ['jungfraujoch', 'grindelwald']
  },
  {
    id: 'finsteraarhorn',
    name: 'Finsteraarhorn',
    elevation: 4274,
    coordinates: [8.1264, 46.5372],
    prominence: 2280,
    firstAscent: '1812',
    difficulty: 'Very Difficult',
    description: 'Highest peak of the Bernese Alps, magnificent pyramid dominating the region.',
    routeAccess: ['finsteraarhornhut', 'konkordiahut']
  },
  {
    id: 'aletschhorn',
    name: 'Aletschhorn',
    elevation: 4193,
    coordinates: [7.8958, 46.4806],
    prominence: 1031,
    firstAscent: '1859',
    difficulty: 'Difficult',
    description: 'Beautiful isolated peak above the Aletsch Glacier, excellent ski mountaineering summit.',
    routeAccess: ['hollandia', 'konkordiahut']
  },
  {
    id: 'schreckhorn',
    name: 'Schreckhorn',
    elevation: 4078,
    coordinates: [8.1178, 46.5881],
    prominence: 793,
    firstAscent: '1861',
    difficulty: 'Very Difficult',
    description: 'Peak of Terror - dramatic spire with technical climbing, striking appearance from Grindelwald.',
    routeAccess: ['lauteraarhutte', 'finsteraarhornhut']
  },
  {
    id: 'wetterhorn',
    name: 'Wetterhorn',
    elevation: 3692,
    coordinates: [8.1181, 46.6139],
    prominence: 1527,
    firstAscent: '1844',
    difficulty: 'Moderate',
    description: 'Weather Peak - distinctive triangular summit, one of the first major alpine peaks climbed.',
    routeAccess: ['grindelwald', 'lauteraarhutte']
  }
]

export const jungfrauTourRoute: RouteStage[] = [
  {
    id: 'jungfrau1',
    name: 'Grindelwald to Jungfraujoch',
    day: 1,
    startHut: 'grindelwald',
    endHut: 'jungfraujoch',
    distance: 25,
    elevationGain: 2420,
    elevationLoss: 0,
    difficulty: 'Moderate',
    duration: 'Railway: 2 hours',
    description: 'Take the historic Jungfrau Railway to reach the Top of Europe at 3454m elevation.',
    waypoints: [
      { name: 'Kleine Scheidegg', coordinates: [8.0333, 46.5833], elevation: 2061, type: 'landmark' },
      { name: 'Eigergletscher', coordinates: [8.0167, 46.5667], elevation: 2320, type: 'glacier' }
    ]
  },
  {
    id: 'jungfrau2',
    name: 'Jungfraujoch to Konkordiahütte',
    day: 2,
    startHut: 'jungfraujoch',
    endHut: 'konkordiahut',
    distance: 12,
    elevationGain: 200,
    elevationLoss: 800,
    difficulty: 'Difficult',
    duration: '4-5 hours',
    description: 'Spectacular glacier descent across the Konkordiaplatz, heart of the Aletsch Glacier system.',
    waypoints: [
      { name: 'Konkordiaplatz', coordinates: [8.0000, 46.5200], elevation: 2800, type: 'glacier' },
      { name: 'Grünegghorn', coordinates: [7.9833, 46.5000], elevation: 3860, type: 'summit' }
    ]
  },
  {
    id: 'jungfrau3',
    name: 'Konkordiahütte to Hollandiahütte',
    day: 3,
    startHut: 'konkordiahut',
    endHut: 'hollandia',
    distance: 8,
    elevationGain: 600,
    elevationLoss: 200,
    difficulty: 'Very Difficult',
    duration: '5-6 hours',
    description: 'Technical glacier crossing via Lötschen Pass, spectacular views of Aletschhorn.',
    waypoints: [
      { name: 'Lötschen Pass', coordinates: [7.9500, 46.4900], elevation: 3178, type: 'pass' },
      { name: 'Aletschfirn', coordinates: [7.9167, 46.4833], elevation: 3000, type: 'glacier' }
    ]
  },
  {
    id: 'jungfrau4',
    name: 'Hollandiahütte to Finsteraarhornhütte',
    day: 4,
    startHut: 'hollandia',
    endHut: 'finsteraarhornhut',
    distance: 14,
    elevationGain: 400,
    elevationLoss: 600,
    difficulty: 'Difficult',
    duration: '6-7 hours',
    description: 'Traverse across the Ewigschneefeld, approach to the highest peaks of the Bernese Alps.',
    waypoints: [
      { name: 'Ewigschneefeld', coordinates: [8.0500, 46.5167], elevation: 3200, type: 'glacier' },
      { name: 'Finsteraarjoch', coordinates: [8.1000, 46.5300], elevation: 3280, type: 'pass' }
    ]
  },
  {
    id: 'jungfrau5',
    name: 'Finsteraarhornhütte Summit Day',
    day: 5,
    startHut: 'finsteraarhornhut',
    endHut: 'finsteraarhornhut',
    distance: 16,
    elevationGain: 1226,
    elevationLoss: 1226,
    difficulty: 'Very Difficult',
    duration: '10-12 hours',
    description: 'Ascent of Finsteraarhorn (4274m), highest peak of the Bernese Alps with technical glacier climbing.',
    waypoints: [
      { name: 'Hugisattel', coordinates: [8.1167, 46.5350], elevation: 3630, type: 'pass' },
      { name: 'Finsteraarhorn Summit', coordinates: [8.1264, 46.5372], elevation: 4274, type: 'summit' }
    ]
  },
  {
    id: 'jungfrau6',
    name: 'Finsteraarhornhütte to Oberaarjochhütte',
    day: 6,
    startHut: 'finsteraarhornhut',
    endHut: 'oberaarjochhut',
    distance: 10,
    elevationGain: 300,
    elevationLoss: 600,
    difficulty: 'Moderate',
    duration: '4-5 hours',
    description: 'Scenic traverse to the Oberaar region with views of the eastern Bernese peaks.',
    waypoints: [
      { name: 'Oberaarjoch', coordinates: [8.2000, 46.5450], elevation: 3210, type: 'pass' },
      { name: 'Oberaar Glacier', coordinates: [8.1833, 46.5500], elevation: 2900, type: 'glacier' }
    ]
  },
  {
    id: 'jungfrau7',
    name: 'Oberaarjochhütte to Grindelwald',
    day: 7,
    startHut: 'oberaarjochhut',
    endHut: 'grindelwald',
    distance: 18,
    elevationGain: 200,
    elevationLoss: 1920,
    difficulty: 'Easy',
    duration: '6-7 hours',
    description: 'Long descent via Lauteraarhütte back to the valley, completing the Bernese Oberland circuit.',
    waypoints: [
      { name: 'Lauteraarhütte', coordinates: [8.1833, 46.5667], elevation: 2392, type: 'landmark' },
      { name: 'Aareschlucht', coordinates: [8.1500, 46.6000], elevation: 1500, type: 'landmark' }
    ]
  }
]