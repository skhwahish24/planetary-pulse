'use client';

import { X, Radar, Key, Download, Compass } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function RadarInspectorModal() {
  const selectedRadarScene = useExplorerStore((s) => s.selectedRadarScene);
  const setSelectedRadarScene = useExplorerStore((s) => s.setSelectedRadarScene);

  if (!selectedRadarScene) return null;

  const sc = selectedRadarScene;

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '4.5rem',
        width: '350px',
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
      aria-label="Alaska Satellite Facility SAR Inspector"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <Radar size={12} color="var(--accent-radar)" />
            <span style={{ fontSize: '0.625rem', color: 'var(--accent-radar)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              ALASKA SATELLITE FACILITY · {sc.platform}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, wordBreak: 'break-all' }}>
            {sc.granuleName}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {sc.application.toUpperCase()} · Path {sc.pathNumber} / Frame {sc.frameNumber}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedRadarScene(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
          aria-label="Close Radar Inspector Panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Radar Microwave Physics Breakdown */}
      <div
        style={{
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.625rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--accent-radar)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>VV BACKSCATTER</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {sc.meanBackscatterVvDb.toFixed(1)}{' '}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>dB</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>VH CROSS-POLAR</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {sc.meanBackscatterVhDb.toFixed(1)}{' '}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>dB</span>
          </div>
        </div>
      </div>

      {/* InSAR Deformation or Coherence */}
      {sc.deformationRateMmYr !== undefined && (
        <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.625rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>InSAR Line-of-Sight Deformation:</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
            {sc.deformationRateMmYr} mm/year
          </span>
        </div>
      )}

      {/* Radar Acquisition Geometry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.6875rem' }}>
        <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>ORBIT PASS DIRECTION</div>
          <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Compass size={11} color="var(--accent-radar)" />
            {sc.flightDirection}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>PROCESSING LEVEL</div>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {sc.processingLevel.slice(0, 7)}
          </div>
        </div>
      </div>

      {/* Distinction from Optical Imagery */}
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.45rem 0.55rem',
          borderRadius: 'var(--radius-sm)',
          lineHeight: 1.4,
          borderLeft: '2px solid var(--accent-radar)',
        }}
      >
        <div style={{ color: 'var(--accent-radar)', fontWeight: 600, marginBottom: '0.15rem' }}>
          RADAR VS OPTICAL DISTINCTION
        </div>
        Active C-band microwave (5.6 cm) measures surface physical roughness and moisture dielectric, not visible color. Low backscatter (dark pixels) denotes smooth specular standing water. High backscatter denotes urban double-bounce or rough surface.
      </div>

      {/* Earthdata Login Instruction */}
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.45rem 0.55rem',
          borderRadius: 'var(--radius-sm)',
          lineHeight: 1.4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.15rem' }}>
          <Key size={11} color="var(--accent-primary)" />
          <span>NASA Earthdata Authentication Required</span>
        </div>
        ASF DAAC granule downloads and on-demand HyP3 RTC/InSAR processing workflows require a free NASA Earthdata account (<a href="https://urs.earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>urs.earthdata.nasa.gov</a>). Heavy SAR interferometric processing runs in backend cloud pipelines.
      </div>

      {/* Download Granule Button */}
      <a
        href={sc.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: 'var(--accent-radar)',
          textDecoration: 'none',
          padding: '0.4rem',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Download size={12} />
        <span>Download ASF Granule Package</span>
      </a>
    </div>
  );
}
