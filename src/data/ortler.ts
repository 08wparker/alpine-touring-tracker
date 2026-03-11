import { Hut, Summit, RouteStage } from './hauteRoute'

export const ortlerHuts: Hut[] = [
  {
    id: 'sulden',
    name: 'Sulden/Solda',
    elevation: 1900,
    coordinates: [10.6167, 46.5250],
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    contact: 'Resort village',
    website: 'https://www.sulden.it',
    description: 'Historic alpine village at the foot of Ortler, gateway to the highest peaks of South Tyrol.'
  },
  {
    id: 'payerhut',
    name: 'Payerhütte',
    elevation: 3029,
    coordinates: [10.5583, 46.5050],
    capacity: 66,
    guardian: true,
    season: 'June - September',
    contact: '+39 0473 613024',
    website: 'https://www.payerhuette.com',
    description: 'High mountain refuge beneath Ortler\'s north face, base camp for the highest peak in South Tyrol.'
  },
  {
    id: 'berglhutte',
    name: 'Berglhütte',
    elevation: 2188,
    coordinates: [10.6333, 46.4833],
    capacity: 45,
    guardian: true,
    season: 'June - September',
    contact: '+39 0473 613025',
    website: 'https://www.berglhuette.it',
    description: 'Comfortable mountain hut in the Martell Valley, access point for the southern Ortler peaks.'
  },
  {
    id: 'cevedalehut',
    name: 'Rifugio Cevedale',
    elevation: 2459,
    coordinates: [10.7667, 46.4333],
    capacity: 80,
    guardian: true,
    season: 'June - September',
    contact: '+39 0463 754178',
    website: 'https://www.rifugiocevedale.it',
    description: 'Strategic hut for accessing Monte Cevedale and the eastern Ortler group glaciers.'
  },
  {
    id: 'casatihut',
    name: 'Rifugio Casati',
    elevation: 3254,
    coordinates: [10.5833, 46.4667],
    capacity: 40,
    guardian: true,
    season: 'July - September',
    contact: '+39 0342 900382',
    website: 'https://www.rifugiocasati.it',
    description: 'High-altitude refuge on the Forni Glacier, access to Pizzo Tresero and surrounding 3000m peaks.'
  },
  {
    id: 'larcher',
    name: 'Larcherhütte',
    elevation: 2608,
    coordinates: [10.6000, 46.5500],
    capacity: 50,
    guardian: true,
    season: 'June - September',
    contact: '+39 0473 666188',
    website: 'https://www.larcherhuette.it',
    description: 'Mountain hut in the Schnals Valley, approach to the Weißkugel and northern Ötztal Alps.'
  },
  {
    id: 'stelvio',
    name: 'Stelvio Pass',
    elevation: 2757,
    coordinates: [10.4500, 46.5289],
    capacity: 0,
    guardian: false,
    season: 'May - October',
    contact: 'Mountain pass',
    website: 'https://www.stilfserjoch.it',
    description: 'Famous high mountain pass connecting Italy and Switzerland, excellent ski touring access point.'
  }
]

export const ortlerSummits: Summit[] = [
  {
    id: 'ortler',
    name: 'Ortler',
    elevation: 3905,
    coordinates: [10.5456, 46.5058],
    prominence: 1953,
    firstAscent: '1804',
    difficulty: 'Very Difficult',
    description: 'Highest peak in South Tyrol and the Eastern Alps, magnificent pyramid with extensive glaciation.',
    routeAccess: ['payerhut', 'sulden']
  },
  {
    id: 'konig-spitze',
    name: 'König Spitze (Gran Zebrù)',
    elevation: 3851,
    coordinates: [10.5200, 46.4889],
    prominence: 434,
    firstAscent: '1854',
    difficulty: 'Very Difficult',
    description: 'Second highest peak of the Ortler group, dramatic rocky pyramid adjacent to Ortler.',
    routeAccess: ['payerhut', 'berglhutte']
  },
  {
    id: 'cevedale',
    name: 'Monte Cevedale',
    elevation: 3769,
    coordinates: [10.7167, 46.4500],
    prominence: 1344,
    firstAscent: '1865',
    difficulty: 'Moderate',
    description: 'Prominent glaciated peak on the main alpine divide, excellent ski mountaineering objective.',
    routeAccess: ['cevedalehut']
  },
  {
    id: 'weisskugel',
    name: 'Weißkugel',
    elevation: 3739,
    coordinates: [10.7833, 46.8167],
    prominence: 1215,
    firstAscent: '1861',
    difficulty: 'Moderate',
    description: 'White Ball - gentle glaciated dome, one of the easiest 3700m+ peaks in the Alps.',
    routeAccess: ['larcher']
  },
  {
    id: 'palon-della-mare',
    name: 'Palon de la Mare',
    elevation: 3703,
    coordinates: [10.6833, 46.4167],
    prominence: 423,
    firstAscent: '1864',
    difficulty: 'Moderate',
    description: 'Elegant snow peak in the heart of the Ortler group, popular ski touring destination.',
    routeAccess: ['cevedalehut', 'casatihut']
  },
  {
    id: 'tresero',
    name: 'Pizzo Tresero',
    elevation: 3594,
    coordinates: [10.5500, 46.4500],
    prominence: 249,
    firstAscent: '1868',
    difficulty: 'Moderate',
    description: 'Triple-peaked mountain above the Forni Glacier, excellent viewpoint over the Ortler group.',
    routeAccess: ['casatihut']
  },
  {
    id: 'punta-san-matteo',
    name: 'Punta San Matteo',
    elevation: 3678,
    coordinates: [10.5833, 46.4833],
    prominence: 298,
    firstAscent: '1875',
    difficulty: 'Moderate',
    description: 'Sharp rock and ice peak, technical mixed climbing on the borders of three valleys.',
    routeAccess: ['casatihut', 'payerhut']
  }
]

