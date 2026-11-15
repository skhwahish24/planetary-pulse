/**
 * Scientific data structures for Agriculture, NDVI & SMAP Soil Moisture.
 * Sources:
 * - NASA USDA Global Agricultural Monitoring (GLAM): https://glam1.gsfc.nasa.gov/
 * - NASA SMAP (Soil Moisture Active Passive): https://smap.jpl.nasa.gov/
 * - MODIS MOD13A2 / VIIRS VNP13A1
 */

export interface AgriculturalRegionData {
  id: string;
  name: string;
  country: string;
  cropType: string;
  latitude: number;
  longitude: number;
  currentNdvi: number; // 0.0 - 1.0
  historicalMeanNdvi: number;
  ndviAnomalyPercent: number; // Departure from 2000-2025 baseline %
  vegetationConditionIndex: number; // VCI: 0 - 100%
  cropHealthStatus: 'Optimal' | 'Favorable' | 'Watch' | 'Stressed' | 'Severe Drought';
  soilMoistureVolumetric: number; // m³/m³ (from NASA SMAP L3)
  soilMoistureAnomaly: number; // Deviation from climatology
  droughtClassification: 'None' | 'Abnormally Dry (D0)' | 'Moderate Drought (D1)' | 'Severe Drought (D2)' | 'Extreme Drought (D3)';
  measurementType: 'Satellite-Measured' | 'Satellite-Derived Index' | 'Hydrological Model';
  sensor: string;
  lastUpdated: string;
  historicalNdviSeries: {
    year: number;
    peakNdvi: number;
    cropYieldIndex: number;
  }[];
}

export interface AgricultureApiResponse {
  regions: AgriculturalRegionData[];
  globalMeanNdvi: number;
  globalMeanSoilMoisture: number;
  source: string;
  timestamp: string;
}
