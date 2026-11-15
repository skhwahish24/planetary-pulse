'use client';

interface PanelStateProps {
  type: 'loading' | 'empty' | 'error';
  message?: string;
  onRetry?: () => void;
}

export function PanelState({ type, message, onRetry }: PanelStateProps) {
  if (type === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            height: '24px',
            width: '60%',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
          }}
        />
        <div
          style={{
            height: '60px',
            width: '100%',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
          }}
        />
        <div
          style={{
            height: '140px',
            width: '100%',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
          }}
        />
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>⊘</span>
        <div>{message || 'No marine observation available over continental landmass.'}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--state-danger)',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <div>{message || 'Data retrieval failure.'}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '4px 8px',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
