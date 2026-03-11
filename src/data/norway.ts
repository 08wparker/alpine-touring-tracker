import { Hut, Summit, RouteStage } from './hauteRoute';

// Romsdalsfjorden Boat Dock Locations (using Hut interface for consistency)
export const norwayHuts: Hut[] = [
  {
    id: 'andalsnes-dock',
    name: 'Åndalsnes',
    elevation: 0,
    coordinates: [7.3167, 62.5675], // [lng, lat]
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    contact: 'Åndalsnes Havn',
    description: 'Main boat dock at Åndalsnes, gateway to Romsdal Alps. Access to Vengedalen, Trollstigen, and inner fjord touring.'
  },
  {
    id: 'mandalen-dock',
    name: 'Måndalen',
    elevation: 0,
    coordinates: [7.4500, 62.4833], // [lng, lat]
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    description: 'Boat dock at Måndalen on the south side of Romsdalsfjorden. Quick access to steep Romsdal couloirs and Trolltindene.'
  }
];

// Romsdalsfjorden Region Major Summits
export const norwaySummits: Summit[] = [
  {
    id: 'store-vengetind',
    name: 'Store Vengetind',
    elevation: 1852,
    coordinates: [7.2000, 62.4333], // [lng, lat]
    prominence: 820,
    difficulty: 'Very Difficult',
    description: 'Highest peak in the Romsdal Alps, dramatic NE face. Classic steep ski descent from summit ridge.',
    firstAscent: '1881 by William C. Slingsby',
    routeAccess: ['Åndalsnes', 'Vengedalen approach']
  },
  {
    id: 'romsdalshorn',
    name: 'Romsdalshorn',
    elevation: 1550,
    coordinates: [7.1833, 62.4667], // [lng, lat]
    prominence: 450,
    difficulty: 'Difficult',
    description: 'Iconic Romsdal peak with classic couloir skiing. The south couloir is a renowned ski mountaineering line.',
    firstAscent: '1827 by Hans Bjermeland, Christen Hoel',
    routeAccess: ['Åndalsnes', 'Vengedalen']
  },
  {
    id: 'slogen',
    name: 'Slogen',
    elevation: 1564,
    coordinates: [6.3500, 62.2333], // [lng, lat]
    prominence: 1554,
    difficulty: 'Difficult',
    description: 'Sunnmøre icon rising directly from Norangsfjorden. Sea-to-summit ski descent of 1564m vertical.',
    firstAscent: '1843',
    routeAccess: ['Boat access from Norangsfjorden']
  },
  {
    id: 'kirketaket',
    name: 'Kirketaket',
    elevation: 1439,
    coordinates: [7.0833, 62.5333], // [lng, lat]
    prominence: 640,
    difficulty: 'Moderate',
    description: 'Molde-area classic. Short approach from road, excellent powder skiing with fjord views.',
    routeAccess: ['Åndalsnes', 'Road access']
  },
  {
    id: 'trollryggen',
    name: 'Trollryggen',
    elevation: 1740,
    coordinates: [7.6500, 62.4500], // [lng, lat]
    prominence: 500,
    difficulty: 'Very Difficult',
    description: 'Part of the famous Troll Wall massif. Expert-only ski mountaineering terrain.',
    firstAscent: '1965',
    routeAccess: ['Måndalen', 'Trollstigen road']
  },
  {
    id: 'bispen',
    name: 'Bispen',
    elevation: 1462,
    coordinates: [7.5833, 62.4667], // [lng, lat]
    prominence: 350,
    difficulty: 'Moderate',
    description: 'Classic Romsdal ski peak near Trollstigen. Beautiful couloir descents with views of the Troll Wall.',
    routeAccess: ['Måndalen', 'Trollstigen road']
  }
];

// Romsdalsfjorden Boat-Based Ski Touring (day trips from boat)
export const norwayTourRoute: RouteStage[] = [
  {
    id: 'norway-stage-1',
    day: 1,
    name: 'Kirketaket from Åndalsnes',
    startHut: 'andalsnes-dock',
    endHut: 'andalsnes-dock',
    distance: 10,
    duration: '4-5 hours',
    elevationGain: 1400,
    elevationLoss: 1400,
    difficulty: 'Moderate',
    description: 'Warm-up day on the Molde-area classic. Fjord-to-summit skiing with panoramic views of 222 peaks.',
    waypoints: [
      { name: 'Kirketaket Summit', coordinates: [7.0833, 62.5333], elevation: 1439, type: 'summit' }
    ]
  },
  {
    id: 'norway-stage-2',
    day: 2,
    name: 'Romsdalshorn South Couloir',
    startHut: 'andalsnes-dock',
    endHut: 'andalsnes-dock',
    distance: 15,
    duration: '6-8 hours',
    elevationGain: 1550,
    elevationLoss: 1550,
    difficulty: 'Difficult',
    description: 'Drive from Åndalsnes to Vengedalen. Skin up and ski the classic south couloir of Romsdalshorn.',
    waypoints: [
      { name: 'Vengedalen Trailhead', coordinates: [7.1500, 62.4600], elevation: 300, type: 'landmark' },
      { name: 'Romsdalshorn South Couloir', coordinates: [7.1833, 62.4650], elevation: 1400, type: 'pass' },
      { name: 'Romsdalshorn Summit', coordinates: [7.1833, 62.4667], elevation: 1550, type: 'summit' }
    ]
  },
  {
    id: 'norway-stage-3',
    day: 3,
    name: 'Store Vengetind Summit Day',
    startHut: 'andalsnes-dock',
    endHut: 'andalsnes-dock',
    distance: 18,
    duration: '8-10 hours',
    elevationGain: 1852,
    elevationLoss: 1852,
    difficulty: 'Very Difficult',
    description: 'Big summit day on the highest peak in Romsdal. Long approach from Vengedalen, steep skiing on descent.',
    waypoints: [
      { name: 'Vengedalen', coordinates: [7.1667, 62.4500], elevation: 400, type: 'landmark' },
      { name: 'Store Vengetind Summit', coordinates: [7.2000, 62.4333], elevation: 1852, type: 'summit' }
    ]
  },
  {
    id: 'norway-stage-4',
    day: 4,
    name: 'Bispen & Trollstigen Peaks',
    startHut: 'mandalen-dock',
    endHut: 'mandalen-dock',
    distance: 12,
    duration: '5-7 hours',
    elevationGain: 1400,
    elevationLoss: 1400,
    difficulty: 'Moderate',
    description: 'Boat to Måndalen, drive to Trollstigen area. Ski Bispen with views of the Troll Wall.',
    waypoints: [
      { name: 'Trollstigen Road', coordinates: [7.6700, 62.4567], elevation: 500, type: 'landmark' },
      { name: 'Bispen Summit', coordinates: [7.5833, 62.4667], elevation: 1462, type: 'summit' }
    ]
  },
  {
    id: 'norway-stage-5',
    day: 5,
    name: 'Trollryggen & Troll Wall',
    startHut: 'mandalen-dock',
    endHut: 'mandalen-dock',
    distance: 14,
    duration: '7-9 hours',
    elevationGain: 1700,
    elevationLoss: 1700,
    difficulty: 'Very Difficult',
    description: 'Expert terrain on the backside of the Troll Wall. The most serious objective of the trip.',
    waypoints: [
      { name: 'Trollryggen Approach', coordinates: [7.6400, 62.4450], elevation: 800, type: 'landmark' },
      { name: 'Trollryggen Summit', coordinates: [7.6500, 62.4500], elevation: 1740, type: 'summit' }
    ]
  }
];
