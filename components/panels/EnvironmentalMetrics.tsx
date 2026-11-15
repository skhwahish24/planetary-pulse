'use client';

import { useEffect, useState } from 'react';

interface EnvironmentalMetricsProps {
  lat: number;
  lon: number;
}

interface AirQualityData {
  source: string;
  timestamp: string;
  classification: string;
  measurements: {
    pm25?: { value: number; unit: string };
    pm10?: { value: number; unit: string };
    no2?: { value: number; unit: string };
    so2?: { value: number; unit: string };
    o3?: { value: number; unit: string };
    aqiUs?: { value: number; unit: string };
  };
}

export function EnvironmentalMetrics({ lat, lon }: EnvironmentalMetricsProps) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/airquality?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((res) => {
        if (active && res.measurements) {
          setData(res);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lat, lon]);

  if (loading || !data) return null;

  const m = data.measurements;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        backgroundColor: 'var(--surface-sunken)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '0.35rem',
        }}
      >
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Atmospheric Chemistry & Pollutants
        </span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          Open-Meteo / CAMS
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {m.pm25 && (
          <div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              PM2.5 PARTICLES
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {m.pm25.value} <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{m.pm25.unit}</span>
            </div>
          </div>
        )}

        {m.pm10 && (
          <div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              PM10 PARTICLES
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {m.pm10.value} <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{m.pm10.unit}</span>
            </div>
          </div>
        )}

        {m.no2 && (
          <div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              NITROGEN DIOXIDE (NO₂)
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {m.no2.value} <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{m.no2.unit}</span>
            </div>
          </div>
        )}

        {m.o3 && (
          <div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              SURFACE OZONE (O₃)
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {m.o3.value} <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{m.o3.unit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
