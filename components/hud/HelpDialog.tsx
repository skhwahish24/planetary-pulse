'use client';

import { X, Keyboard } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '1', desc: 'Select Surface Temperature' },
  { key: '2', desc: 'Select Temperature Anomaly' },
  { key: '3', desc: 'Select Air Quality (AQI)' },
  { key: '4', desc: 'Select Wind Velocity' },
  { key: '5', desc: 'Select Sea Surface Temperature' },
  { key: '6', desc: 'Select Significant Wave Height' },
  { key: '7', desc: 'Select Ocean Currents' },
  { key: 'M', desc: 'Switch Projection (3D Globe ↔ 2D Flat Map)' },
  { key: 'P', desc: 'Toggle Streamline Particles' },
  { key: 'R', desc: 'Reset Camera Position' },
  { key: 'Esc', desc: 'Close Drill-down Panel / Dialogs' },
  { key: '?', desc: 'Toggle Keyboard Shortcuts' },
];

export function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 4, 8, 0.75)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '100%',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          color: 'var(--text-primary)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={16} color="var(--accent-primary)" />
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
            >
              KEYBOARD SHORTCUTS
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                padding: '4px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-sunken)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
              <kbd
                style={{
                  padding: '2px 8px',
                  backgroundColor: 'var(--surface-overlay)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
