import { Hut, Summit, RouteStage } from './hauteRoute';

// Silvretta Group Huts
export const silvrettaHuts: Hut[] = [
  {
    id: 'wiesbadner-hutte',
    name: 'Wiesbadener Hütte',
    elevation: 2443,
    coordinates: [10.0892, 46.9164], // [lng, lat]
    capacity: 250,
    guardian: true,
    season: 'June-September',
    contact: '+43 5443 8106',
    website: 'https://www.wiesbadenerhuette.com',
    description: 'Large hut in the heart of the Silvretta, popular base for Piz Buin'
  },
  {
    id: 'jamtal-hutte',
    name: 'Jamtalhütte',
    elevation: 2165,
    coordinates: [10.0936, 46.8867], // [lng, lat]
    capacity: 110,
    guardian: true,
    season: 'June-September',
    contact: '+43 5443 8262',
    website: 'https://www.jamtalhuette.at',
    description: 'Historic hut in the Jamtal valley, gateway to eastern Silvretta peaks'
  },
  {
    id: 'tuebinger-hutte',
    name: 'Tübinger Hütte',
    elevation: 2191,
    coordinates: [10.1467, 46.8869], // [lng, lat]
    capacity: 60,
    guardian: true,
    season: 'June-September',
    contact: '+43 5443 8236',
    description: 'Small mountain hut on the Silvretta High Route'
  },
  {
    id: 'heidelberger-hutte',
    name: 'Heidelberger Hütte',
    elevation: 2264,
    coordinates: [10.1775, 46.8508], // [lng, lat]
    capacity: 130,
    guardian: true,
    season: 'June-September',
    contact: '+43 5443 8117',
    website: 'https://www.heidelbergerhuette.at',
    description: 'Central hut for ski touring in the Silvretta massif'
  },
  {
    id: 'silvretta-hutte',
    name: 'Silvretta Hütte',
    elevation: 2341,
    coordinates: [9.9258, 46.8647], // [lng, lat]
    capacity: 100,
    guardian: true,
    season: 'June-September',
    contact: '+41 81 422 1340',
    description: 'Swiss side hut with access to Piz Badile and northern Silvretta'
  },
  {
    id: 'darmstadter-hutte',
    name: 'Darmstädter Hütte',
    elevation: 2384,
    coordinates: [10.0481, 46.9331], // [lng, lat]
    capacity: 90,
    guardian: true,
    season: 'June-September',
    contact: '+43 5443 8515',
    description: 'High alpine hut near the Ochsentaler Glacier'
  }
];

// Silvretta Group Major Summits
export const silvrettaSummits: Summit[] = [
  {
    id: 'piz-buin',
    name: 'Piz Buin',
    elevation: 3312,
    coordinates: [10.1119, 46.8447], // [lng, lat]
    prominence: 1369,
    difficulty: 'Difficult',
    description: 'Highest peak in Vorarlberg, classic glacier ascent',
    firstAscent: '1865 by J.J. Weilenmann, J. Specht, J.A. Specht',
    routeAccess: ['Wiesbadener Hütte', 'Tuebinger Hütte']
  },
  {
    id: 'silvretta-horn',
    name: 'Silvrettahorn',
    elevation: 3244,
    coordinates: [10.0781, 46.8525], // [lng, lat]
    prominence: 189,
    difficulty: 'Moderate',
    description: 'Sharp granite horn, technical mixed climbing',
    firstAscent: '1865 by F.F. Tuckett, F. Devouassoud',
    routeAccess: ['Wiesbadener Hütte', 'Silvretta Hütte']
  },
  {
    id: 'fluchthorn',
    name: 'Fluchthorn',
    elevation: 3399,
    coordinates: [10.1711, 46.8681], // [lng, lat]
    prominence: 634,
    difficulty: 'Moderate',
    description: 'Highest peak in the eastern Silvretta group',
    firstAscent: '1861 by J.J. Weilenmann, J. Specht',
    routeAccess: ['Heidelberger Hütte', 'Jamtalhütte']
  },
  {
    id: 'piz-linard',
    name: 'Piz Linard',
    elevation: 3411,
    coordinates: [10.0667, 46.7975], // [lng, lat]
    prominence: 1027,
    difficulty: 'Moderate',
    description: 'Highest peak entirely in Switzerland in the Silvretta',
    firstAscent: '1835 by Oswald Heer and others',
    routeAccess: ['Tuebinger Hütte', 'Chamanna Linard']
  },
  {
    id: 'verstanclahorn',
    name: 'Verstanclahorn',
    elevation: 3298,
    coordinates: [9.9644, 46.8331], // [lng, lat]
    prominence: 723,
    difficulty: 'Difficult',
    description: 'Prominent peak on the Swiss-Austrian border',
    firstAscent: '1848 by J. Coaz',
    routeAccess: ['Silvretta Hütte', 'Wiesbadener Hütte']
  },
  {
    id: 'augstenberg',
    name: 'Augstenberg',
    elevation: 3230,
    coordinates: [10.1239, 46.9186], // [lng, lat]
    prominence: 405,
    difficulty: 'Moderate',
    description: 'Northern Silvretta peak with glacier approach',
    firstAscent: '1865 by J.J. Weilenmann',
    routeAccess: ['Wiesbadener Hütte', 'Darmstädter Hütte']
  }
];

