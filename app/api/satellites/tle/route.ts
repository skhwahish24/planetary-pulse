import { NextResponse } from 'next/server';
import { getTLEGroup, CELESTRAK_URLS } from '@/lib/satellites-data';
import type { TLEApiResponse } from '@/types/satellites';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group') ?? 'stations';

  const validGroups = Object.keys(CELESTRAK_URLS);
  if (!validGroups.includes(group)) {
    return NextResponse.json({ error: `Unknown group. Valid: ${validGroups.join(', ')}` }, { status: 400 });
  }

  const { satellites, source, fetchedAt, cacheHit } = await getTLEGroup(group);

  const response: TLEApiResponse = {
    satellites,
    fetchedAt,
    source,
    group,
    cacheHit,
  };

  return NextResponse.json(response);
}
