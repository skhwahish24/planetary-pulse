/**
 * SGP4 propagation wrapper using satellite.js
 * SERVER-ONLY — satellite.js uses WASM/pthreads, runs only in Node.js.
 * All positions are calculated from real TLE orbital elements — never fabricated.
 */

import * as sat from 'satellite.js';
import type { SatellitePosition, SatelliteOrbitalParams, SatellitePass } from '@/types/satellites';

export interface Satrec {
  _satrec: sat.SatRec;
  name: string;
  noradId: number;
}

/** Parse TLE lines into a Satrec object. Returns null on parse failure. */
export function parseTLE(name: string, noradId: number, tle1: string, tle2: string): Satrec | null {
  try {
    const t1 = tle1.trim();
    const t2 = tle2.trim();
    if (!t1.startsWith('1 ') || !t2.startsWith('2 ')) return null;
    const satrec = sat.twoline2satrec(t1, t2);
    if (satrec.error !== 0 || isNaN(satrec.no) || isNaN(satrec.inclo)) return null;
    return { _satrec: satrec, name, noradId };
  } catch {
    return null;
  }
}

/** Propagate a satellite to the given Date. Returns null if propagation fails. */
export function propagate(rec: Satrec, date: Date): SatellitePosition | null {
  try {
    const posVel = sat.propagate(rec._satrec, date);
    if (!posVel) return null;

    const pos = posVel.position;
    const vel = posVel.velocity;

    if (!pos || typeof pos === 'boolean') return null;
    if (!vel || typeof vel === 'boolean') return null;

    const p = pos as sat.EciVec3<number>;
    const v = vel as sat.EciVec3<number>;

    const gmst = sat.gstime(date);
    const geo = sat.eciToGeodetic(p, gmst);

    return {
      lat: sat.degreesLat(geo.latitude),
      lon: sat.degreesLong(geo.longitude),
      altKm: geo.height,
      velocityKms: Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
      timestamp: date.getTime(),
    };
  } catch {
    return null;
  }
}

/** Derive orbital parameters from TLE mean elements. */
export function orbitalParams(rec: Satrec): SatelliteOrbitalParams {
  const s = rec._satrec;
  const muKm3s2 = 398600.4418;
  const earthRadiusKm = 6371.0;

  const noRadPerMin = s.no;
  const noRadPerSec = noRadPerMin / 60.0;
  const sma = Math.cbrt(muKm3s2 / (noRadPerSec * noRadPerSec));
  const ecc = s.ecco;

  return {
    inclination:  s.inclo * (180 / Math.PI),
    eccentricity: ecc,
    periodMin:    (2 * Math.PI) / noRadPerMin,
    apogeeKm:     Math.max(0, sma * (1 + ecc) - earthRadiusKm),
    perigeeKm:    Math.max(0, sma * (1 - ecc) - earthRadiusKm),
    raan:         s.nodeo * (180 / Math.PI),
  };
}

/** Compute N ground-track lat/lon points over durationMinutes. */
export function computeGroundTrack(
  rec: Satrec,
  startDate: Date,
  durationMinutes: number,
  steps: number = 120
): Array<[number, number]> {
  const track: Array<[number, number]> = [];
  const stepMs = (durationMinutes * 60000) / steps;
  for (let i = 0; i <= steps; i++) {
    const pos = propagate(rec, new Date(startDate.getTime() + i * stepMs));
    if (pos) track.push([pos.lat, pos.lon]);
  }
  return track;
}

/**
 * Predict satellite passes over an observer.
 * Uses 10-second sampling — accurate enough for elevation > 10°.
 */
export function predictPasses(
  rec: Satrec,
  observerLat: number,
  observerLon: number,
  observerAltKm: number,
  startDate: Date,
  durationHours: number = 24,
  maxPasses: number = 3,
  minElevationDeg: number = 10
): SatellitePass[] {
  const passes: SatellitePass[] = [];
  const stepMs = 10_000;
  const endMs = startDate.getTime() + durationHours * 3_600_000;

  const observerGd: sat.GeodeticLocation = {
    longitude: observerLon * (Math.PI / 180),
    latitude:  observerLat * (Math.PI / 180),
    height:    observerAltKm,
  };

  let inPass = false;
  let riseMs = 0;
  let maxElev = 0;
  let culminationMs = 0;

  for (let t = startDate.getTime(); t < endMs; t += stepMs) {
    const date = new Date(t);
    const posVel = sat.propagate(rec._satrec, date);
    if (!posVel) continue;

    const pos = posVel.position;
    if (!pos || typeof pos === 'boolean') continue;

    const p = pos as sat.EciVec3<number>;
    const gmst = sat.gstime(date);
    const ecf = sat.eciToEcf(p, gmst);
    const lookAngles = sat.ecfToLookAngles(observerGd, ecf);
    const elevDeg = (lookAngles.elevation as number) * (180 / Math.PI);

    if (elevDeg >= minElevationDeg) {
      if (!inPass) {
        inPass = true;
        riseMs = t;
        maxElev = elevDeg;
        culminationMs = t;
      } else if (elevDeg > maxElev) {
        maxElev = elevDeg;
        culminationMs = t;
      }
    } else if (inPass) {
      inPass = false;
      passes.push({ riseTimeMs: riseMs, culminationTimeMs: culminationMs, setTimeMs: t, maxElevationDeg: maxElev });
      if (passes.length >= maxPasses) break;
    }
  }

  return passes;
}
