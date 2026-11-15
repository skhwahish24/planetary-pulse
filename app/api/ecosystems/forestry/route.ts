import { NextResponse } from 'next/server';
import { getForestryData } from '@/lib/forestry-data';

export async function GET() {
  const data = getForestryData();
  return NextResponse.json(data);
}