export const ortlerCircuitRoute: RouteStage[] = [
  {
    id: 'ortler1',
    name: 'Sulden to Payerhütte',
    day: 1,
    startHut: 'sulden',
    endHut: 'payerhut',
    distance: 8,
    elevationGain: 1129,
    elevationLoss: 0,
    difficulty: 'Moderate',
    duration: '4-5 hours',
    description: 'Classic approach hike through the Suldental to the high mountain refuge beneath Ortler.',
    waypoints: [
      { name: 'Tabarettahütte', coordinates: [10.5833, 46.5167], elevation: 2556, type: 'landmark' },
      { name: 'Ortler Glacier', coordinates: [10.5667, 46.5083], elevation: 2800, type: 'glacier' }
    ]
  },
  {
    id: 'ortler2',
    name: 'Ortler Summit Day',
    day: 2,
    startHut: 'payerhut',
    endHut: 'payerhut',
    distance: 12,
    elevationGain: 876,
    elevationLoss: 876,
    difficulty: 'Very Difficult',
    duration: '8-10 hours',
    description: 'Ascent of Ortler (3905m), highest peak in South Tyrol via the normal route with glacier travel.',
    waypoints: [
      { name: 'Oberer Ortlerferner', coordinates: [10.5500, 46.5067], elevation: 3400, type: 'glacier' },
      { name: 'Ortler Gipfel', coordinates: [10.5456, 46.5058], elevation: 3905, type: 'summit' }
    ]
  },
  {
    id: 'ortler3',
    name: 'Payerhütte to Berglhütte',
    day: 3,
    startHut: 'payerhut',
    endHut: 'berglhutte',
    distance: 14,
    elevationGain: 300,
    elevationLoss: 1141,
    difficulty: 'Moderate',
    duration: '5-6 hours',
    description: 'Traverse around the southern flanks of the Ortler group into the peaceful Martell Valley.',
    waypoints: [
      { name: 'Marteller Hütte', coordinates: [10.6167, 46.4750], elevation: 2610, type: 'landmark' },
      { name: 'Zufallhütte', coordinates: [10.6500, 46.4667], elevation: 2265, type: 'landmark' }
    ]
  },
  {
    id: 'ortler4',
    name: 'Berglhütte to Rifugio Cevedale',
    day: 4,
    startHut: 'berglhutte',
    endHut: 'cevedalehut',
    distance: 12,
    elevationGain: 800,
    elevationLoss: 500,
    difficulty: 'Difficult',
    duration: '6-7 hours',
    description: 'High-level traverse across glaciated terrain to access the eastern Ortler peaks.',
    waypoints: [
      { name: 'Zufall Glacier', coordinates: [10.7000, 46.4500], elevation: 2800, type: 'glacier' },
      { name: 'Cevedale Glacier', coordinates: [10.7333, 46.4417], elevation: 3000, type: 'glacier' }
    ]
  },
  {
    id: 'ortler5',
    name: 'Monte Cevedale Summit Day',
    day: 5,
    startHut: 'cevedalehut',
    endHut: 'cevedalehut',
    distance: 10,
    elevationGain: 1310,
    elevationLoss: 1310,
    difficulty: 'Moderate',
    duration: '7-8 hours',
    description: 'Ascent of Monte Cevedale (3769m), excellent ski mountaineering peak with panoramic views.',
    waypoints: [
      { name: 'Cevedale Saddle', coordinates: [10.7083, 46.4450], elevation: 3500, type: 'pass' },
      { name: 'Monte Cevedale', coordinates: [10.7167, 46.4500], elevation: 3769, type: 'summit' }
    ]
  },
  {
    id: 'ortler6',
    name: 'Cevedale to Stelvio Pass',
    day: 6,
    startHut: 'cevedalehut',
    endHut: 'stelvio',
    distance: 16,
    elevationGain: 600,
    elevationLoss: 300,
    difficulty: 'Moderate',
    duration: '5-6 hours',
    description: 'Scenic traverse to the famous Stelvio Pass, highest paved road in the Eastern Alps.',
    waypoints: [
      { name: 'Stilfser Joch', coordinates: [10.4500, 46.5289], elevation: 2757, type: 'pass' },
      { name: 'Dreisprachenspitze', coordinates: [10.4833, 46.5167], elevation: 2843, type: 'summit' }
    ]
  },
  {
    id: 'ortler7',
    name: 'Stelvio Pass to Sulden',
    day: 7,
    startHut: 'stelvio',
    endHut: 'sulden',
    distance: 20,
    elevationGain: 400,
    elevationLoss: 1257,
    difficulty: 'Easy',
    duration: '6-7 hours',
    description: 'Final descent through alpine meadows back to Sulden, completing the Ortler circuit.',
    waypoints: [
      { name: 'Franzenshöhe', coordinates: [10.5333, 46.5333], elevation: 2189, type: 'landmark' },
      { name: 'Trafoi', coordinates: [10.5167, 46.5500], elevation: 1543, type: 'landmark' }
    ]
  }
]