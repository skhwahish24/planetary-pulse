import { describe, it, expect } from 'vitest';
import { parseTLE, propagate, orbitalParams, computeGroundTrack } from '@/lib/sgp4';

const ISS_TLE = {
  name: 'ISS (ZARYA)',
  noradId: 25544,
  tle1: '1 25544U 98067A   24315.50000000  .00006789  00000-0  12345-3 0  9993',
  tle2: '2 25544  51.6435 234.5678 0001234  89.1234 271.0987 15.49560000479123',
};

describe('SGP4 Satellite Propagation', () => {
  it('parses valid two-line element set without error', () => {
    const satrec = parseTLE(ISS_TLE.name, ISS_TLE.noradId, ISS_TLE.tle1, ISS_TLE.tle2);
    expect(satrec).not.toBeNull();
    expect(satrec?.name).toBe('ISS (ZARYA)');
    expect(satrec?.noradId).toBe(25544);
  });

  it('rejects invalid or corrupted TLE strings', () => {
    const satrec = parseTLE('INVALID', 99999, 'bad line 1', 'bad line 2');
    expect(satrec).toBeNull();
  });

  it('calculates physically plausible orbital parameters for ISS', () => {
    const satrec = parseTLE(ISS_TLE.name, ISS_TLE.noradId, ISS_TLE.tle1, ISS_TLE.tle2);
    expect(satrec).not.toBeNull();
    if (!satrec) return;

    const params = orbitalParams(satrec);
    // ISS inclination is nominally ~51.64°
    expect(params.inclination).toBeGreaterThan(51.0);
    expect(params.inclination).toBeLessThan(52.5);

    // ISS period is ~92-93 minutes (15.5 revs/day)
    expect(params.periodMin).toBeGreaterThan(90);
    expect(params.periodMin).toBeLessThan(96);

    // ISS perigee/apogee altitude is around 400-450 km
    expect(params.perigeeKm).toBeGreaterThan(350);
    expect(params.apogeeKm).toBeLessThan(500);
  });

  it('propagates realistic instantaneous position and velocity', () => {
    const satrec = parseTLE(ISS_TLE.name, ISS_TLE.noradId, ISS_TLE.tle1, ISS_TLE.tle2);
    expect(satrec).not.toBeNull();
    if (!satrec) return;

    // Propagate at fixed test date (epoch ~day 315 of 2024 is Nov 10, 2024)
    const testDate = new Date('2024-11-10T12:00:00Z');
    const pos = propagate(satrec, testDate);

    expect(pos).not.toBeNull();
    if (!pos) return;

    // Lat must not exceed inclination bounds [-52°, +52°]
    expect(pos.lat).toBeGreaterThanOrEqual(-52.0);
    expect(pos.lat).toBeLessThanOrEqual(52.0);

    // Lon must be in [-180°, 180°]
    expect(pos.lon).toBeGreaterThanOrEqual(-180.0);
    expect(pos.lon).toBeLessThanOrEqual(180.0);

    // Orbital speed in LEO is roughly 7.6 to 7.8 km/s
    expect(pos.velocityKms).toBeGreaterThan(7.0);
    expect(pos.velocityKms).toBeLessThan(8.2);

    // Altitude in LEO should be roughly 400-450 km
    expect(pos.altKm).toBeGreaterThan(380);
    expect(pos.altKm).toBeLessThan(460);
  });

  it('computes ground tracks with valid coordinates', () => {
    const satrec = parseTLE(ISS_TLE.name, ISS_TLE.noradId, ISS_TLE.tle1, ISS_TLE.tle2);
    expect(satrec).not.toBeNull();
    if (!satrec) return;

    const track = computeGroundTrack(satrec, new Date('2024-11-10T12:00:00Z'), 90, 10);
    expect(track.length).toBe(11);
    for (const [lat, lon] of track) {
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lon).toBeGreaterThanOrEqual(-180);
      expect(lon).toBeLessThanOrEqual(180);
    }
  });
});
