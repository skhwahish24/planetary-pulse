/**
 * Scientific data structures for NASA SWOT and global hydrological intelligence.
 * Source: PO.DAAC / NASA JPL Hydrocron (https://hydrocron.jpl.nasa.gov/)
 */

export type WaterBodyType = 'lake' | 'reservoir' | 'river_reach' | 'ocean_topography';

export interface SWOTWaterMeasurement {
  timestamp: string; // ISO-8601
  waterSurfaceElevationM: number; // WSE in meters relative to EGM2008
  surfaceAreaKm2: number;
  waterStorageChangeMcm?: number; // Million cubic meters
  dischargeM3s?: number; // For river reaches
  crossSectionWidthM?: number;
  qualityFlag: 'nominal' | 'degraded' | 'suspect';
  orbitCycle: number;
  passNumber: number;
  sensor: 'SWOT-KaRIn' | 'SWOT-Nadir-Altimeter' | 'Jason-CS/Sentinel-6';
}

export interface SWOTWaterBody {
  id: string; // Hydrocron reach_id or lake_id
  name: string;
  type: WaterBodyType;
  latitude: number;
  longitude: number;
  country: string;
  basin: string;
  nominalElevationM: number;
  nominalAreaKm2: number;
  capacityMcm?: number; // Reservoir storage capacity
  lastObserved: string;
  currentMeasurement: SWOTWaterMeasurement;
  historicalObservations: SWOTWaterMeasurement[];
  sourceUrl: string;
  license: string;
}

export interface SWOTApiResponse {
  waterBodies: SWOTWaterBody[];
  count: number;
  source: string;
  mission: string;
  queryTime: string;
}
