'use client';

interface SourceFootnoteProps {
  source: 'mock' | 'live';
  fetchedAt: string;
  recordLengthYears: number;
}

export function SourceFootnote({
  source,
  fetchedAt,
  recordLengthYears,
}: SourceFootnoteProps) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border-hairline)',
        paddingTop: '0.75rem',
        marginTop: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        fontSize: '0.625rem',
        fontFamily: 'monospace',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Data Ingestion: NASA Space Apps Reanalysis</span>
        <span
          style={{
            padding: '1px 6px',
            borderRadius: '2px',
            backgroundColor: source === 'live' ? 'var(--state-positive)' : 'var(--surface-sunken)',
            color: source === 'live' ? 'var(--surface-base)' : 'var(--text-secondary)',
            fontWeight: 700,
            border: '1px solid var(--border-hairline)',
            textTransform: 'uppercase',
          }}
        >
          {source} mode
        </span>
      </div>
      <div>Record Span: {recordLengthYears} years climatology baseline</div>
      <div>Observation Valid: {new Date(fetchedAt).toUTCString()}</div>
    </div>
  );
}
