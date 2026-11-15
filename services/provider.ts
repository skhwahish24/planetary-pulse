import type { GridField, PointReport } from '@/types/data';

/** Data provider abstraction interface. */
export interface DataProvider {
  /** Fetch a 2D scalar/vector grid for a given layer at a timestamp. */
  getGridField(layerId: string, timeIso: string): Promise<GridField>;

  /** Fetch a point drill-down report containing local metrics & historical series. */
  getPointReport(lat: number, lon: number, timeIso: string): Promise<PointReport>;
}

let providerInstance: DataProvider | null = null;

/** Factory that returns the configured DataProvider singleton. */
export async function getDataProvider(): Promise<DataProvider> {
  if (providerInstance) return providerInstance;

  const mode = process.env.NEXT_PUBLIC_DATA_MODE || 'mock';

  if (mode === 'live') {
    const { LiveDataProvider } = await import('./live/LiveDataProvider');
    providerInstance = new LiveDataProvider();
  } else {
    const { MockDataProvider } = await import('./mock/MockDataProvider');
    providerInstance = new MockDataProvider();
  }

  return providerInstance;
}
