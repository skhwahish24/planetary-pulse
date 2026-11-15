/**
 * Scientific data structures for NASA Disasters Program Situational Awareness.
 * Official Source: https://science.data.nasa.gov/disasters
 * 
 * DISCLAIMER: Scientific situational awareness only. Not an official emergency warning service.
 */

export type DisasterCategory = 'wildfire' | 'flood' | 'landslide' | 'cyclone' | 'recovery';

export interface DisasterEvent {
  id: string;
  title: string;
  category: DisasterCategory;
  severity: 'Advisory' | 'Moderate' | 'Severe' | 'Catastrophic';
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  detectedAt: string;
  lastObservationDate: string;
  affectedAreaKm2?: number;
  keyMetric: {
    label: string;
    value: string;
    unit: string;
  };
  details: {
    wildfireFrpMw?: number; // Fire Radiative Power (MW) from VIIRS
    floodInundatedAreaKm2?: number;
    landslideRiskIndex?: 'Low' | 'Moderate' | 'High' | 'Severe'; // NASA LHASA
    cycloneWindSpeedKmh?: number;
    cycloneCategory?: string;
    cycloneCentralPressureHpa?: number;
    nighttimeLightReductionPercent?: number; // VIIRS Black Marble delta
    estimatedPopulationExposed?: number;
  };
  satelliteSensors: string[];
  beforeImageUrl?: string;
  afterImageUrl?: string;
  summary: string;
  scientificContext: string;
  dataSources: string[];
  limitations: string;
}

export interface DisastersApiResponse {
  events: DisasterEvent[];
  count: number;
  activeCategories: Record<DisasterCategory, number>;
  disclaimer: string;
  source: string;
  queryTimestamp: string;
}
