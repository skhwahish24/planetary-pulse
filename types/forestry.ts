/**
 * Scientific data structures for NASA GEDI Forest Structure & MEaSUREs Wetlands.
 * Sources:
 * - NASA GEDI (Global Ecosystem Dynamics Investigation): https://gedi.umd.edu/
 * - NASA MEaSUREs (Global Inundation & Wetlands): https://earthdata.nasa.gov/
 */

export interface ForestWetlandPlot {
  id: string;
  name: string;
  biome: 'Tropical Rainforest' | 'Boreal Taiga' | 'Temperate Deciduous' | 'Coastal Mangrove' | 'Inland Peatland' | 'Freshwater Swamp';
  country: string;
  latitude: number;
  longitude: number;
  canopyHeightM: number; // RH98 relative height metric
  canopyCoverPercent: number; // 0 - 100%
  aboveGroundBiomassMgHa: number; // Megagrams per hectare (metric tons/ha)
  plantAreaIndex: number; // PAI m²/m²
  wetlandInundationExtentPercent: number; // MEaSUREs seasonal flooded area %
  wetlandTrend: 'Expanding' | 'Stable' | 'Degrading' | 'Seasonal Inundation';
  observationType: 'Historical GEDI Waveform Lidar Footprint' | 'MEaSUREs Multi-Sensor Inundation' | 'Landsat/Sentinel-2 Canopy Blend';
  sensor: string;
  surveyPeriod: string;
  historicalBiomassLossPercent?: number; // 2000-2025 deforestation/loss estimate
  notes: string;
}

export interface ForestryApiResponse {
  plots: ForestWetlandPlot[];
  averageCanopyHeightM: number;
  averageBiomassMgHa: number;
  source: string;
  disclaimer: string;
  timestamp: string;
}
