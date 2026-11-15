import { NextResponse } from 'next/server';
import { getDisasterEvents } from '@/lib/disasters-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  const data = getDisasterEvents(category);
  return NextResponse.json(data);
}
