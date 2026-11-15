'use client';

import { useState } from 'react';

export function NasaEyesGlobe() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '650px',
        backgroundColor: 'var(--space-bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Loading state indicator */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--space-bg)',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
            fontSize: '0.8125rem',
            letterSpacing: '0.05em',
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              border: '2px solid var(--border-hairline)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>CONNECTING TO NASA EYES ON EARTH...</span>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Official NASA Eyes on Earth interactive iframe */}
      <iframe
        src="https://eyes.nasa.gov/apps/earth/#/satellites?rate=1"
        title="NASA Eyes on Earth - Interactive Globe"
        width="100%"
        height="650px"
        onLoad={() => setIsLoading(false)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          minHeight: '650px',
          flex: 1,
          display: 'block',
          backgroundColor: 'var(--space-bg)',
        }}
      />

      {/* Official Attribution Badge */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 15,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '4px 10px',
          backgroundColor: 'var(--surface-sunken)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.6875rem',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
          userSelect: 'none',
          boxShadow: 'none',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
          }}
        />
        <span>Interactive visualization by NASA/JPL-Caltech</span>
      </div>
    </div>
  );
}
