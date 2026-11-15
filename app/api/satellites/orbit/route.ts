import { NextResponse } from 'next/server';
import { parseTLE, propagate, orbitalParams } from '@/lib/sgp4';
import { getTLEGroup } from '@/lib/satellites-data';

export interface OrbitPoint {
  lat: number;
  lon: number;
  altKm: number;
}

export interface OrbitApiResponse {
  noradId: number;
  points: OrbitPoint[];
  periodMin: number;
  computedAt: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const noradIdStr = searchParams.get('noradId');
  const group = searchParams.get('group') ?? 'stations';

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
    return NextResponse.json({ error: `Satellite ${noradId} not found` }, { status: 404 });
  }

  const satrec = parseTLE(record.name, record.noradId, record.tle1, record.tle2);
  if (!satrec) {
    return NextResponse.json({ error: 'Failed to parse TLE' }, { status: 422 });
  }

  const params = orbitalParams(satrec);
  const steps = 180;
  const periodMs = params.periodMin * 60 * 1000;
  const now = new Date();
  const points: OrbitPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = new Date(now.getTime() + (i / steps) * periodMs);
    const pos = propagate(satrec, t);
    if (pos) points.push({ lat: pos.lat, lon: pos.lon, altKm: pos.altKm });
  }

  return NextResponse.json({
    noradId,
    points,
    periodMin: params.periodMin,
    computedAt: now.toISOString(),
  } satisfies OrbitApiResponse);
}