// Silvretta High Route (7-day circuit)
export const silvrettaTourRoute: RouteStage[] = [
  {
    id: 'silvretta-stage-1',
    day: 1,
    name: 'Partenen to Wiesbadener Hütte',
    startHut: 'partenen-base', // Valley start
    endHut: 'wiesbadner-hutte',
    distance: 12,
    duration: '4-5 hours',
    elevationGain: 1100,
    elevationLoss: 200,
    difficulty: 'Moderate',
    description: 'Classic approach up the Vermunt valley to the heart of the Silvretta',
    waypoints: [
      { name: 'Vermunt Stausee', coordinates: [10.0725, 46.9089], elevation: 1743, type: 'landmark' },
      { name: 'Bielerhöhe', coordinates: [10.0831, 46.9203], elevation: 2037, type: 'pass' }
    ]
  },
  {
    id: 'silvretta-stage-2',
    day: 2,
    name: 'Piz Buin Summit & Descent to Jamtalhütte',
    startHut: 'wiesbadner-hutte',
    endHut: 'jamtal-hutte',
    distance: 14,
    duration: '8-9 hours',
    elevationGain: 869,
    elevationLoss: 400,
    difficulty: 'Very Difficult',
    description: 'Summit of Piz Buin via Ochsentaler Glacier, then traverse to Jamtal',
    waypoints: [
      { name: 'Ochsentaler Glacier', coordinates: [10.1058, 46.8531], elevation: 2800, type: 'glacier' },
      { name: 'Piz Buin Summit', coordinates: [10.1119, 46.8447], elevation: 3312, type: 'summit' },
      { name: 'Fuorcla dal Cunfin', coordinates: [10.1025, 46.8642], elevation: 2900, type: 'pass' }
    ]
  },
  {
    id: 'silvretta-stage-3',
    day: 3,
    name: 'Jamtalhütte to Heidelberger Hütte',
    startHut: 'jamtal-hutte',
    endHut: 'heidelberger-hutte',
    distance: 10,
    duration: '5-6 hours',
    elevationGain: 650,
    elevationLoss: 300,
    difficulty: 'Moderate',
    description: 'Eastern traverse through the Jamtal and over to Heidelberg valley',
    waypoints: [
      { name: 'Jamjoch', coordinates: [10.1292, 46.8753], elevation: 2850, type: 'pass' },
      { name: 'Rote Furka', coordinates: [10.1569, 46.8611], elevation: 2688, type: 'pass' }
    ]
  },
  {
    id: 'silvretta-stage-4',
    day: 4,
    name: 'Fluchthorn Summit Day',
    startHut: 'heidelberger-hutte',
    endHut: 'heidelberger-hutte',
    distance: 8,
    duration: '6-7 hours',
    elevationGain: 1135,
    elevationLoss: 1135,
    difficulty: 'Very Difficult',
    description: 'Summit of Fluchthorn, highest peak in eastern Silvretta',
    waypoints: [
      { name: 'Jamtalferner', coordinates: [10.1653, 46.8594], elevation: 2800, type: 'glacier' },
      { name: 'Fluchthorn Summit', coordinates: [10.1711, 46.8681], elevation: 3399, type: 'summit' }
    ]
  },
  {
    id: 'silvretta-stage-5',
    day: 5,
    name: 'Heidelberger Hütte to Tübinger Hütte',
    startHut: 'heidelberger-hutte',
    endHut: 'tuebinger-hutte',
    distance: 8,
    duration: '4-5 hours',
    elevationGain: 400,
    elevationLoss: 800,
    difficulty: 'Moderate',
    description: 'Western traverse back across the heart of the Silvretta',
    waypoints: [
      { name: 'Silvrettapass', coordinates: [10.1622, 46.8692], elevation: 2800, type: 'pass' },
      { name: 'Klostertal', coordinates: [10.1517, 46.8781], elevation: 1200, type: 'landmark' }
    ]
  },
  {
    id: 'silvretta-stage-6',
    day: 6,
    name: 'Tübinger Hütte to Silvretta Hütte',
    startHut: 'tuebinger-hutte',
    endHut: 'silvretta-hutte',
    distance: 12,
    duration: '5-6 hours',
    elevationGain: 600,
    elevationLoss: 300,
    difficulty: 'Moderate',
    description: 'Cross into Switzerland via high alpine passes',
    waypoints: [
      { name: 'Silvrettajoch', coordinates: [10.0892, 46.8719], elevation: 2650, type: 'pass' },
      { name: 'Litzner Saddle', coordinates: [10.0103, 46.8592], elevation: 2800, type: 'pass' }
    ]
  },
  {
    id: 'silvretta-stage-7',
    day: 7,
    name: 'Silvretta Hütte to Klosters',
    startHut: 'silvretta-hutte',
    endHut: 'klosters-base', // Valley end
    distance: 15,
    duration: '5-6 hours',
    elevationGain: 200,
    elevationLoss: 1800,
    difficulty: 'Easy',
    description: 'Descent through Swiss valleys back to civilization',
    waypoints: [
      { name: 'Silvrettasee', coordinates: [9.9319, 46.8531], elevation: 2030, type: 'landmark' },
      { name: 'Klosters Dorf', coordinates: [9.8781, 46.8789], elevation: 1200, type: 'landmark' }
    ]
  }
];