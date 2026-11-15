/** Types shared across data providers and UI consumers. */

/** A W×H equirectangular scalar grid plus optional vector components. */
export interface GridField {
  layerId: string;
  W: number;
  H: number;
  scalar: Float32Array;
  u?: Float32Array;
  v?: Float32Array;
  mask: Uint8Array;
  timeIso: string;
}

/** One entry in the factor breakdown chart. */
export interface FactorEntry {
  name: string;
  zScore: number;
}

/** Per-layer metrics within a PointReport. */
export interface PointLayerReport {
  layerId: string;
  value: number;
  unit: string;
  anomaly: number;
  zScore: number;
  percentile: number;
  trend30DaySeries: number[];
  climatologyMonthlySeries: number[];
  anomalyMonthlySeries: number[];
  factorBreakdown: FactorEntry[];
  climatologyMean: number;
  climatologyStd: number;
  recordLengthYears: number;
}

/** Drill-down aggregated report for a probed location. */
export interface PointReport {
  lat: number;
  lon: number;
  timeIso: string;
  placeName: string;
  layers: PointLayerReport[];
  source: 'mock' | 'live';
  fetchedAt: string;
}
