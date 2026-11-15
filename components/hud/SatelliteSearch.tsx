'use client';

/**
 * SatelliteSearch — search bar and quick-access buttons for the satellite catalog.
 */

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useSatellites } from '@/hooks/useSatellites';
import { SATELLITE_CATEGORY_COLORS, SATELLITE_CATEGORY_LABELS } from '@/types/satellites';
import type { SatelliteCategory, TLERecord } from '@/types/satellites';

/** Well-known satellites with quick access */
const QUICK_ACCESS: Array<{ name: string; noradId: number }> = [
  { name: 'ISS', noradId: 25544 },
  { name: 'Hubble', noradId: 20580 },
  { name: 'Landsat 8', noradId: 39084 },
  { name: 'Sentinel-2A', noradId: 40697 },
  { name: 'GOES-16', noradId: 41866 },
  { name: 'Suomi NPP', noradId: 37849 },
];

export function SatelliteSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const setSelectedSatellite = useExplorerStore((s) => s.setSelectedSatellite);
  const selectedSatellite = useExplorerStore((s) => s.selectedSatellite);
  const { satellites } = useSatellites();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return satellites
      .filter((s) =>
        s.record.name.toLowerCase().includes(q) ||
        String(s.record.noradId).includes(q)
      )
      .slice(0, 12)
      .map((s) => s.record);
  }, [query, satellites]);

  const handleSelect = (record: TLERecord) => {
    setSelectedSatellite(record);
    setQuery('');
    setOpen(false);
  };

  const handleQuickAccess = (noradId: number) => {
    const sat = satellites.find((s) => s.record.noradId === noradId);
    if (sat) {
      setSelectedSatellite(sat.record);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 30,
    width: '320px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.45rem 2rem 0.45rem 2.2rem',
    fontSize: '0.8rem',
    backgroundColor: 'var(--surface-raised)',
    border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search satellite by name or NORAD ID…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={inputStyle}
          aria-label="Search satellites"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div style={{
          marginTop: '0.25rem',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          maxHeight: '240px',
          overflowY: 'auto',
        }}>
          {results.map((rec) => (
            <button
              key={rec.noradId}
              type="button"
              onClick={() => handleSelect(rec)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                background: selectedSatellite?.noradId === rec.noradId ? 'var(--surface-sunken)' : 'none',
                border: 'none',
                borderBottom: '1px solid var(--border-hairline)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: SATELLITE_CATEGORY_COLORS[rec.category as SatelliteCategory] ?? '#fff',
                }}
              />
              <span style={{ flex: 1 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block' }}>{rec.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  NORAD #{rec.noradId} · {SATELLITE_CATEGORY_LABELS[rec.category as SatelliteCategory]}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick access chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
        {QUICK_ACCESS.map((item) => {
          const sat = satellites.find((s) => s.record.noradId === item.noradId);
          if (!sat) return null;
          const color = SATELLITE_CATEGORY_COLORS[sat.record.category as SatelliteCategory] ?? '#fff';
          const isSelected = selectedSatellite?.noradId === item.noradId;
          return (
            <button
              key={item.noradId}
              type="button"
              onClick={() => handleQuickAccess(item.noradId)}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.65rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${isSelected ? color : 'var(--border-hairline)'}`,
                backgroundColor: isSelected ? `${color}22` : 'var(--surface-raised)',
                color: isSelected ? color : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
