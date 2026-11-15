import { NextResponse } from 'next/server';
import { searchASFRadarScenes } from '@/lib/radar-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  const lat = latStr ? parseFloat(latStr) : undefined;
  const lon = lonStr ? parseFloat(lonStr) : undefined;

  const data = await searchASFRadarScenes(lat, lon);
  return NextResponse.json(data);
}
