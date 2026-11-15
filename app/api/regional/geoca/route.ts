import { NextResponse } from 'next/server';
import { getCoastalAndGeoCaData } from '@/lib/coastal-geoca-data';

export async function GET() {
  const data = getCoastalAndGeoCaData();
  return NextResponse.json(data);
}
