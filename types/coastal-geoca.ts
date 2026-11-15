/**
 * Scientific data structures for Coastal Ecosystem Monitoring & Canadian Geo.ca Datasets.
 * Sources:
 * - Coastal: NASA / USGS Digital Shoreline Analysis System (DSAS) & Global Mangrove Watch
 * - Geo.ca: Government of Canada Open Data Portal (https://geo.ca/)
 */

export interface CoastalMonitoringSite {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  shorelineChangeRateMYr: number; // Positive = accretion, Negative = erosion (meters/year)
  erosionRiskClassification: 'Accreting' | 'Stable' | 'Moderate Erosion' | 'Critical Erosion';
  mangroveExtentAreaKm2?: number;
  mangroveChangeTrendPercent?: number; // 1996-2026 change
  seaLevelTrendMmYr: number; // Global Altimetry local trend
  tidalRangeM: number;
  stormSurgeVulnerability: 'Low' | 'Moderate' | 'High' | 'Extreme';
  measurementBasis: 'Satellite Altimetry & Optical Transect DSAS' | 'Waveform Coastal Model';
  sensor: string;
  historicalShorelinePoints: {
    year: number;
    distanceOffsetM: number;
  }[];
}

export interface GeoCaDatasetEntry {
  id: string;
  title: string;
  category: 'Flood Risk' | 'Species At Risk' | 'Protected Habitat' | 'Permafrost Degradation' | 'Water Basin';
  provinceOrTerritory: 'British Columbia' | 'Alberta' | 'Ontario' | 'Quebec' | 'Northwest Territories' | 'Nunavut' | 'National';
  latitude: number;
  longitude: number;
  summary: string;
  keyMetric: {
    label: string;
    value: string;
    unit: string;
  };
  coverageRestriction: 'Strictly Canada (Geo.ca National Framework)';
  officialSourceUrl: string;
  license: string;
  lastUpdated: string;
}

export interface CoastalGeoCaApiResponse {
  coastalSites: CoastalMonitoringSite[];
  canadianDatasets: GeoCaDatasetEntry[];
  canadianBoundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  sources: {
    coastal: string;
    geoca: string;
  };
  timestamp: string;
}
