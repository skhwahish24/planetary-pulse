'use client';

import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function DisasterModal() {
  const selectedDisasterEvent = useExplorerStore((s) => s.selectedDisasterEvent);
  const setSelectedDisasterEvent = useExplorerStore((s) => s.setSelectedDisasterEvent);

  if (!selectedDisasterEvent) return null;

  const ev = selectedDisasterEvent;

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
      aria-label="NASA Disasters Situational Awareness"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <ShieldAlert size={12} color="var(--accent-disaster)" />
            <span style={{ fontSize: '0.625rem', color: 'var(--accent-disaster)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              NASA DISASTERS PROGRAM · {ev.category.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {ev.title}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {ev.region}, {ev.country}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedDisasterEvent(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
          aria-label="Close Disaster Intelligence Panel"
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
          borderLeft: '3px solid var(--accent-disaster)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {ev.keyMetric.label}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {ev.keyMetric.value}{' '}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ev.keyMetric.unit}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Severity Level</div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: ev.severity === 'Catastrophic' ? 'var(--state-danger)' : 'var(--state-warning)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {ev.severity.toUpperCase()}
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
        {ev.summary}
      </div>

      {/* Scientific Context */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.6875rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          SCIENTIFIC SITUATIONAL ANALYSIS
        </div>
        <div style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{ev.scientificContext}</div>
      </div>

      {/* Satellite Sensor Metadata */}
      <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.6875rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginBottom: '0.2rem' }}>SATELLITE PLATFORMS OBSERVED:</div>
        <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {ev.satelliteSensors.join(' · ')}
        </div>
      </div>

      {/* Official Warning & Limitations Disclaimer */}
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.4rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          lineHeight: 1.4,
          borderLeft: '2px solid var(--state-warning)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--state-warning)', marginBottom: '0.2rem' }}>
          <AlertTriangle size={11} />
          <span>SCIENTIFIC SITUATIONAL AWARENESS ONLY</span>
        </div>
        This dashboard provides satellite observations and model products for scientific awareness and research. It is NOT an official emergency evacuation or civil warning notice. Refer to local emergency authorities for operational instructions.
      </div>

      {/* Sources */}
      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Sources: {ev.dataSources.join(', ')}</span>
        <span>{ev.lastObservationDate.slice(0, 10)}</span>
      </div>
    </div>
  );
}
