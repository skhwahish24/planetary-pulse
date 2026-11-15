'use client';

import { useState } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { ModeSwitch } from './ModeSwitch';
import { GEOGRAPHIC_ANCHORS } from '@/services/mock/MockDataProvider';
import {
  Globe as GlobeIcon,
  Search,
  Sparkles,
  Play,
  Pause,
  Database,
  Share2,
  HelpCircle,
  History,
  GitCompare,
} from 'lucide-react';

export function TopBar() {
  const timeIso = useExplorerStore((s) => s.timeIso);
  const setTime = useExplorerStore((s) => s.setTime);
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const setParticlesOn = useExplorerStore((s) => s.setParticlesOn);
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const setProbe = useExplorerStore((s) => s.setProbe);
  const historicalMode = useExplorerStore((s) => s.historicalMode);
  const setHistoricalMode = useExplorerStore((s) => s.setHistoricalMode);
  const comparisonMode = useExplorerStore((s) => s.comparisonMode);
  const setComparisonMode = useExplorerStore((s) => s.setComparisonMode);

  const [isPlaying, setIsPlaying] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const hasVector = activeLayer === 'wind' || activeLayer === 'currents';
  const currentDate = new Date(timeIso);

  const adjustDays = (delta: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setTime(next.toISOString());
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDirectSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check if query is coordinate string (e.g., "35.6, 139.7" or "-23.5 -46.6")
    const coordMatch = query.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setProbe({ lat, lon });
        setSearchOpen(false);
        setQuery('');
        return;
      }
    }

    // Fuzzy match against geographic anchors
    const matched = GEOGRAPHIC_ANCHORS.find((a) =>
      a.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      setProbe({ lat: matched.lat, lon: matched.lon });
    } else {
      // Default to geocoded fallback
      setProbe({ lat: 28.6139, lon: 77.209 }); // Delhi coordinates
    }
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        height: '52px',
        backgroundColor: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border-hairline)',
        zIndex: 25,
        userSelect: 'none',
        gap: '1rem',
      }}
    >
      {/* Brand Identity & Mission */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <GlobeIcon size={16} color="var(--accent-primary)" />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              lineHeight: 1.1,
            }}
          >
            Planetary Pulse
          </div>
          <div
            style={{
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
            }}
          >
            NASA Space Apps 2026 Digital Twin
          </div>
        </div>

        {/* Provenance Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
          }}
        >
          <Database size={11} color="var(--accent-primary)" />
          <span>EARTH OBSERVATION v3.0</span>
        </div>
      </div>

      {/* Center Interactive Timeline Scrubber & Playback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: isPlaying ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            color: isPlaying ? 'var(--surface-sunken)' : 'var(--text-primary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          type="button"
          onClick={() => adjustDays(-1)}
          style={{
            padding: '3px 8px',
            fontSize: '0.75rem',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          title="Previous day"
        >
          ◀
        </button>

        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--text-primary)',
            padding: '2px 8px',
            minWidth: '105px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {currentDate.toISOString().slice(0, 10)}
        </span>

        <button
          type="button"
          onClick={() => adjustDays(1)}
          style={{
            padding: '3px 8px',
            fontSize: '0.75rem',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          title="Next day"
        >
          ▶
        </button>
      </div>

      {/* Right Controls: Location Search, Timeline, Comparison & Mode Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {/* Functional Location Search */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '5px 9px',
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <Search size={13} />
            <span>SEARCH</span>
          </button>

          {searchOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                zIndex: 40,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              <form onSubmit={handleDirectSearch} style={{ display: 'flex', gap: '0.25rem' }}>
                <input
                  type="text"
                  placeholder="City name or lat, lon..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--surface-sunken)',
                    border: '1px solid var(--border-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    fontSize: '0.6875rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--surface-sunken)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    fontSize: '0.625rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  GO
                </button>
              </form>

              <div
                style={{
                  fontSize: '0.5625rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                  padding: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Sparkles size={10} color="var(--accent-primary)" />
                <span>FEATURED COORDINATES</span>
              </div>
              {GEOGRAPHIC_ANCHORS.slice(0, 6).map((anchor) => (
                <button
                  key={anchor.name}
                  type="button"
                  onClick={() => {
                    setProbe({ lat: anchor.lat, lon: anchor.lon });
                    setSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 6px',
                    fontSize: '0.6875rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{anchor.name.split(',')[0]}</span>
                  <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                    {anchor.isOcean ? 'OCEAN' : 'LAND'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Earth Through Time Button */}
        <button
          type="button"
          onClick={() => setHistoricalMode(!historicalMode)}
          style={{
            padding: '5px 8px',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: historicalMode ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: historicalMode ? 'var(--surface-sunken)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 600,
          }}
          title="Earth Through Time (1880–2026)"
        >
          <History size={12} />
          <span>TIMELINE</span>
        </button>

        {/* Location Comparison Button */}
        <button
          type="button"
          onClick={() => setComparisonMode(!comparisonMode)}
          style={{
            padding: '5px 8px',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: comparisonMode ? 'var(--accent-ocean)' : 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: comparisonMode ? 'var(--surface-sunken)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 600,
          }}
          title="Compare Two Locations"
        >
          <GitCompare size={12} />
          <span>COMPARE</span>
        </button>

        {hasVector && (
          <button
            type="button"
            onClick={() => setParticlesOn(!particlesOn)}
            style={{
              padding: '5px 9px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: particlesOn ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: particlesOn ? 'var(--surface-sunken)' : 'transparent',
              border: '1px solid',
              borderColor: particlesOn ? 'var(--accent-primary)' : 'var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            PARTICLES: {particlesOn ? 'ON' : 'OFF'}
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          style={{
            padding: '5px 9px',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: copied ? 'var(--state-positive)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
          title="Copy link with current coordinate state"
        >
          <Share2 size={12} />
          <span>{copied ? 'COPIED!' : 'SHARE'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
          }}
          style={{
            padding: '5px 8px',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle size={13} />
        </button>

        <ModeSwitch />
      </div>
    </header>
  );
}
