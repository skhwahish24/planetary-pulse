'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import { usePointReport } from '@/hooks/usePointReport';
import { X, GitCompare, MapPin } from 'lucide-react';
import { LAYER_REGISTRY } from '@/lib/layers';

export function LocationComparisonModal() {
  const comparisonMode = useExplorerStore((s) => s.comparisonMode);
  const setComparisonMode = useExplorerStore((s) => s.setComparisonMode);
  const probe = useExplorerStore((s) => s.probe);
  const compareProbe = useExplorerStore((s) => s.compareProbe);
  const timeIso = useExplorerStore((s) => s.timeIso);

  const locA = probe || { lat: 51.5074, lon: -0.1278 }; // Default London
  const locB = compareProbe || { lat: -33.8688, lon: 151.2093 }; // Default Sydney

  const reportA = usePointReport(locA.lat, locA.lon, timeIso);
  const reportB = usePointReport(locB.lat, locB.lon, timeIso);

  if (!comparisonMode) return null;

  const compareLayers = [
    'temperature',
    'anomaly',
    'aqi',
    'wind',
    'sst',
    'ndvi',
    'soil_moisture',
    'forestry',
    'swot_water',
  ] as const;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 4, 8, 0.75)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={() => setComparisonMode(false)}
    >
      <div
        style={{
          width: '760px',
          maxWidth: '100%',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          color: 'var(--text-primary)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCompare size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace' }}>
              SCIENTIFIC LOCATION COMPARISON
            </span>
          </div>
          <button
            type="button"
            onClick={() => setComparisonMode(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Location Columns Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            OBSERVED VARIABLE
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface-sunken)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-hairline)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
              <MapPin size={12} />
              <span>{reportA.data?.placeName || 'Location A'}</span>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {locA.lat.toFixed(2)}°, {locA.lon.toFixed(2)}°
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface-sunken)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-hairline)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-ocean)', fontSize: '0.75rem', fontWeight: 700 }}>
              <MapPin size={12} />
              <span>{reportB.data?.placeName || 'Location B'}</span>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {locB.lat.toFixed(2)}°, {locB.lon.toFixed(2)}°
            </div>
          </div>
        </div>

        {/* Comparative Variables Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {compareLayers.map((layerId) => {
            const def = LAYER_REGISTRY[layerId];
            const dataA = reportA.data?.layers.find((l) => l.layerId === layerId);
            const dataB = reportB.data?.layers.find((l) => l.layerId === layerId);

            return (
              <div
                key={layerId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--surface-sunken)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{def.label}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{def.source}</div>
                </div>

                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dataA ? `${dataA.value.toFixed(1)} ${def.unit}` : 'N/A'}
                </div>

                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dataB ? `${dataB.value.toFixed(1)} ${def.unit}` : 'N/A'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
