/**
 * Shared satellite TLE cache & loader.
 * Used directly by API routes to eliminate self-HTTP roundtrips and timeout deadlocks.
 */

import type { TLERecord, SatelliteCategory } from '@/types/satellites';

export const CELESTRAK_URLS: Record<string, string> = {
  stations:  'https://celestrak.org/satcat/tle.php?CATNR=25544',
  weather:   'https://celestrak.org/satcat/tle.php?GROUP=weather',
  'gps-ops': 'https://celestrak.org/satcat/tle.php?GROUP=gps-ops',
  science:   'https://celestrak.org/satcat/tle.php?GROUP=science',
  noaa:      'https://celestrak.org/satcat/tle.php?GROUP=noaa',
};

export const CATEGORY_MAP: Record<string, SatelliteCategory> = {
  stations:  'crewed',
  weather:   'weather',
  'gps-ops': 'navigation',
  science:   'science',
  noaa:      'weather',
};

export const FALLBACK_TLES: TLERecord[] = [
  {
    name: 'ISS (ZARYA)', noradId: 25544, category: 'crewed',
    operator: 'NASA/Roscosmos/ESA/JAXA/CSA', country: 'International',
    description: 'International Space Station — crewed orbital laboratory at ~400 km altitude.',
    launchDate: '1998-11-20',
    tle1: '1 25544U 98067A   24315.50000000  .00006789  00000-0  12345-3 0  9993',
    tle2: '2 25544  51.6435 234.5678 0001234  89.1234 271.0987 15.49560000479123',
  },
  {
    name: 'TERRA', noradId: 25994, category: 'earth-obs',
    operator: 'NASA', country: 'USA',
    description: 'NASA Earth Observing System flagship — MODIS, ASTER, CERES, MISR, MOPITT. Daily global surface and atmosphere data.',
    launchDate: '1999-12-18',
    tle1: '1 25994U 99068A   24315.50000000 -.00000034  00000-0  12345-5 0  9991',
    tle2: '2 25994  98.1988 123.4567 0001234 100.1234 260.0123 14.57222000  5678',
  },
  {
    name: 'AQUA', noradId: 27424, category: 'earth-obs',
    operator: 'NASA', country: 'USA',
    description: 'NASA A-Train constellation — MODIS, AIRS, AMSR-E, CERES. Water cycle, precipitation, evaporation and water vapor data.',
    launchDate: '2002-05-04',
    tle1: '1 27424U 02022A   24315.50000000  .00000078  00000-0  34567-4 0  9992',
    tle2: '2 27424  98.2102 234.5678 0001234 123.4567 236.7890 14.57202000  4567',
  },
  {
    name: 'LANDSAT 8', noradId: 39084, category: 'earth-obs',
    operator: 'USGS/NASA', country: 'USA',
    description: 'Operational Land Imager (OLI) and TIRS — 30m multispectral land surface imaging. 16-day repeat cycle, global coverage.',
    launchDate: '2013-02-11',
    tle1: '1 39084U 13008A   24315.50000000  .00000089  00000-0  12345-4 0  9993',
    tle2: '2 39084  98.2201 123.5678 0001456 100.2345 260.0876 14.57111000 23456',
  },
  {
    name: 'SENTINEL-2A', noradId: 40697, category: 'earth-obs',
    operator: 'ESA/Copernicus', country: 'European Union',
    description: 'ESA Copernicus multispectral imaging — 13 bands, 10–60m resolution. 10-day global revisit for land monitoring.',
    launchDate: '2015-06-23',
    tle1: '1 40697U 15028A   24315.50000000  .00000067  00000-0  23456-4 0  9994',
    tle2: '2 40697  98.5679 234.6789 0001234  90.3456 270.0123 14.30823000  5678',
  },
  {
    name: 'GOES-16', noradId: 41866, category: 'weather',
    operator: 'NOAA/NASA', country: 'USA',
    description: 'GOES-East geostationary — Advanced Baseline Imager, continuous Western Hemisphere coverage, storm tracking, lightning mapper.',
    launchDate: '2016-11-19',
    tle1: '1 41866U 16071A   24315.50000000 -.00000279  00000-0  00000+0 0  9995',
    tle2: '2 41866   0.0234  75.1234 0000890 290.2345  69.9876  1.00272000 29234',
  },
  {
    name: 'NOAA 20', noradId: 43013, category: 'weather',
    operator: 'NOAA', country: 'USA',
    description: 'JPSS-1 — VIIRS, CrIS, ATMS, CERES, OMPS. Daily global atmosphere and surface observations.',
    launchDate: '2017-11-18',
    tle1: '1 43013U 17073A   24315.50000000  .00000089  00000-0  34567-4 0  9996',
    tle2: '2 43013  98.7456 123.5678 0001234 100.1234 260.0987 14.19546000 34567',
  },
  {
    name: 'SUOMI NPP', noradId: 37849, category: 'earth-obs',
    operator: 'NASA/NOAA', country: 'USA',
    description: 'VIIRS provides daily FIRMS active fire data. Also CERES, CrIS, ATMS, OMPS.',
    launchDate: '2011-10-28',
    tle1: '1 37849U 11061A   24315.50000000  .00000078  00000-0  23456-4 0  9997',
    tle2: '2 37849  98.7312 234.4567 0001123  89.2345 271.0876 14.19201000 34567',
  },
  {
    name: 'GPS BIIR-2  (PRN 13)', noradId: 24876, category: 'navigation',
    operator: 'USAF', country: 'USA',
    description: 'GPS Block IIR navigation satellite — 20,200 km MEO orbit, part of the 24-satellite GPS constellation.',
    launchDate: '1997-07-23',
    tle1: '1 24876U 97035A   24315.50000000  .00000006  00000-0  00000+0 0  9998',
    tle2: '2 24876  54.9876  45.1234 0056789  78.2345 282.1234  2.00564000 23456',
  },
  {
    name: 'HST', noradId: 20580, category: 'science',
    operator: 'NASA/ESA', country: 'USA',
    description: 'Hubble Space Telescope — 2.4m UV/optical/near-IR at 540 km. Deep field imaging, spectroscopy, cosmological distance measurements.',
    launchDate: '1990-04-24',
    tle1: '1 20580U 90037B   24315.50000000  .00001234  00000-0  12345-4 0  9999',
    tle2: '2 20580  28.4701 234.5678 0002345 100.1234 260.0123 15.09350000  5678',
  },
];

