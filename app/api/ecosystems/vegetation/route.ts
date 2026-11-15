import { NextResponse } from 'next/server';
import { getAgriculturalData } from '@/lib/agriculture-data';

export async function GET() {
  const data = getAgriculturalData();
  return NextResponse.json(data);
}
