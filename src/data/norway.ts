import { Hut, Summit, RouteStage } from './hauteRoute';

// Romsdalsfjorden Boat Dock Locations (using Hut interface for consistency)
export const norwayHuts: Hut[] = [
  {
    id: 'andalsnes-dock',
    name: 'Åndalsnes',
    elevation: 0,
    coordinates: [7.6871, 62.5675], // [lng, lat]
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
    coordinates: [7.4451, 62.5331], // [lng, lat]
    capacity: 0,
    guardian: false,
    season: 'Year-round',
    description: 'Boat dock at Måndalen on Romsdalsfjorden. Access to western Romsdal peaks and Trolltindene.'
  }
];

// Romsdalsfjorden Region Major Summits
export const norwaySummits: Summit[] = [
  {
    id: 'store-vengetind',
    name: 'Store Vengetind',
    elevation: 1852,
    coordinates: [7.8400, 62.5076], // [lng, lat]
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
    coordinates: [7.7856, 62.4906], // [lng, lat] — 62°29'26"N 7°47'08"E
    prominence: 450,
    difficulty: 'Difficult',
    description: 'Iconic Romsdal peak with classic couloir skiing. The south couloir is a renowned ski mountaineering line.',
    firstAscent: '1827 by Hans Bjermeland, Christen Hoel',
    routeAccess: ['Åndalsnes', 'Vengedalen']
  },
  {
    id: 'kirketaket',
    name: 'Kirketaket',
    elevation: 1439,
    coordinates: [7.9071, 62.6113], // [lng, lat]
    prominence: 640,
    difficulty: 'Moderate',
    description: 'Molde-area classic. Short approach from road, excellent powder skiing with fjord views.',
    routeAccess: ['Åndalsnes', 'Road access']
  },
  {
    id: 'trollryggen',
    name: 'Trollryggen',
    elevation: 1740,
    coordinates: [7.7392, 62.4820], // [lng, lat]
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
    coordinates: [7.6667, 62.4667], // [lng, lat]
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
      { name: 'Kirketaket Summit', coordinates: [7.9071, 62.6113], elevation: 1439, type: 'summit' }
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
      { name: 'Vengedalen Trailhead', coordinates: [7.7500, 62.5000], elevation: 300, type: 'landmark' },
      { name: 'Romsdalshorn Summit', coordinates: [7.7856, 62.4906], elevation: 1550, type: 'summit' }
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
      { name: 'Vengedalen', coordinates: [7.7600, 62.5050], elevation: 400, type: 'landmark' },
      { name: 'Store Vengetind Summit', coordinates: [7.8400, 62.5076], elevation: 1852, type: 'summit' }
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
      { name: 'Trollstigen Road', coordinates: [7.6700, 62.4600], elevation: 500, type: 'landmark' },
      { name: 'Bispen Summit', coordinates: [7.6667, 62.4667], elevation: 1462, type: 'summit' }
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
      { name: 'Trollryggen Approach', coordinates: [7.7300, 62.4800], elevation: 800, type: 'landmark' },
      { name: 'Trollryggen Summit', coordinates: [7.7392, 62.4820], elevation: 1740, type: 'summit' }
    ]
  }
];
