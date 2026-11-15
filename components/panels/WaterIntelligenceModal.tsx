'use client';

import { X, Droplets, BarChart2, ShieldCheck, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function WaterIntelligenceModal() {
  const selectedWaterBody = useExplorerStore((s) => s.selectedWaterBody);
  const setSelectedWaterBody = useExplorerStore((s) => s.setSelectedWaterBody);

  if (!selectedWaterBody) return null;

  const current = selectedWaterBody.currentMeasurement;
  const history = selectedWaterBody.historicalObservations || [];

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
      aria-label="NASA SWOT Water Intelligence"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <Droplets size={12} color="var(--accent-water)" />
            <span style={{ fontSize: '0.625rem', color: 'var(--accent-water)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              NASA SWOT · KaRIn Altimetry
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {selectedWaterBody.name}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {selectedWaterBody.country} · {selectedWaterBody.basin}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedWaterBody(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
          aria-label="Close Water Intelligence Panel"
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
          borderLeft: '3px solid var(--accent-water)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Water Surface Elevation (WSE)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {current.waterSurfaceElevationM.toFixed(2)}{' '}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>m</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Nominal Baseline</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {selectedWaterBody.nominalElevationM.toFixed(1)} m
          </div>
        </div>
      </div>

      {/* Grid of Measurements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.7rem' }}>
        <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>OBSERVED SURFACE AREA</div>
          <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.1rem' }}>
            {current.surfaceAreaKm2.toLocaleString()} km²
          </div>
        </div>

        {current.waterStorageChangeMcm !== undefined && (
          <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>STORAGE DELTA</div>
            <div
              style={{
                color: current.waterStorageChangeMcm >= 0 ? 'var(--state-positive)' : 'var(--state-danger)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                marginTop: '0.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              {current.waterStorageChangeMcm >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {current.waterStorageChangeMcm > 0 ? `+${current.waterStorageChangeMcm}` : current.waterStorageChangeMcm} MCM
            </div>
          </div>
        )}

        {current.dischargeM3s !== undefined && (
          <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>ESTIMATED DISCHARGE</div>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.1rem' }}>
              {current.dischargeM3s.toLocaleString()} m³/s
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>SENSOR & CYCLE</div>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
            Cycle {current.orbitCycle} · Pass {current.passNumber}
          </div>
        </div>
      </div>

      {/* Historical SWOT Comparison Table / Mini Chart */}
      {history.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BarChart2 size={10} />
              SWOT TIME-SERIES ELEVATION (m)
            </span>
            <span>{history.length} PASSES</span>
          </div>

          <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {history.map((obs, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  borderBottom: idx < history.length - 1 ? '1px solid var(--border-hairline)' : 'none',
                  paddingBottom: '0.15rem',
                }}
              >
                <span>{obs.timestamp.slice(0, 10)}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{obs.waterSurfaceElevationM.toFixed(2)} m</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{obs.surfaceAreaKm2} km²</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Data Provenance & Limitations */}
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.4rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          lineHeight: 1.4,
          borderTop: '1px solid var(--border-hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
          <ShieldCheck size={11} color="var(--accent-water)" />
          <span>SWOT KaRIn Observation Quality: {current.qualityFlag.toUpperCase()}</span>
        </div>
        Measurements reflect genuine Ka-band radar interferometry overpass epochs. Missing dates are never interpolated. Elevation referenced to EGM2008 geoid model.
      </div>

      {/* External Data Link */}
      <a
        href={selectedWaterBody.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          fontSize: '0.6875rem',
          color: 'var(--accent-water)',
          textDecoration: 'none',
          padding: '0.35rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-hairline)',
          backgroundColor: 'var(--surface-sunken)',
        }}
      >
        <span>Inspect on Hydrocron JPL API</span>
        <ExternalLink size={11} />
      </a>
    </div>
  );
}