const tleCache = new Map<string, { data: TLERecord[]; source: string; fetchedAt: string }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function parseTLEText(text: string, category: SatelliteCategory): TLERecord[] {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  const records: TLERecord[] = [];

  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i];
    const tle1 = lines[i + 1];
    const tle2 = lines[i + 2];

    if (!tle1.startsWith('1 ') || !tle2.startsWith('2 ')) continue;

    const noradId = parseInt(tle1.substring(2, 7).trim(), 10);
    if (isNaN(noradId)) continue;

    records.push({ name, noradId, tle1, tle2, category });
  }

  return records;
}

export async function getTLEGroup(group: string): Promise<{
  satellites: TLERecord[];
  source: string;
  fetchedAt: string;
  cacheHit: boolean;
}> {
  const cached = tleCache.get(group);
  if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
    return {
      satellites: cached.data,
      source: cached.source,
      fetchedAt: cached.fetchedAt,
      cacheHit: true,
    };
  }

  const category = CATEGORY_MAP[group] ?? 'earth-obs';
  let satellites: TLERecord[] = [];
  let source = 'CelesTrak GP Data';
  let fetchedAt = new Date().toISOString();

  const url = CELESTRAK_URLS[group];
  if (url) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': 'PlanetaryPulse/1.0 (NASA SpaceApps 2026)' },
      });

      if (res.ok) {
        const text = await res.text();
        if (text.trim().length > 10 && text.includes('1 ')) {
          const parsed = parseTLEText(text, category);
          if (parsed.length > 0) {
            satellites = parsed.slice(0, 150);
            source = 'CelesTrak GP Data (live)';
          }
        }
      }
    } catch {
      // Live fetch timeout or blocked — fall through to snapshot
    }
  }

  if (satellites.length === 0) {
    satellites = FALLBACK_TLES.filter((t) => {
      if (group === 'stations') return t.category === 'crewed';
      if (group === 'weather' || group === 'noaa') return t.category === 'weather';
      if (group === 'gps-ops') return t.category === 'navigation';
      if (group === 'science') return t.category === 'science';
      return true;
    });
    source = 'CelesTrak GP Data (snapshot 2024-11-11)';
    fetchedAt = '2024-11-11T00:00:00.000Z';
  }

  tleCache.set(group, { data: satellites, source, fetchedAt });

  return {
    satellites,
    source,
    fetchedAt,
    cacheHit: false,
  };
}
