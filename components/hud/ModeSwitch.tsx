'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import type { Mode } from '@/types/store';

export function ModeSwitch() {
  const mode = useExplorerStore((s) => s.mode);
  const setMode = useExplorerStore((s) => s.setMode);

  return (
    <div
      style={{
        display: 'inline-flex',
        backgroundColor: 'var(--surface-sunken)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px',
        gap: '2px',
      }}
    >
      {(['3d', '2d'] as Mode[]).map((m) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--surface-raised)' : 'transparent',
              border: isActive ? '1px solid var(--border-hairline)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--motion-fast)',
            }}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
