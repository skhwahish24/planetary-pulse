'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import { LAYER_REGISTRY } from '@/lib/layers';
import type { LayerId } from '@/types/layers';

export function Legend() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const def = LAYER_REGISTRY[activeLayer as LayerId] || LAYER_REGISTRY['temperature'];

  const [min, max] = def.range;
  const gradientStops = def.rampTokens
    .map((token, idx, arr) => `var(${token}) ${(idx / (arr.length - 1)) * 100}%`)
    .join(', ');

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.625rem 0.875rem',
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        pointerEvents: 'auto',
        userSelect: 'none',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: '0.6875rem',
          fontFamily: 'monospace',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {def.label}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{def.unit}</span>
      </div>

      {/* Discrete or continuous ramp gradient */}
      <div
        style={{
          height: '8px',
          width: '100%',
          borderRadius: '2px',
          border: '1px solid var(--border-hairline)',
          background: `linear-gradient(to right, ${gradientStops})`,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
        }}
      >
        <span>{min}</span>
        {def.ramp === 'diverging' && <span>0</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}
