export interface Hut {
  id: string;
  name: string;
  elevation: number;
  coordinates: [number, number]; // [lng, lat]
  capacity: number;
  guardian: boolean;
  season: string;
  contact?: string;
  website?: string;
  description: string;
}

export interface Summit {
  id: string;
  name: string;
  elevation: number;
  coordinates: [number, number]; // [lng, lat]
  prominence: number;
  firstAscent?: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult' | 'Extreme';
  description: string;
  routeAccess: string[];
}

export interface RouteStage {
  id: string;
  name: string;
  day: number;
  startHut: string;
  endHut: string;
  distance: number;
  elevationGain: number;
  elevationLoss: number;
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
  duration: string;
  description: string;
  waypoints: Array<{
    name: string;
    coordinates: [number, number];
    elevation: number;
    type: 'pass' | 'glacier' | 'summit' | 'landmark';
  }>;
}

export const hauteRouteHuts: Hut[] = [
  {
    id: 'argentiere',
    name: 'Argentière Hut',
    elevation: 2771,
    coordinates: [6.9667, 45.9833],
    capacity: 170,
    guardian: true,
    season: 'June - September',
    contact: '+33 4 50 53 16 92',
    website: 'https://www.chamonix.com/argentiere-hut',
    description: 'Starting point for the classic Haute Route, located above Chamonix with spectacular glacier views.'
  },
  {
    id: 'verbier',
    name: 'Verbier',
    elevation: 1500,
    coordinates: [7.2286, 46.0960],
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    contact: 'Resort town',
    website: 'https://www.verbier.ch',
    description: 'Alternative starting point for the Haute Route with lift access to high alpine terrain.'
  },
  {
    id: 'zermatt',
    name: 'Zermatt',
    elevation: 1620,
    coordinates: [7.7500, 46.0167],
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    contact: 'Resort town',
    website: 'https://www.zermatt.ch',
    description: 'Final destination of the Haute Route, famous for the Matterhorn.'
  },
  {
    id: 'trient',
    name: 'Cabane du Trient',
    elevation: 3170,
    coordinates: [7.0167, 46.0000],
    capacity: 130,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 783 14 22',
    website: 'https://www.cabane-trient.ch',
    description: 'High alpine hut with stunning views of the Trient Glacier and surrounding peaks.'
  },
  {
    id: 'valsorey',
    name: 'Cabane de Valsorey',
    elevation: 3030,
    coordinates: [7.1000, 45.9500],
    capacity: 48,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 778 15 40',
    website: 'https://www.cabane-valsorey.ch',
    description: 'Remote hut in the heart of the Pennine Alps, gateway to the Grand Combin massif.'
  },
  {
    id: 'chanrion',
    name: 'Cabane de Chanrion',
    elevation: 2462,
    coordinates: [7.2167, 45.9167],
    capacity: 135,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 778 11 99',
    website: 'https://www.cabane-chanrion.ch',
    description: 'Strategic hut at the foot of the Grand Combin, popular rest point on the Haute Route.'
  },
  {
    id: 'vignettes',
    name: 'Cabane des Vignettes',
    elevation: 3158,
    coordinates: [7.3000, 45.9833],
    capacity: 130,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 281 17 06',
    website: 'https://www.cabane-vignettes.ch',
    description: 'High mountain refuge with panoramic views, access to the Pigne d\'Arolla.'
  },
  {
    id: 'bertol',
    name: 'Cabane de Bertol',
    elevation: 3311,
    coordinates: [7.4167, 45.9667],
    capacity: 80,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 283 19 29',
    website: 'https://www.cabane-bertol.ch',
    description: 'Dramatically perched hut on a rocky outcrop, one of the most spectacular locations on the route.'
  },
  {
    id: 'dix',
    name: 'Cabane des Dix',
    elevation: 2928,
    coordinates: [7.4177, 46.0111],
    capacity: 108,
    guardian: true,
    season: 'June - September',
    contact: '+41 27 281 15 23',
    website: 'http://www.cabanedesdix.ch',
    description: 'Mountain hut above Cheilon Glacier, access point for Mont Blanc de Cheilon and Pigne d\'Arolla. Alternative route via Verbier variant.'
  },
  {
    id: 'prafleuri',
    name: 'Cabane de Prafleuri',
    elevation: 2624,
    coordinates: [7.3333, 46.0500],
    capacity: 40,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 281 17 23',
    website: 'https://www.cabane-prafleuri.ch',
    description: 'Remote mountain hut in the Pennine Alps, popular stop on the Chamonix-Zermatt route with access to beautiful glacier terrain.'
  },
  {
    id: 'montfort',
    name: 'Cabane du Mont Fort',
    elevation: 2457,
    coordinates: [7.2833, 46.0833],
    capacity: 38,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 778 13 84',
    website: 'https://www.cabane-montfort.ch',
    description: 'Mountain refuge near Verbier ski area, offering access to excellent touring terrain and connection to the Haute Route network.'
  },
  {
    id: 'schonbiel',
    name: 'Cabane de Schönbiel',
    elevation: 2694,
    coordinates: [7.6167, 45.9833],
    capacity: 84,
    guardian: true,
    season: 'March - May, July - September',
    contact: '+41 27 967 13 54',
    website: 'https://www.cabane-schonbiel.ch',
    description: 'Final hut before Zermatt, with views of the Matterhorn and surrounding 4000m peaks.'
  }
];

