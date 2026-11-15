'use client';

/**
 * SatelliteInfoPanel — displays orbital data, mission info, and pass predictions.
 * Orbital parameters and pass predictions are fetched from server-side API (SGP4).
 */

import { X, Radio, Globe, Zap, Clock, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useExplorerStore } from '@/store/useExplorerStore';
import { SATELLITE_CATEGORY_COLORS, SATELLITE_CATEGORY_LABELS } from '@/types/satellites';
import type { SatelliteCategory, SatelliteOrbitalParams, SatellitePass } from '@/types/satellites';
import { useSatellites } from '@/hooks/useSatellites';

/** Earth observation mission connections for known satellites */
const EARTH_OBS_CONNECTIONS: Record<number, string> = {
  25994: 'Provides MODIS daily land surface temperature, vegetation index (NDVI), and aerosol optical depth.',
  27424: 'Provides MODIS ocean color, sea surface temperature, and atmospheric water vapor.',
  39084: 'Provides 30m multispectral land surface imagery — used for land cover change detection.',
  40697: 'Provides 10m Sentinel-2 imagery — vegetation, urban areas, bare soil classification.',
  41866: 'Provides real-time GOES-East ABI imagery — storm tracking and mesoscale weather.',
  43013: 'Provides VIIRS Day/Night Band and thermal imagery — used by NASA FIRMS fire detection.',
  37849: 'Provides VIIRS active fire data fed into NASA FIRMS — the fire hotspots you see on this globe.',
  46984: 'Sea level altimetry — provides precise ocean height measurements for sea level rise monitoring.',
  43476: 'Gravity anomalies from ice sheet and groundwater mass changes — key for climate science.',
};

interface OrbitalApiResponse {
  orbital: SatelliteOrbitalParams;
  passes: SatellitePass[];
  computedAt: string;
}

