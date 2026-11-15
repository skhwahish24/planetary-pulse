export type LayerId =
  // Atmosphere
  | 'temperature'
  | 'anomaly'
  | 'aqi'
  | 'wind'
  | 'aerosols'
  | 'humidity'
  // Oceans and Water
  | 'sst'
  | 'waves'
  | 'currents'
  | 'swot_water'
  | 'lakes_reservoirs'
  | 'rivers'
  // Ecosystems
  | 'agriculture'
  | 'ndvi'
  | 'soil_moisture'
  | 'forestry'
  | 'wetlands'
  | 'coastal_change'
  // Disasters
  | 'wildfires'
  | 'floods'
  | 'landslides'
  | 'cyclones'
  | 'recovery'
  // Satellite Intelligence
  | 'satellite_imagery'
  | 'sar_observations'
  | 'optical_imagery'
  | 'geoca_canada';

export type Domain =
  | 'atmosphere'
  | 'ocean_water'
  | 'ecosystems'
  | 'disasters'
  | 'satellite_intel'
  | 'ocean'; // backward-compatible alias

export type RampType = 'sequential' | 'diverging';

export type MaskType = 'none' | 'ocean' | 'land';
