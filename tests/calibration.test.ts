import { describe, it, expect } from 'vitest';
import { MockDataProvider } from '../services/mock/MockDataProvider';

describe('Physical Telemetry Calibration & Consistency', () => {
  const provider = new MockDataProvider();
  const timeIso = '2026-10-01T12:00:00.000Z';

  it('Tasman Sea SST is in calibrated temperate range (12°C - 18°C)', async () => {
    const report = await provider.getPointReport(-41.1, 170.5, timeIso);
    const sst = report.layers.find((l) => l.layerId === 'sst');
    expect(sst).toBeDefined();
    expect(sst!.value).toBeGreaterThanOrEqual(12);
    expect(sst!.value).toBeLessThanOrEqual(18);
  });

  it('Tasman Sea Wave Height is in realistic range (1.5m - 5m)', async () => {
    const report = await provider.getPointReport(-41.1, 170.5, timeIso);
    const waves = report.layers.find((l) => l.layerId === 'waves');
    expect(waves).toBeDefined();
    expect(waves!.value).toBeGreaterThanOrEqual(1.5);
    expect(waves!.value).toBeLessThanOrEqual(5.0);
  });

  it('Equatorial Pacific SST is in warm tropical pool range (25°C - 32°C)', async () => {
    const report = await provider.getPointReport(0.0, -140.0, timeIso);
    const sst = report.layers.find((l) => l.layerId === 'sst');
    expect(sst).toBeDefined();
    expect(sst!.value).toBeGreaterThanOrEqual(25);
    expect(sst!.value).toBeLessThanOrEqual(32);
  });

  it('Southern Ocean SST is polar/subpolar (-2°C to 4°C)', async () => {
    const report = await provider.getPointReport(-56.0, -100.0, timeIso);
    const sst = report.layers.find((l) => l.layerId === 'sst');
    expect(sst).toBeDefined();
    expect(sst!.value).toBeGreaterThanOrEqual(-2);
    expect(sst!.value).toBeLessThanOrEqual(5);
  });

  it('Southern Ocean Wave Height reflects the roaring 50s (> 3m)', async () => {
    const report = await provider.getPointReport(-56.0, -100.0, timeIso);
    const waves = report.layers.find((l) => l.layerId === 'waves');
    expect(waves).toBeDefined();
    expect(waves!.value).toBeGreaterThanOrEqual(3.0);
  });

  it('Gulf Stream Basin SST is subtropical (20°C - 29°C)', async () => {
    const report = await provider.getPointReport(34.0, -65.0, timeIso);
    const sst = report.layers.find((l) => l.layerId === 'sst');
    expect(sst).toBeDefined();
    expect(sst!.value).toBeGreaterThanOrEqual(20);
    expect(sst!.value).toBeLessThanOrEqual(29);
  });

  it('London October Temperature is in mild temperate range (5°C - 22°C)', async () => {
    const report = await provider.getPointReport(51.5074, -0.1278, timeIso);
    const temp = report.layers.find((l) => l.layerId === 'temperature');
    expect(temp).toBeDefined();
    expect(temp!.value).toBeGreaterThanOrEqual(5);
    expect(temp!.value).toBeLessThanOrEqual(22);
  });

  it('Ensures exact statistical coherence: trend30DaySeries[29] === headline value', async () => {
    const report = await provider.getPointReport(35.6762, 139.6503, timeIso);
    for (const layer of report.layers) {
      expect(layer.trend30DaySeries[29]).toBe(layer.value);
    }
  });

  it('Ensures Anomaly and Z-Score are computed with appropriate signs', async () => {
    const report = await provider.getPointReport(40.7128, -74.006, timeIso);
    for (const layer of report.layers) {
      if (layer.anomaly > 0) {
        expect(layer.zScore).toBeGreaterThanOrEqual(0);
      } else if (layer.anomaly < 0) {
        expect(layer.zScore).toBeLessThanOrEqual(0);
      }
    }
  });
});