function formatAlt(km: number): string {
  return `${Math.round(km).toLocaleString()} km`;
}
function formatSpeed(kms: number): string {
  return `${kms.toFixed(2)} km/s`;
}
function formatPeriod(min: number): string {
  if (min < 60) return `${min.toFixed(1)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}
function formatPassTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatPassDate(ms: number): string {
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.3rem 0',
  borderBottom: '1px solid var(--border-hairline)',
  fontSize: '0.75rem',
  gap: '0.5rem',
};
const labelStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
};
const valueStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  wordBreak: 'break-all',
};

export function SatelliteInfoPanel() {
  const selectedSatellite = useExplorerStore((s) => s.selectedSatellite);
  const setSelectedSatellite = useExplorerStore((s) => s.setSelectedSatellite);
  const followSatellite = useExplorerStore((s) => s.followSatellite);
  const setFollowSatellite = useExplorerStore((s) => s.setFollowSatellite);
  const satelliteTrailsVisible = useExplorerStore((s) => s.satelliteTrailsVisible);
  const setSatelliteTrailsVisible = useExplorerStore((s) => s.setSatelliteTrailsVisible);

  const { satellites } = useSatellites();
  const liveSat = satellites.find((s) => s.record.noradId === selectedSatellite?.noradId);

  // Fetch orbital parameters from server
  const { data: orbitalData } = useQuery<OrbitalApiResponse>({
    queryKey: ['orbital', selectedSatellite?.noradId],
    queryFn: async () => {
      if (!selectedSatellite) throw new Error('No satellite');
      const res = await fetch(`/api/satellites/orbital?noradId=${selectedSatellite.noradId}&group=stations`);
      if (!res.ok) throw new Error('Orbital fetch failed');
      return res.json() as Promise<OrbitalApiResponse>;
    },
    enabled: !!selectedSatellite,
    staleTime: 60 * 1000, // orbital params are stable
    retry: 1,
  });

  if (!selectedSatellite) return null;

  const categoryColor = SATELLITE_CATEGORY_COLORS[selectedSatellite.category as SatelliteCategory] ?? '#ffffff';
  const categoryLabel = SATELLITE_CATEGORY_LABELS[selectedSatellite.category as SatelliteCategory] ?? selectedSatellite.category;
  const earthObsNote = EARTH_OBS_CONNECTIONS[selectedSatellite.noradId];
  const orbital = orbitalData?.orbital;
  const passes = orbitalData?.passes ?? [];

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '4rem',
        width: '300px',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        zIndex: 25,
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
      role="complementary"
      aria-label="Satellite information"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: categoryColor, flexShrink: 0 }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {categoryLabel}
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, wordBreak: 'break-all' }}>
            {selectedSatellite.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            NORAD #{selectedSatellite.noradId}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedSatellite(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', flexShrink: 0 }}
          aria-label="Close satellite panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Mission description */}
      {selectedSatellite.description && (
        <div style={{
          fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5,
          backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem',
          borderRadius: 'var(--radius-sm)', borderLeft: `2px solid ${categoryColor}`,
        }}>
          {selectedSatellite.description}
        </div>
      )}

      {/* Mission metadata */}
      <div>
        {selectedSatellite.operator && (
          <div style={rowStyle}>
            <span style={labelStyle}><Radio size={11} />Operator</span>
            <span style={valueStyle}>{selectedSatellite.operator}</span>
          </div>
        )}
        {selectedSatellite.country && (
          <div style={rowStyle}>
            <span style={labelStyle}><Globe size={11} />Country</span>
            <span style={valueStyle}>{selectedSatellite.country}</span>
          </div>
        )}
        {selectedSatellite.launchDate && (
          <div style={rowStyle}>
            <span style={labelStyle}><Clock size={11} />Launched</span>
            <span style={valueStyle}>{selectedSatellite.launchDate}</span>
          </div>
        )}
      </div>

      {/* Live position */}
      {liveSat?.position && (
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Live Position (SGP4)
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Latitude</span>
            <span style={valueStyle}>{liveSat.position.lat.toFixed(2)}°</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Longitude</span>
            <span style={valueStyle}>{liveSat.position.lon.toFixed(2)}°</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}><Zap size={11} />Altitude</span>
            <span style={valueStyle}>{formatAlt(liveSat.position.altKm)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}><Zap size={11} />Speed</span>
            <span style={valueStyle}>{formatSpeed(liveSat.position.velocityKms)}</span>
          </div>
        </div>
      )}

      {/* Orbital parameters */}
      {orbital && (
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Orbital Parameters
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Period</span>
            <span style={valueStyle}>{formatPeriod(orbital.periodMin)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Inclination</span>
            <span style={valueStyle}>{orbital.inclination.toFixed(2)}°</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Apogee</span>
            <span style={valueStyle}>{formatAlt(orbital.apogeeKm)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Perigee</span>
            <span style={valueStyle}>{formatAlt(orbital.perigeeKm)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>RAAN</span>
            <span style={valueStyle}>{orbital.raan.toFixed(1)}°</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Eccentricity</span>
            <span style={valueStyle}>{orbital.eccentricity.toFixed(5)}</span>
          </div>
        </div>
      )}

      {/* Earth Observation connection */}
      {earthObsNote && (
        <div style={{
          fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5,
          backgroundColor: 'var(--surface-sunken)', padding: '0.4rem 0.5rem',
          borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--accent-primary)',
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
            Earth Observation Layer
          </div>
          {earthObsNote}
        </div>
      )}

      {/* Pass predictions */}
      {passes.length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Next Passes (0°N 0°E observer)
          </div>
          {passes.map((pass, i) => (
            <div key={i} style={{ backgroundColor: 'var(--surface-sunken)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pass {i + 1} · {formatPassDate(pass.riseTimeMs)}</span>
                <span style={{ color: categoryColor, fontFamily: 'var(--font-mono)' }}>Max {pass.maxElevationDeg.toFixed(0)}°</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                {formatPassTime(pass.riseTimeMs)} → {formatPassTime(pass.setTimeMs)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setSatelliteTrailsVisible(!satelliteTrailsVisible)}
          style={{
            flex: 1, padding: '0.35rem 0', fontSize: '0.7rem', fontWeight: 600,
            border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)',
            backgroundColor: satelliteTrailsVisible ? categoryColor : 'var(--surface-sunken)',
            color: satelliteTrailsVisible ? '#000' : 'var(--text-muted)', cursor: 'pointer',
          }}
        >
          {satelliteTrailsVisible ? 'Hide Trail' : 'Show Trail'}
        </button>
        <button
          type="button"
          onClick={() => setFollowSatellite(!followSatellite)}
          style={{
            flex: 1, padding: '0.35rem 0', fontSize: '0.7rem', fontWeight: 600,
            border: `1px solid ${followSatellite ? categoryColor : 'var(--border-hairline)'}`,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: followSatellite ? 'rgba(255,255,255,0.08)' : 'var(--surface-sunken)',
            color: followSatellite ? categoryColor : 'var(--text-muted)', cursor: 'pointer',
          }}
        >
          {followSatellite ? 'Unfollow' : 'Follow'}
        </button>
      </div>

      {/* Attribution */}
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <ExternalLink size={9} />
        Orbital data: CelesTrak GP · SGP4 propagation · Positions are predictions, not telemetry.
      </div>
    </div>
  );
}
