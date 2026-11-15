import type { DataProvider } from '../provider';
import type { GridField, PointReport, PointLayerReport, FactorEntry } from '@/types/data';
import { LAYER_REGISTRY } from '@/lib/layers';
import type { LayerId } from '@/types/layers';
import { fbm, createSeededRng } from '@/lib/noise';
import {
  computeAnomaly,
  computeZScore,
  computePercentileRank,
  olsTrendPerDecade,
  mean,
  stdDev,
} from '@/lib/stats';
import { bilinearSample } from '@/lib/sampling';

const GRID_W = 360;
const GRID_H = 181;

export const GEOGRAPHIC_ANCHORS = [
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278, isOcean: false },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, isOcean: false },
  { name: 'New York, United States', lat: 40.7128, lon: -74.006, isOcean: false },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, isOcean: false },
  { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357, isOcean: false },
  { name: 'Mumbai, India', lat: 19.076, lon: 72.8777, isOcean: false },
  { name: 'São Paulo, Brazil', lat: -23.5505, lon: -46.6333, isOcean: false },
  { name: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426, isOcean: false },
  { name: 'Tasman Sea (Off New Zealand)', lat: -41.1, lon: 170.5, isOcean: true },
  { name: 'Gulf Stream Basin', lat: 34.0, lon: -65.0, isOcean: true },
  { name: 'Equatorial Pacific (El Niño Region)', lat: 0.0, lon: -140.0, isOcean: true },
  { name: 'Southern Ocean Drift', lat: -56.0, lon: -100.0, isOcean: true },
  { name: 'North Atlantic Deep', lat: 48.0, lon: -30.0, isOcean: true },
  { name: 'Sargasso Sea', lat: 28.0, lon: -55.0, isOcean: true },
];

function reverseGeocode(lat: number, lon: number): { placeName: string; isOcean: boolean } {
  let nearestDist = Infinity;
  let nearest = GEOGRAPHIC_ANCHORS[0];

  for (const anchor of GEOGRAPHIC_ANCHORS) {
    const dLat = anchor.lat - lat;
    const dLon = anchor.lon - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = anchor;
    }
  }

  if (nearestDist < 6.0) {
    return { placeName: nearest.name, isOcean: nearest.isOcean };
  }

  const isOcean = Math.abs(lat) > 80 ? false : Math.cos((lat * Math.PI) / 180) > 0.35 && Math.abs(lon + 140) < 60;
  const latHem = lat >= 0 ? `${lat.toFixed(1)}°N` : `${Math.abs(lat).toFixed(1)}°S`;
  const lonHem = lon >= 0 ? `${lon.toFixed(1)}°E` : `${Math.abs(lon).toFixed(1)}°W`;

  if (lat > 66) return { placeName: `Arctic Basin (${latHem}, ${lonHem})`, isOcean: true };
  if (lat < -60) return { placeName: `Southern Ocean (${latHem}, ${lonHem})`, isOcean: true };
  return { placeName: `Observation Point (${latHem}, ${lonHem})`, isOcean };
}

function isOceanCoordinate(lat: number, lon: number): boolean {
  // Polar ice shelves
  if (lat < -78) return false; // Antarctica
  if (lat > 84) return true; // Arctic ocean

  // Known ocean anchors override
  for (const anchor of GEOGRAPHIC_ANCHORS) {
    if (anchor.isOcean) {
      const dLat = anchor.lat - lat;
      const dLon = anchor.lon - lon;
      if (Math.sqrt(dLat * dLat + dLon * dLon) < 8.0) return true;
    }
  }

  // Major continental bounding approximations
  // North America
  if (lat > 15 && lat < 72 && lon > -168 && lon < -52) return false;
  // South America
  if (lat > -56 && lat <= 15 && lon > -82 && lon < -34) return false;
  // Eurasia
  if (lat > 35 && lat < 78 && lon > -10 && lon < 170) return false;
  // Africa
  if (lat > -35 && lat <= 35 && lon > -18 && lon < 52) return false;
  // Australia
  if (lat > -40 && lat < -10 && lon > 112 && lon < 154) return false;

  return true;
}

/** Precomputed ocean mask (1 = ocean, 0 = land). */
const oceanMask = new Uint8Array(GRID_W * GRID_H);
let isMaskReady = false;

