import { NextResponse } from 'next/server';
import { parseTLE, propagate } from '@/lib/sgp4';
import { getTLEGroup } from '@/lib/satellites-data';
import type { TLERecord, SatellitePosition } from '@/types/satellites';

export interface PositionEntry {
  noradId: number;
  name: string;
  category: TLERecord['category'];
  position: SatellitePosition | null;
}

export interface PositionsApiResponse {
  positions: PositionEntry[];
  computedAt: string;
  group: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group') ?? 'stations';

  const { satellites } = await getTLEGroup(group);
  const now = new Date();

  const positions: PositionEntry[] = satellites.flatMap((rec) => {
    const satrec = parseTLE(rec.name, rec.noradId, rec.tle1, rec.tle2);
    if (!satrec) return [];
    return [{
      noradId: rec.noradId,
      name: rec.name,
      category: rec.category,
      position: propagate(satrec, now),
    }];
  });

  return NextResponse.json({
    positions,
    computedAt: now.toISOString(),
    group,
  } satisfies PositionsApiResponse);
}
