import { NextResponse } from 'next/server';
import { getSWOTWaterBodies } from '@/lib/swot-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || undefined;
  const type = searchParams.get('type') || undefined;

  try {
    const data = await getSWOTWaterBodies(q, type);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve SWOT water data' }, { status: 500 });
  }
}
