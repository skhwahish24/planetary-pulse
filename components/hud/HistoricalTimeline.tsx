'use client';

import { useEffect, useState } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { Play, Pause, RotateCcw, X, TrendingUp } from 'lucide-react';
import type { GistempYearAnomaly } from '@/app/api/historical/gistemp/route';

export function HistoricalTimeline() {
  const historicalMode = useExplorerStore((s) => s.historicalMode);
  const setHistoricalMode = useExplorerStore((s) => s.setHistoricalMode);
  const selectedYear = useExplorerStore((s) => s.selectedYear);
  const setSelectedYear = useExplorerStore((s) => s.setSelectedYear);

  const [isPlaying, setIsPlaying] = useState(false);
  const [data, setData] = useState<GistempYearAnomaly[]>([]);
  const [compareYear, setCompareYear] = useState<number | null>(null);

  useEffect(() => {
    if (!historicalMode) return;
    fetch('/api/historical/gistemp')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {});
  }, [historicalMode]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const nextYear =
        selectedYear >= 2026
          ? 1880
          : selectedYear < 2000
          ? selectedYear + 5
          : selectedYear + 1;
      if (selectedYear >= 2026) setIsPlaying(false);
      setSelectedYear(nextYear);
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying, selectedYear, setSelectedYear]);

  if (!historicalMode) return null;

  const currentRecord = data.find((d) => d.year === selectedYear) || {
    year: selectedYear,
    anomaly: selectedYear >= 2020 ? 1.05 : -0.15,
    uncertainty: 0.05,
  };

  const compareRecord = compareYear ? data.find((d) => d.year === compareYear) : null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '4.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        width: '640px',
        maxWidth: '92vw',
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1.25rem',
        color: 'var(--text-primary)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace' }}>
            EARTH THROUGH TIME (NASA GISTEMP v4)
          </span>
          <span
            style={{
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
              backgroundColor: 'var(--surface-sunken)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Baseline: 1951–1980
          </span>
        </div>
        <button
          type="button"
          onClick={() => setHistoricalMode(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Close historical timeline"
        >
          <X size={15} />
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compareRecord ? '1fr 1fr 1fr' : '1fr 1fr',
          gap: '0.75rem',
          backgroundColor: 'var(--surface-sunken)',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-hairline)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            SELECTED YEAR
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
            {selectedYear}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            GLOBAL TEMP ANOMALY
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: currentRecord.anomaly >= 0 ? 'var(--div-pos-2)' : 'var(--div-neg-2)',
            }}
          >
            {currentRecord.anomaly >= 0 ? '+' : ''}
            {currentRecord.anomaly.toFixed(2)} °C
          </div>
        </div>

        {compareRecord && (
          <div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              DELTA vs {compareYear}
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: currentRecord.anomaly - compareRecord.anomaly >= 0 ? 'var(--div-pos-2)' : 'var(--div-neg-2)',
              }}
            >
              {currentRecord.anomaly - compareRecord.anomaly >= 0 ? '+' : ''}
              {(currentRecord.anomaly - compareRecord.anomaly).toFixed(2)} °C
            </div>
          </div>
        )}
      </div>

      {/* Scrubber & Playback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '5px 10px',
            backgroundColor: isPlaying ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            color: isPlaying ? 'var(--surface-sunken)' : 'var(--text-primary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedYear(1880);
            setIsPlaying(false);
          }}
          style={{
            padding: '5px 8px',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          title="Reset to 1880"
          aria-label="Reset to 1880"
        >
          <RotateCcw size={13} />
        </button>

        <input
          type="range"
          min={1880}
          max={2026}
          step={1}
          value={selectedYear}
          onChange={(e) => {
            setIsPlaying(false);
            setSelectedYear(parseInt(e.target.value, 10));
          }}
          style={{
            flex: 1,
            accentColor: 'var(--accent-primary)',
            cursor: 'pointer',
          }}
        />

        <button
          type="button"
          onClick={() => setCompareYear(compareYear ? null : 1900)}
          style={{
            padding: '4px 8px',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            backgroundColor: compareYear ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            color: compareYear ? 'var(--surface-sunken)' : 'var(--text-secondary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          {compareYear ? `COMPARING: ${compareYear}` : 'COMPARE YEAR'}
        </button>
      </div>
    </div>
  );
}
