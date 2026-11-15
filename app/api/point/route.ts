import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/services/provider';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  const timeIso = searchParams.get('t') || new Date().toISOString();

  if (!latStr || !lonStr) {
    return NextResponse.json(
      { error: 'Missing required query parameters: lat, lon' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { error: 'Invalid coordinate parameters' },
      { status: 400 }
    );
  }

  try {
    const provider = await getDataProvider();
    const report = await provider.getPointReport(lat, lon, timeIso);
    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
