import { NextResponse } from 'next/server';
import { parseTLE, orbitalParams, predictPasses } from '@/lib/sgp4';
import { getTLEGroup } from '@/lib/satellites-data';
import type { SatelliteOrbitalParams, SatellitePass } from '@/types/satellites';

export interface OrbitalApiResponse {
  noradId: number;
  orbital: SatelliteOrbitalParams;
  passes: SatellitePass[];
  computedAt: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const noradIdStr = searchParams.get('noradId');
  const group = searchParams.get('group') ?? 'stations';
  const observerLat = parseFloat(searchParams.get('lat') ?? '0');
  const observerLon = parseFloat(searchParams.get('lon') ?? '0');

  if (!noradIdStr) {
    return NextResponse.json({ error: 'noradId required' }, { status: 400 });
  }

  const noradId = parseInt(noradIdStr, 10);
  if (isNaN(noradId)) {
    return NextResponse.json({ error: 'Invalid noradId' }, { status: 400 });
  }

  const { satellites } = await getTLEGroup(group);
  const record = satellites.find((r) => r.noradId === noradId);

  if (!record) {
    return NextResponse.json({ error: `Satellite ${noradId} not found in group ${group}` }, { status: 404 });
  }

  const satrec = parseTLE(record.name, record.noradId, record.tle1, record.tle2);
  if (!satrec) {
    return NextResponse.json({ error: 'Failed to parse TLE' }, { status: 422 });
  }

  const orbital = orbitalParams(satrec);
  const passes = predictPasses(satrec, observerLat, observerLon, 0, new Date(), 24, 3, 10);

  return NextResponse.json({
    noradId,
    orbital,
    passes,
    computedAt: new Date().toISOString(),
  } satisfies OrbitalApiResponse);
}
