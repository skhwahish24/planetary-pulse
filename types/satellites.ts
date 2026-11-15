// Satellite tracking types — SGP4 / TLE based, no fabricated positions

export type SatelliteCategory =
  | 'earth-obs'
  | 'weather'
  | 'navigation'
  | 'communications'
  | 'science'
  | 'crewed';

export interface TLERecord {
  name: string;
  noradId: number;
  tle1: string;
  tle2: string;
  category: SatelliteCategory;
  operator?: string;
  description?: string;
  launchDate?: string;
  country?: string;
}

export interface SatellitePosition {
  lat: number;
  lon: number;
  altKm: number;
  velocityKms: number;
  /** Unix epoch ms */
  timestamp: number;
}

export interface SatelliteOrbitalParams {
  inclination: number;   // degrees
  eccentricity: number;
  periodMin: number;     // orbital period minutes
  apogeeKm: number;
  perigeeKm: number;
  raan: number;          // right ascension of ascending node, degrees
}

export interface SatellitePass {
  riseTimeMs: number;
  culminationTimeMs: number;
  setTimeMs: number;
  maxElevationDeg: number;
}

export interface TLEApiResponse {
  satellites: TLERecord[];
  fetchedAt: string;
  source: string;
  group: string;
  cacheHit: boolean;
}

export const SATELLITE_CATEGORY_COLORS: Record<SatelliteCategory, string> = {
  'earth-obs':    '#22d3ee',   // cyan
  weather:        '#facc15',   // yellow
  navigation:     '#4ade80',   // green
  communications: '#f97316',   // orange
  science:        '#c084fc',   // purple
  crewed:         '#f8fafc',   // white
};

export const SATELLITE_CATEGORY_LABELS: Record<SatelliteCategory, string> = {
  'earth-obs':    'Earth Observation',
  weather:        'Weather',
  navigation:     'Navigation (GNSS)',
  communications: 'Communications',
  science:        'Science',
  crewed:         'Crewed / ISS',
};

export const SATELLITE_GROUPS: Record<string, { label: string; categories: SatelliteCategory[] }> = {
  stations:   { label: 'Space Stations',   categories: ['crewed'] },
  'active':   { label: 'Active Satellites', categories: ['earth-obs', 'weather', 'science'] },
  weather:    { label: 'Weather',           categories: ['weather'] },
  'gps-ops':  { label: 'GPS Constellation', categories: ['navigation'] },
  science:    { label: 'Science Missions',  categories: ['science'] },
  'noaa':     { label: 'NOAA',             categories: ['weather'] },
};