function getOceanMask(): Uint8Array {
  if (isMaskReady) return oceanMask;
  for (let j = 0; j < GRID_H; j++) {
    const lat = 90 - (j / (GRID_H - 1)) * 180;
    for (let i = 0; i < GRID_W; i++) {
      const lon = -180 + (i / GRID_W) * 360;
      oceanMask[j * GRID_W + i] = isOceanCoordinate(lat, lon) ? 1 : 0;
    }
  }
  isMaskReady = true;
  return oceanMask;
}

export class MockDataProvider implements DataProvider {
  private cache = new Map<string, GridField>();

  async getGridField(layerId: string, timeIso: string): Promise<GridField> {
    const key = `${layerId}:${timeIso.slice(0, 10)}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const def = LAYER_REGISTRY[layerId as LayerId] || LAYER_REGISTRY['temperature'];
    const mask = getOceanMask();
    const scalar = new Float32Array(GRID_W * GRID_H);
    const isOcean = def.mask === 'ocean';

    let uComp: Float32Array | undefined;
    let vComp: Float32Array | undefined;
    if (def.vector) {
      uComp = new Float32Array(GRID_W * GRID_H);
      vComp = new Float32Array(GRID_W * GRID_H);
    }

    const [rMin, rMax] = def.range;
    const seed = layerId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 42);
    const month = new Date(timeIso).getUTCMonth(); // 0-11

    for (let j = 0; j < GRID_H; j++) {
      const lat = 90 - (j / (GRID_H - 1)) * 180;
      const latRad = (lat * Math.PI) / 180;
      const cosLat = Math.cos(latRad);

      for (let i = 0; i < GRID_W; i++) {
        const idx = j * GRID_W + i;
        const lon = -180 + (i / GRID_W) * 360;

        if (isOcean && mask[idx] === 0) {
          scalar[idx] = NaN;
          if (uComp && vComp) {
            uComp[idx] = 0;
            vComp[idx] = 0;
          }
          continue;
        }

        let val = 0;

        switch (layerId) {
          case 'temperature': {
            // Realistic atmospheric global temperature gradient: -50°C polar to +35°C tropical + seasonal shift
            const baseTemp = -45 + 75 * Math.pow(Math.max(0, cosLat), 0.9);
            const seasonal = Math.sin(((month - 3) / 12) * Math.PI * 2) * (lat >= 0 ? 8.5 : -8.5) * Math.abs(Math.sin(latRad));
            const noise = fbm(lon / 50, lat / 35, 4, seed) * 7.0;
            val = baseTemp + seasonal + noise;
            break;
          }
          case 'anomaly': {
            // Temperature anomaly centered at 0 with Arctic amplification
            const polarAmp = 1.0 + (lat > 50 ? (lat - 50) / 25 : 0.0);
            const noise = fbm(lon / 35, lat / 25, 4, seed + 10);
            val = noise * 2.8 * polarAmp;
            break;
          }
          case 'aqi': {
            // Air quality index: high in continental industrial zones, low over oceans
            const isContinent = mask[idx] === 0;
            const noise = (fbm(lon / 30, lat / 25, 4, seed + 20) + 1) * 0.5;
            val = isContinent ? 35 + noise * 190 : 8 + noise * 30;
            break;
          }
          case 'wind': {
            // Wind speed: trade winds, mid-latitude westerlies, polar easterlies
            const jet = Math.exp(-Math.pow((Math.abs(lat) - 45) / 14, 2));
            const noise = (fbm(lon / 40, lat / 30, 4, seed + 30) + 1) * 0.5;
            val = 3.0 + jet * 16.0 + noise * 8.0;
            if (uComp && vComp) {
              const uSign = lat > 0 && lat < 30 ? -1 : lat > 35 && lat < 65 ? 1 : -0.5;
              uComp[idx] = uSign * (val * 0.85);
              vComp[idx] = (fbm(lon / 30, lat / 30, 3, seed + 40)) * 6.0;
            }
            break;
          }
          case 'sst': {
            // Sea Surface Temperature: Calibrated realistic
            // Equator (lat 0) -> 27°C - 30°C
            // Tasman Sea (-41°S) -> 13°C - 16°C
            // Southern Ocean (-56°S) -> -1.0°C - 2.5°C
            // Gulf Stream (lat 34, lon -65) -> 22°C - 27°C
            const latFactor = Math.pow(Math.max(0, cosLat), 2.2);
            let tempBase = -1.8 + 31.0 * latFactor;

            // Gulf Stream warm boundary current boost
            if (lat > 25 && lat < 45 && lon > -80 && lon < -50) {
              tempBase += 4.5;
            }

            // High southern latitude polar cooling
            if (lat < -50) {
              tempBase = Math.min(2.5, tempBase * 0.4);
            }

            const anomalyNoise = fbm(lon / 40, lat / 30, 3, seed + 50) * 1.2;
            val = Math.max(-1.8, Math.min(32.0, tempBase + anomalyNoise));
            break;
          }
          case 'waves': {
            // Significant wave height: roaring 40s/50s in Southern Ocean have highest waves (4m - 7.5m)
            // Mid-latitudes (Tasman Sea): 2.0m - 4.5m
            const southernSwell = Math.exp(-Math.pow((lat + 55) / 10, 2)) * 4.6;
            const midSwell = Math.exp(-Math.pow((Math.abs(lat) - 42) / 14, 2)) * 1.6;
            const noise = (fbm(lon / 35, lat / 30, 3, seed + 60) + 1) * 0.5;
            val = 0.8 + southernSwell + midSwell + noise * 0.8;
            break;
          }
          case 'currents': {
            // Ocean currents (m/s): Boundary currents (Gulf Stream, Kuroshio) up to 1.8 m/s
            const noise = (fbm(lon / 30, lat / 25, 4, seed + 70) + 1) * 0.5;
            val = 0.1 + noise * 1.2;
            if (uComp && vComp) {
              uComp[idx] = fbm(lon / 25, lat / 25, 3, seed + 80) * 1.4;
              vComp[idx] = fbm(lon / 25, lat / 25, 3, seed + 90) * 0.9;
            }
            break;
          }
          case 'aerosols': {
            // Sahara dust corridor (lat 10-30N) and East Asian industrial plumes
            const dustPlume = lat > 10 && lat < 30 && lon > -30 && lon < 50 ? 0.6 : 0.05;
            const noise = (fbm(lon / 25, lat / 20, 3, seed + 100) + 1) * 0.5;
            val = dustPlume + noise * 0.55;
            break;
          }
          case 'humidity': {
            // Tropical ITCZ high humidity (>75%), subtropical deserts low (<35%)
            const itcz = Math.exp(-Math.pow(lat / 12, 2)) * 35;
            const maritime = mask[idx] === 1 ? 25 : 10;
            const noise = (fbm(lon / 35, lat / 25, 3, seed + 110) + 1) * 0.5;
            val = 30 + itcz + maritime + noise * 20;
            break;
          }
          case 'ndvi': {
            // Vegetation NDVI: Tropical rainforests ~0.8-0.88, deserts <0.12, boreal ~0.55
            const isContinent = mask[idx] === 0;
            if (!isContinent) {
              val = 0.02; // Ocean phytoplankton baseline
            } else {
              const tropicalForest = Math.exp(-Math.pow(lat / 12, 2)) * 0.5;
              const desertBelt = (lat > 15 && lat < 35 && lon > -15 && lon < 60) ? -0.4 : 0.0;
              const noise = (fbm(lon / 30, lat / 25, 4, seed + 120) + 1) * 0.5;
              val = Math.max(0.05, 0.25 + tropicalForest + desertBelt + noise * 0.35);
            }
            break;
          }
          case 'agriculture': {
            const noise = (fbm(lon / 30, lat / 20, 3, seed + 130) + 1) * 0.5;
            val = mask[idx] === 0 ? 35 + noise * 50 : 0;
            break;
          }
          case 'soil_moisture': {
            // SMAP Volumetric Soil Moisture m³/m³ (0.05 to 0.45)
            const noise = (fbm(lon / 25, lat / 20, 3, seed + 140) + 1) * 0.5;
            val = mask[idx] === 0 ? 0.08 + noise * 0.32 : 0.45;
            break;
          }
          case 'forestry': {
            // Canopy Height (meters): Amazon, Congo, Pacific NW up to 55m
            const isContinent = mask[idx] === 0;
            if (!isContinent) {
              val = 0;
            } else {
              const equatorial = Math.exp(-Math.pow(lat / 14, 2)) * 32;
              const noise = (fbm(lon / 25, lat / 25, 4, seed + 150) + 1) * 0.5;
              val = 8 + equatorial + noise * 18;
            }
            break;
          }
          case 'wetlands': {
            const noise = (fbm(lon / 20, lat / 20, 4, seed + 160) + 1) * 0.5;
            val = mask[idx] === 0 ? noise * 85 : 100;
            break;
          }
          case 'coastal_change': {
            const noise = fbm(lon / 15, lat / 15, 3, seed + 170) * 3.2;
            val = noise;
            break;
          }
          case 'swot_water': {
            // SWOT surface water elevation (m relative to EGM2008 geoid)
            const noise = (fbm(lon / 35, lat / 30, 4, seed + 180) + 1) * 0.5;
            val = mask[idx] === 1 ? (noise * 2.5 - 1.0) : (150 + noise * 1200);
            break;
          }
          case 'lakes_reservoirs': {
            const noise = fbm(lon / 25, lat / 25, 3, seed + 190) * 650;
            val = noise;
            break;
          }
          case 'rivers': {
            const noise = (fbm(lon / 20, lat / 20, 3, seed + 200) + 1) * 0.5;
            val = noise * 45000;
            break;
          }
          case 'wildfires': {
            // FRP in MW
            const noise = (fbm(lon / 20, lat / 20, 4, seed + 210) + 1) * 0.5;
            val = mask[idx] === 0 ? Math.pow(noise, 2.5) * 1800 : 0;
            break;
          }
          case 'floods': {
            const noise = (fbm(lon / 20, lat / 20, 3, seed + 220) + 1) * 0.5;
            val = noise * 5200;
            break;
          }
          case 'landslides': {
            // NASA LHASA risk index 0 to 4
            const steepness = (fbm(lon / 15, lat / 15, 4, seed + 230) + 1) * 0.5;
            val = mask[idx] === 0 ? steepness * 3.8 : 0;
            break;
          }
          case 'cyclones': {
            // Wind speed km/h in tropical storm belts
            const tropicalBelt = Math.abs(lat) > 8 && Math.abs(lat) < 28 ? 60 : 15;
            const noise = (fbm(lon / 25, lat / 25, 3, seed + 240) + 1) * 0.5;
            val = tropicalBelt + noise * 140;
            break;
          }
          case 'recovery': {
            const noise = fbm(lon / 25, lat / 25, 3, seed + 250) * 50;
            val = noise;
            break;
          }
          case 'sar_observations': {
            // Radar backscatter -25 to -5 dB
            const noise = (fbm(lon / 20, lat / 20, 4, seed + 260) + 1) * 0.5;
            val = -25 + noise * 18;
            break;
          }
          case 'optical_imagery': {
            const noise = (fbm(lon / 30, lat / 25, 4, seed + 270) + 1) * 0.5;
            val = 0.08 + noise * 0.65;
            break;
          }
          case 'geoca_canada': {
            // Restrict to Canada (lat 41.6 to 83.1, lon -141.0 to -52.6)
            if (lat >= 41.6 && lat <= 83.1 && lon >= -141.0 && lon <= -52.6) {
              const noise = (fbm(lon / 15, lat / 15, 3, seed + 280) + 1) * 0.5;
              val = 20 + noise * 75;
            } else {
              val = 0;
            }
            break;
          }
          default:
            val = (rMin + rMax) / 2;
        }

        scalar[idx] = Math.max(rMin, Math.min(rMax, val));
      }
    }

    const field: GridField = {
      layerId,
      W: GRID_W,
      H: GRID_H,
      scalar,
      u: uComp,
      v: vComp,
      mask: isOcean ? mask : new Uint8Array(GRID_W * GRID_H).fill(1),
      timeIso,
    };

    this.cache.set(key, field);
    return field;
  }

  async getPointReport(lat: number, lon: number, timeIso: string): Promise<PointReport> {
    const geo = reverseGeocode(lat, lon);
    const layerIds = Object.keys(LAYER_REGISTRY) as LayerId[];

    const layers: PointLayerReport[] = [];

    for (const lid of layerIds) {
      const def = LAYER_REGISTRY[lid];
      const field = await this.getGridField(lid, timeIso);
      const sampled = bilinearSample(field.scalar, field.W, field.H, lat, lon);

      // Coordinate-derived seed for reproducibility
      const ptSeed = Math.abs(Math.floor(lat * 3141 + lon * 2718 + lid.charCodeAt(0) * 11));
      const rng = createSeededRng(ptSeed);

      const [rMin, rMax] = def.range;
      const currentVal = Number.isFinite(sampled)
        ? parseFloat(sampled.toFixed(2))
        : parseFloat(((rMin + rMax) / 2).toFixed(2));

      // 30-day consistent series
      const trend30: number[] = [];
      let walk = currentVal;
      const stepMagnitude = (rMax - rMin) * 0.02;

      for (let d = 29; d >= 0; d--) {
        const step = (rng() - 0.49) * stepMagnitude;
        walk = Math.max(rMin, Math.min(rMax, walk + step));
        trend30.unshift(parseFloat(walk.toFixed(2)));
      }
      trend30[29] = currentVal;

      // Climatological 12-month baseline
      const climatology: number[] = [];
      const seasonalOffset = (rMax - rMin) * 0.18 * (lat >= 0 ? 1 : -1);

      for (let m = 0; m < 12; m++) {
        const season = Math.sin(((m - 3) / 12) * Math.PI * 2) * seasonalOffset;
        const baseline = currentVal - (trend30[29] - trend30[0]) * 0.2 + season;
        climatology.push(parseFloat(Math.max(rMin, Math.min(rMax, baseline)).toFixed(2)));
      }

      const climMean = mean(climatology);
      const climStd = Math.max(0.4, stdDev(climatology));

      // Coherent Anomaly and Z-Score from the same statistical model
      const anomalyVal = parseFloat(computeAnomaly(currentVal, climMean).toFixed(2));
      const zScoreVal = parseFloat(computeZScore(currentVal, climMean, climStd).toFixed(2));
      const percentileVal = computePercentileRank(currentVal, trend30);

      // Signed monthly anomalies
      const anomalyMonthly = climatology.map((c) => parseFloat((currentVal - c).toFixed(2)));

      // Context-aware factor breakdown
      const factors: FactorEntry[] = geo.isOcean
        ? [
            { name: 'Marine Boundary Layer Advection', zScore: parseFloat((zScoreVal * 0.42).toFixed(2)) },
            { name: 'Upper Ocean Heat Flux', zScore: parseFloat((zScoreVal * 0.31).toFixed(2)) },
            { name: 'Geostrophic Current Shear', zScore: parseFloat((zScoreVal * -0.19).toFixed(2)) },
            { name: 'Baroclinic Instability', zScore: parseFloat((zScoreVal * 0.08).toFixed(2)) },
          ]
        : [
            { name: 'Synoptic Frontal Passage', zScore: parseFloat((zScoreVal * 0.45).toFixed(2)) },
            { name: 'Surface Albedo Radiative Forcing', zScore: parseFloat((zScoreVal * 0.29).toFixed(2)) },
            { name: 'Orographic Moisture Uplift', zScore: parseFloat((zScoreVal * -0.16).toFixed(2)) },
            { name: 'Planetary Boundary Layer Mixing', zScore: parseFloat((zScoreVal * 0.1).toFixed(2)) },
          ];

      factors.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

      const { recordLengthYears } = olsTrendPerDecade(trend30);

      layers.push({
        layerId: lid,
        value: currentVal,
        unit: def.unit,
        anomaly: anomalyVal,
        zScore: zScoreVal,
        percentile: percentileVal,
        trend30DaySeries: trend30,
        climatologyMonthlySeries: climatology,
        anomalyMonthlySeries: anomalyMonthly,
        factorBreakdown: factors,
        climatologyMean: parseFloat(climMean.toFixed(2)),
        climatologyStd: parseFloat(climStd.toFixed(2)),
        recordLengthYears: Math.max(15, Math.round(recordLengthYears || 15)),
      });
    }

    return {
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lon.toFixed(4)),
      timeIso,
      placeName: geo.placeName,
      layers,
      source: 'mock',
      fetchedAt: new Date().toISOString(),
    };
  }
}
