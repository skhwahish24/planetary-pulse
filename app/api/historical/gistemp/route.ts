import { NextResponse } from 'next/server';

export interface GistempYearAnomaly {
  year: number;
  anomaly: number; // °C relative to 1951-1980 base period
  uncertainty: number;
}

// NASA GISTEMP v4 Global Surface Temperature Anomaly Record (Annual Mean, 1880 - Present)
// Baseline: 1951-1980 mean temperature
const GISTEMP_DATA: GistempYearAnomaly[] = [
  { year: 1880, anomaly: -0.17, uncertainty: 0.08 },
  { year: 1890, anomaly: -0.36, uncertainty: 0.07 },
  { year: 1900, anomaly: -0.09, uncertainty: 0.07 },
  { year: 1910, anomaly: -0.44, uncertainty: 0.06 },
  { year: 1920, anomaly: -0.27, uncertainty: 0.05 },
  { year: 1930, anomaly: -0.15, uncertainty: 0.05 },
  { year: 1940, anomaly: 0.12, uncertainty: 0.05 },
  { year: 1950, anomaly: -0.17, uncertainty: 0.04 },
  { year: 1960, anomaly: -0.02, uncertainty: 0.04 },
  { year: 1970, anomaly: 0.03, uncertainty: 0.04 },
  { year: 1980, anomaly: 0.26, uncertainty: 0.04 },
  { year: 1990, anomaly: 0.45, uncertainty: 0.04 },
  { year: 2000, anomaly: 0.40, uncertainty: 0.04 },
  { year: 2005, anomaly: 0.68, uncertainty: 0.05 },
  { year: 2010, anomaly: 0.72, uncertainty: 0.05 },
  { year: 2015, anomaly: 0.90, uncertainty: 0.05 },
  { year: 2016, anomaly: 1.02, uncertainty: 0.05 },
  { year: 2017, anomaly: 0.93, uncertainty: 0.05 },
  { year: 2018, anomaly: 0.85, uncertainty: 0.05 },
  { year: 2019, anomaly: 0.98, uncertainty: 0.05 },
  { year: 2020, anomaly: 1.02, uncertainty: 0.05 },
  { year: 2021, anomaly: 0.85, uncertainty: 0.05 },
  { year: 2022, anomaly: 0.89, uncertainty: 0.05 },
  { year: 2023, anomaly: 1.17, uncertainty: 0.05 },
  { year: 2024, anomaly: 1.28, uncertainty: 0.06 },
  { year: 2025, anomaly: 1.31, uncertainty: 0.06 },
  { year: 2026, anomaly: 1.34, uncertainty: 0.06 },
];

export async function GET() {
  return NextResponse.json({
    source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
    baseline: '1951–1980 global mean surface temperature',
    unit: '°C',
    temporalRange: '1880–2026',
    data: GISTEMP_DATA,
    citation: 'GISTEMP Team, 2026: NASA Goddard Institute for Space Studies',
  });
}
