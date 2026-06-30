/**
 * Utility helper to handle dynamic global location translations
 * dynamically shifting the mock Bengaluru dataset to any global coordinates
 */

const BENGALURU_REF = { lat: 12.9716, lng: 77.5946 };

export const CITIES = [
  {
    name: 'Bengaluru, India',
    lat: 12.9716,
    lng: 77.5946,
    key: 'bengaluru',
    nodes: [
      'Silk Board Junction',
      'KR Puram Bridge',
      'Hebbal Flyover',
      'Marathahalli Jn',
      'Electronic City',
      'Bannerghatta Road',
      'Whitefield Hub',
      'Yelahanka'
    ]
  },
  {
    name: 'New York, USA',
    lat: 40.7128,
    lng: -74.0060,
    key: 'new_york',
    nodes: [
      'Times Square',
      'Brooklyn Bridge',
      'Grand Central',
      'Penn Station',
      'Lincoln Tunnel',
      'Broadway Ave',
      'Central Park Hub',
      'Queensboro Bridge'
    ]
  },
  {
    name: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    key: 'london',
    nodes: [
      'Piccadilly Circus',
      'Tower Bridge',
      'London Bridge',
      'Westminster Hub',
      'Waterloo Station',
      'Hyde Park Corner',
      'Canary Wharf',
      'Wembley Junction'
    ]
  },
  {
    name: 'Paris, France',
    lat: 48.8566,
    lng: 2.3522,
    key: 'paris',
    nodes: [
      'Arc de Triomphe',
      'Eiffel Tower',
      'Louvre Junction',
      'Notre Dame Bridge',
      'Place de la Concorde',
      'Champs-Élysées',
      'Gare du Nord Hub',
      'Seine Crossing'
    ]
  },
  {
    name: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    key: 'tokyo',
    nodes: [
      'Shibuya Crossing',
      'Rainbow Bridge',
      'Tokyo Station',
      'Shinjuku Hub',
      'Roppongi Junction',
      'Ginza Crossing',
      'Ueno Park Hub',
      'Tokyo Tower Jn'
    ]
  }
];

export function getActiveLocation() {
  const stored = localStorage.getItem('active_location');
  if (!stored) return CITIES[0];
  try {
    const parsed = JSON.parse(stored);
    if (parsed && 
        typeof parsed.lat === 'number' && !isNaN(parsed.lat) && isFinite(parsed.lat) &&
        typeof parsed.lng === 'number' && !isNaN(parsed.lng) && isFinite(parsed.lng)) {
      return parsed;
    }
    return CITIES[0];
  } catch (e) {
    return CITIES[0];
  }
}

export function setActiveLocation(location) {
  localStorage.setItem('active_location', JSON.stringify(location));
}

export function getShiftedCoordinates(lat, lng) {
  const active = getActiveLocation();
  const dLat = (active && typeof active.lat === 'number' && !isNaN(active.lat)) ? active.lat - BENGALURU_REF.lat : 0;
  const dLng = (active && typeof active.lng === 'number' && !isNaN(active.lng)) ? active.lng - BENGALURU_REF.lng : 0;
  return { lat: lat + dLat, lng: lng + dLng };
}

export function getShiftedMapCenter() {
  const active = getActiveLocation();
  if (active && 
      typeof active.lat === 'number' && !isNaN(active.lat) && isFinite(active.lat) &&
      typeof active.lng === 'number' && !isNaN(active.lng) && isFinite(active.lng)) {
    return [active.lat, active.lng];
  }
  return [BENGALURU_REF.lat, BENGALURU_REF.lng];
}

export function getShiftedNodes(baseNodes) {
  const active = getActiveLocation();
  const dLat = (active && typeof active.lat === 'number' && !isNaN(active.lat)) ? active.lat - BENGALURU_REF.lat : 0;
  const dLng = (active && typeof active.lng === 'number' && !isNaN(active.lng)) ? active.lng - BENGALURU_REF.lng : 0;

  return baseNodes.map((node) => {
    const localizedName = (active && active.nodes && active.nodes[node.id]) || node.name;
    const shifted = { ...node, name: localizedName };
    if (typeof node.lat === 'number' && !isNaN(node.lat) && typeof node.lng === 'number' && !isNaN(node.lng)) {
      shifted.lat = node.lat + dLat;
      shifted.lng = node.lng + dLng;
    }
    return shifted;
  });
}

export function getShiftedGeoJSON(geoJSON) {
  const active = getActiveLocation();
  const dLat = (active && typeof active.lat === 'number' && !isNaN(active.lat)) ? active.lat - BENGALURU_REF.lat : 0;
  const dLng = (active && typeof active.lng === 'number' && !isNaN(active.lng)) ? active.lng - BENGALURU_REF.lng : 0;

  if (!geoJSON || geoJSON.type !== 'FeatureCollection') return geoJSON;

  const features = geoJSON.features.map((feature) => {
    if (!feature.geometry || feature.geometry.type !== 'LineString') return feature;
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [
      typeof lng === 'number' && !isNaN(lng) ? lng + dLng : 0,
      typeof lat === 'number' && !isNaN(lat) ? lat + dLat : 0
    ]);
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: coords
      }
    };
  });

  return {
    ...geoJSON,
    features
  };
}