export const hauteRouteStages: RouteStage[] = [
  {
    id: 'stage1',
    name: 'Argentière to Trient Hut',
    day: 1,
    startHut: 'argentiere',
    endHut: 'trient',
    distance: 18,
    elevationGain: 1200,
    elevationLoss: 800,
    difficulty: 'Difficult',
    duration: '7-9 hours',
    description: 'Classic glacier crossing via Plateau du Trient. Crevasse danger requires glacier travel experience.',
    waypoints: [
      { name: 'Plateau du Trient', coordinates: [6.9833, 45.9917], elevation: 3100, type: 'glacier' },
      { name: 'Col du Trient', coordinates: [7.0000, 45.9950], elevation: 3280, type: 'pass' }
    ]
  },
  {
    id: 'stage2',
    name: 'Trient to Valsorey Hut',
    day: 2,
    startHut: 'trient',
    endHut: 'valsorey',
    distance: 16,
    elevationGain: 900,
    elevationLoss: 1100,
    difficulty: 'Very Difficult',
    duration: '8-10 hours',
    description: 'Challenging traverse via Fenêtre de Saleina with steep descents and glacier navigation.',
    waypoints: [
      { name: 'Fenêtre de Saleina', coordinates: [7.0500, 45.9750], elevation: 3261, type: 'pass' },
      { name: 'Plateau du Couloir', coordinates: [7.0833, 45.9583], elevation: 3200, type: 'glacier' }
    ]
  },
  {
    id: 'stage3',
    name: 'Valsorey to Chanrion Hut',
    day: 3,
    startHut: 'valsorey',
    endHut: 'chanrion',
    distance: 14,
    elevationGain: 600,
    elevationLoss: 1200,
    difficulty: 'Moderate',
    duration: '5-7 hours',
    description: 'Scenic traverse around the Grand Combin massif with spectacular mountain views.',
    waypoints: [
      { name: 'Col de Sonadon', coordinates: [7.1500, 45.9333], elevation: 3200, type: 'pass' },
      { name: 'Glacier de Sonadon', coordinates: [7.1833, 45.9250], elevation: 3000, type: 'glacier' }
    ]
  },
  {
    id: 'stage4',
    name: 'Chanrion to Vignettes Hut',
    day: 4,
    startHut: 'chanrion',
    endHut: 'vignettes',
    distance: 12,
    elevationGain: 1100,
    elevationLoss: 400,
    difficulty: 'Difficult',
    duration: '6-8 hours',
    description: 'Ascent via Col de l\'Évêque with stunning views of the Pennine Alps chain.',
    waypoints: [
      { name: 'Col de l\'Évêque', coordinates: [7.2667, 45.9667], elevation: 3392, type: 'pass' },
      { name: 'Glacier d\'Otemma', coordinates: [7.2833, 45.9750], elevation: 3200, type: 'glacier' }
    ]
  },
  {
    id: 'stage5',
    name: 'Vignettes to Bertol Hut',
    day: 5,
    startHut: 'vignettes',
    endHut: 'bertol',
    distance: 10,
    elevationGain: 800,
    elevationLoss: 650,
    difficulty: 'Very Difficult',
    duration: '6-8 hours',
    description: 'Technical crossing via Col de l\'Évêque and Haut Glacier d\'Arolla. Requires good conditions.',
    waypoints: [
      { name: 'Col Bertol', coordinates: [7.3833, 45.9750], elevation: 3280, type: 'pass' },
      { name: 'Haut Glacier d\'Arolla', coordinates: [7.3667, 45.9833], elevation: 3100, type: 'glacier' }
    ]
  },
  {
    id: 'stage6',
    name: 'Bertol to Schönbiel Hut',
    day: 6,
    startHut: 'bertol',
    endHut: 'schonbiel',
    distance: 15,
    elevationGain: 600,
    elevationLoss: 1200,
    difficulty: 'Difficult',
    duration: '7-9 hours',
    description: 'Spectacular finale via Stockjigletscher with Matterhorn views. Technical glacier descent.',
    waypoints: [
      { name: 'Tête Blanche', coordinates: [7.5000, 45.9750], elevation: 3710, type: 'summit' },
      { name: 'Stockjigletscher', coordinates: [7.5833, 45.9833], elevation: 3200, type: 'glacier' }
    ]
  },
  {
    id: 'stage7',
    name: 'Schönbiel to Zermatt',
    day: 7,
    startHut: 'schonbiel',
    endHut: 'zermatt',
    distance: 12,
    elevationGain: 200,
    elevationLoss: 1400,
    difficulty: 'Easy',
    duration: '4-5 hours',
    description: 'Victory descent to Zermatt via Zmutt valley. Non-glaciated terrain with Matterhorn views.',
    waypoints: [
      { name: 'Zmutt', coordinates: [7.6500, 45.9750], elevation: 1936, type: 'landmark' },
      { name: 'Zermatt', coordinates: [7.7500, 46.0167], elevation: 1620, type: 'landmark' }
    ]
  }
];

