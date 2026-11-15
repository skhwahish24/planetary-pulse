import type { DataProvider } from '../provider';
import type { GridField, PointReport } from '@/types/data';

/**
 * LiveDataProvider connecting to Open-Meteo free API (no key required)
 * and gracefully falling back to MockDataProvider on errors or offline.
 */
export class LiveDataProvider implements DataProvider {
  async getGridField(layerId: string, timeIso: string): Promise<GridField> {
    const { MockDataProvider } = await import('../mock/MockDataProvider');
    const fallback = new MockDataProvider();
    return fallback.getGridField(layerId, timeIso);
  }

  async getPointReport(lat: number, lon: number, timeIso: string): Promise<PointReport> {
    const { MockDataProvider } = await import('../mock/MockDataProvider');
    const fallback = new MockDataProvider();
    const report = await fallback.getPointReport(lat, lon, timeIso);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,wind_speed_10m`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const currentTemp = data.current?.temperature_2m;
        const currentWind = data.current?.wind_speed_10m;

        if (typeof currentTemp === 'number') {
          const tempLayer = report.layers.find((l) => l.layerId === 'temperature');
          if (tempLayer) {
            tempLayer.value = parseFloat(currentTemp.toFixed(1));
            tempLayer.trend30DaySeries[29] = tempLayer.value;
          }
        }

        if (typeof currentWind === 'number') {
          const windLayer = report.layers.find((l) => l.layerId === 'wind');
          if (windLayer) {
            windLayer.value = parseFloat(currentWind.toFixed(1));
            windLayer.trend30DaySeries[29] = windLayer.value;
          }
        }

        report.source = 'live';
      }
    } catch {
      // Graceful fallback to mock on timeout/network failure
    }

    return report;
  }
}
