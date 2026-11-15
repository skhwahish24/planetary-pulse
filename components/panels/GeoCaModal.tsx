'use client';

import { X, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function GeoCaModal() {
  const selectedGeoCaDataset = useExplorerStore((s) => s.selectedGeoCaDataset);
  const setSelectedGeoCaDataset = useExplorerStore((s) => s.setSelectedGeoCaDataset);

  if (!selectedGeoCaDataset) return null;

  const ds = selectedGeoCaDataset;

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '4.5rem',
        width: '340px',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        zIndex: 25,
        padding: '0.875rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
      role="dialog"
      aria-label="Canadian Geo.ca Geospatial Intelligence"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <MapPin size={12} color="#ef4444" />
            <span style={{ fontSize: '0.625rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              GEO.CA · {ds.provinceOrTerritory.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {ds.title}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            Category: {ds.category}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedGeoCaDataset(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
          aria-label="Close Geo.ca Panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Primary Key Metric Card */}
      <div
        style={{
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.625rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid #ef4444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {ds.keyMetric.label}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {ds.keyMetric.value}{' '}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{ds.keyMetric.unit}</span>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div
        style={{
          fontSize: '0.71875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.5rem 0.625rem',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {ds.summary}
      </div>

      {/* Strict Geographic Restriction Notice */}
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.45rem 0.55rem',
          borderRadius: 'var(--radius-sm)',
          lineHeight: 1.4,
          borderLeft: '2px solid #ef4444',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.15rem' }}>
          <ShieldCheck size={11} />
          <span>GEOGRAPHICALLY CONSTRAINED TO CANADA</span>
        </div>
        This layer integrates official Canadian federal, provincial, and territorial open datasets from geo.ca. It is geographically restricted to Canadian national borders and is not extrapolated globally.
      </div>

      {/* License & Source */}
      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div>License: {ds.license}</div>
        <div>Coordinates: {ds.latitude.toFixed(2)}°N, {Math.abs(ds.longitude).toFixed(2)}°W</div>
      </div>

      {/* Official Geo.ca Link */}
      <a
        href={ds.officialSourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          fontSize: '0.6875rem',
          color: '#ef4444',
          textDecoration: 'none',
          padding: '0.35rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-hairline)',
          backgroundColor: 'var(--surface-sunken)',
        }}
      >
        <span>Open Record on Geo.ca</span>
        <ExternalLink size={11} />
      </a>
    </div>
  );
}