export const verbierVariantStages: RouteStage[] = [
  {
    id: 'verbier1',
    name: 'Verbier to Dix Hut',
    day: 1,
    startHut: 'verbier',
    endHut: 'dix',
    distance: 14,
    elevationGain: 1400,
    elevationLoss: 300,
    difficulty: 'Moderate',
    duration: '6-7 hours',
    description: 'Alternative start via Verbier with lift access. Scenic approach through Val des Dix.',
    waypoints: [
      { name: 'Grande Dixence Dam', coordinates: [7.4000, 46.0800], elevation: 2365, type: 'landmark' },
      { name: 'Lac des Dix', coordinates: [7.4083, 46.0583], elevation: 2365, type: 'landmark' }
    ]
  },
  {
    id: 'verbier2',
    name: 'Dix to Vignettes Hut',
    day: 2,
    startHut: 'dix',
    endHut: 'vignettes',
    distance: 8,
    elevationGain: 600,
    elevationLoss: 370,
    difficulty: 'Moderate',
    duration: '4-5 hours',
    description: 'Short connection to main Haute Route via Cheilon Glacier and Pigne d\'Arolla.',
    waypoints: [
      { name: 'Cheilon Glacier', coordinates: [7.4083, 46.0000], elevation: 3000, type: 'glacier' },
      { name: 'Pigne d\'Arolla', coordinates: [7.3667, 45.9917], elevation: 3796, type: 'summit' }
    ]
  }
];

export const hautRouteSummits: Summit[] = [
  {
    id: 'pigne-arolla',
    name: 'Pigne d\'Arolla',
    elevation: 3796,
    coordinates: [7.3667, 45.9917],
    prominence: 885,
    firstAscent: '1865',
    difficulty: 'Moderate',
    description: 'Prominent peak offering spectacular views of the Pennine Alps, popular ski touring objective from Cabane des Vignettes.',
    routeAccess: ['vignettes', 'dix']
  },
  {
    id: 'mont-blanc-cheilon',
    name: 'Mont Blanc de Cheilon',
    elevation: 3870,
    coordinates: [7.4167, 46.0167],
    prominence: 520,
    firstAscent: '1865',
    difficulty: 'Moderate',
    description: 'Beautiful pyramid-shaped peak above the Cheilon Glacier, classic ski mountaineering ascent.',
    routeAccess: ['dix', 'vignettes']
  },
  {
    id: 'grand-combin',
    name: 'Grand Combin',
    elevation: 4314,
    coordinates: [7.2167, 45.9333],
    prominence: 1517,
    firstAscent: '1859',
    difficulty: 'Difficult',
    description: 'Massive mountain dominating the western Pennine Alps, visible from much of the Haute Route.',
    routeAccess: ['chanrion', 'valsorey']
  },
  {
    id: 'matterhorn',
    name: 'Matterhorn',
    elevation: 4478,
    coordinates: [7.6583, 45.9764],
    prominence: 1040,
    firstAscent: '1865',
    difficulty: 'Very Difficult',
    description: 'Iconic pyramid peak and symbol of the Alps, dramatic finale visible from Zermatt and the final stages.',
    routeAccess: ['schonbiel']
  },
  {
    id: 'dent-blanche',
    name: 'Dent Blanche',
    elevation: 4357,
    coordinates: [7.6167, 45.9667],
    prominence: 1069,
    firstAscent: '1862',
    difficulty: 'Very Difficult',
    description: 'Impressive peak rising above the Schönbiel area, one of the great 4000m summits of the Pennine Alps.',
    routeAccess: ['schonbiel']
  },
  {
    id: 'mont-collon',
    name: 'Mont Collon',
    elevation: 3637,
    coordinates: [7.3500, 45.9583],
    prominence: 412,
    firstAscent: '1867',
    difficulty: 'Moderate',
    description: 'Elegant peak above Arolla valley, popular ski touring destination from Cabane des Vignettes.',
    routeAccess: ['vignettes', 'bertol']
  },
  {
    id: 'aiguille-rouge',
    name: 'Aiguille Rouge de Triolet',
    elevation: 3734,
    coordinates: [7.0000, 45.9833],
    prominence: 284,
    firstAscent: '1864',
    difficulty: 'Difficult',
    description: 'Sharp granite spire in the Mont Blanc massif, visible from the early stages near Trient.',
    routeAccess: ['trient', 'argentiere']
  }
];