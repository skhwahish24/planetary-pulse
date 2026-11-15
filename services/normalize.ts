import type { PointReport, PointLayerReport, GridField } from '@/types/data';

/** Validates and normalizes raw grid field data. */
export function normalizeGridField(field: Partial<GridField>): GridField {
  return {
    layerId: field.layerId || 'unknown',
    W: field.W || 360,
    H: field.H || 181,
    scalar: field.scalar || new Float32Array((field.W || 360) * (field.H || 181)),
    u: field.u,
    v: field.v,
    mask: field.mask || new Uint8Array((field.W || 360) * (field.H || 181)).fill(1),
    timeIso: field.timeIso || new Date().toISOString(),
  };
}

/** Validates and clamps an incoming point layer report. */
export function normalizePointLayer(layer: Partial<PointLayerReport>): PointLayerReport {
  return {
    layerId: layer.layerId || 'temperature',
    value: Number.isFinite(layer.value) ? (layer.value as number) : 0,
    unit: layer.unit || '',
    anomaly: Number.isFinite(layer.anomaly) ? (layer.anomaly as number) : 0,
    zScore: Number.isFinite(layer.zScore) ? (layer.zScore as number) : 0,
    percentile: Math.max(0, Math.min(100, layer.percentile ?? 50)),
    trend30DaySeries: Array.isArray(layer.trend30DaySeries) ? layer.trend30DaySeries : [],
    climatologyMonthlySeries: Array.isArray(layer.climatologyMonthlySeries)
      ? layer.climatologyMonthlySeries
      : [],
    anomalyMonthlySeries: Array.isArray(layer.anomalyMonthlySeries)
      ? layer.anomalyMonthlySeries
      : [],
    factorBreakdown: Array.isArray(layer.factorBreakdown) ? layer.factorBreakdown : [],
    climatologyMean: layer.climatologyMean ?? 0,
    climatologyStd: layer.climatologyStd ?? 1,
    recordLengthYears: layer.recordLengthYears ?? 10,
  };
}

/** Normalizes a complete drill-down point report. */
export function normalizePointReport(report: Partial<PointReport>): PointReport {
  return {
    lat: report.lat ?? 0,
    lon: report.lon ?? 0,
    timeIso: report.timeIso || new Date().toISOString(),
    placeName: report.placeName || 'Unknown Region',
    layers: Array.isArray(report.layers) ? report.layers.map(normalizePointLayer) : [],
    source: report.source || 'mock',
    fetchedAt: report.fetchedAt || new Date().toISOString(),
  };
}
