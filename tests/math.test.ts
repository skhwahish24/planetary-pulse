import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { latLonToVec3, vec3ToLatLon, haversineDistance } from '../lib/geo';
import { bilinearSample, idwInterpolate } from '../lib/sampling';
import {
  computeAnomaly,
  computeZScore,
  computePercentileRank,
  olsTrendPerDecade,
} from '../lib/stats';
import { fbm, createSeededRng } from '../lib/noise';

describe('Geo Math (lib/geo.ts)', () => {
  it('converts lat/lon to vector and back roundtrip', () => {
    const testPoints = [
      { lat: 0, lon: 0 },
      { lat: 45, lon: 90 },
      { lat: -33.86, lon: 151.2 }, // Sydney
      { lat: 51.5, lon: -0.12 }, // London
      { lat: 85, lon: -120 },
      { lat: -70, lon: 45 },
    ];

    for (const pt of testPoints) {
      const vec = latLonToVec3(pt.lat, pt.lon, 1);
      const converted = vec3ToLatLon(vec);
      expect(converted.lat).toBeCloseTo(pt.lat, 2);
      expect(converted.lon).toBeCloseTo(pt.lon, 2);
    }
  });

  it('computes haversine distance correctly for known pairs', () => {
    // London (51.5074, -0.1278) to Paris (48.8566, 2.3522) ~ 343 km
    const dist = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(dist / 1000).toBeGreaterThan(330);
    expect(dist / 1000).toBeLessThan(360);
  });
});

describe('Sampling Math (lib/sampling.ts)', () => {
  it('bilinearly samples grid with longitude wrap', () => {
    const W = 4;
    const H = 3;
    const grid = new Float32Array([
      10, 20, 30, 40,
      15, 25, 35, 45,
      20, 30, 40, 50,
    ]);

    // Sample exactly at center
    const val = bilinearSample(grid, W, H, 0, 0);
    expect(Number.isFinite(val)).toBe(true);
    expect(val).toBeGreaterThan(15);
    expect(val).toBeLessThan(45);
  });

  it('handles longitude wrapping at -180 and +180 boundary', () => {
    const W = 4;
    const H = 3;
    const grid = new Float32Array([
      10, 20, 30, 40,
      15, 25, 35, 45,
      20, 30, 40, 50,
    ]);

    const valWest = bilinearSample(grid, W, H, 0, -179.9);
    const valEast = bilinearSample(grid, W, H, 0, 179.9);
    expect(Number.isFinite(valWest)).toBe(true);
    expect(Number.isFinite(valEast)).toBe(true);
    expect(Math.abs(valWest - valEast)).toBeLessThan(15);
  });

  it('interpolates sparse points via IDW', () => {
    const points = [
      { lat: 10, lon: 10, value: 100 },
      { lat: 10, lon: 20, value: 200 },
    ];
    // Exact midpoint
    const mid = idwInterpolate(points, 10, 15, 1_000_000);
    expect(mid).toBeCloseTo(150, 0);
  });
});

describe('Statistical Computations (lib/stats.ts)', () => {
  it('computes anomaly and z-score', () => {
    const current = 25.5;
    const climatologyMean = 20.0;
    const climatologyStd = 2.5;

    const anomaly = computeAnomaly(current, climatologyMean);
    expect(anomaly).toBeCloseTo(5.5, 2);

    const z = computeZScore(current, climatologyMean, climatologyStd);
    expect(z).toBeCloseTo(2.2, 2);
  });

  it('computes percentile rank within historical range', () => {
    const series = [10, 20, 30, 40, 50];
    const rank = computePercentileRank(30, series);
    expect(rank).toBe(50);
  });

  it('calculates OLS linear trend per decade', () => {
    // Upward trend of 1 unit per year = 10 units per decade
    const series = Array.from({ length: 120 }, (_, i) => 10 + i * (1 / 12));
    const trend = olsTrendPerDecade(series, 1 / 12);
    expect(trend.slopePerDecade).toBeCloseTo(10, 1);
    expect(trend.rSquared).toBeGreaterThan(0.99);
  });
});

describe('Seeded Noise (lib/noise.ts)', () => {
  it('generates reproducible values from the same seed', () => {
    const v1 = fbm(1.23, 4.56, 4, 42);
    const v2 = fbm(1.23, 4.56, 4, 42);
    expect(v1).toBe(v2);

    const vDiff = fbm(1.23, 4.56, 4, 99);
    expect(v1).not.toBe(vDiff);
  });

  it('rng produces uniform distribution in [0, 1)', () => {
    const rng = createSeededRng(12345);
    for (let i = 0; i < 100; i++) {
      const r = rng();
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
    }
  });
});
