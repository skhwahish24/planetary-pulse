'use client';

import {
  Plus,
  Minus,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Flame,
  History,
  GitCompare,
  SatelliteDish,
  Droplets,
  ShieldAlert,
  Radar,
  MapPin,
} from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function GlobeControls() {
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const setParticlesOn = useExplorerStore((s) => s.setParticlesOn);
  const firesVisible = useExplorerStore((s) => s.firesVisible);
  const setFiresVisible = useExplorerStore((s) => s.setFiresVisible);
  const historicalMode = useExplorerStore((s) => s.historicalMode);
  const setHistoricalMode = useExplorerStore((s) => s.setHistoricalMode);
  const comparisonMode = useExplorerStore((s) => s.comparisonMode);
  const setComparisonMode = useExplorerStore((s) => s.setComparisonMode);
  const satelliteMode = useExplorerStore((s) => s.satelliteMode);
  const setSatelliteMode = useExplorerStore((s) => s.setSatelliteMode);
  const autoRotate = useExplorerStore((s) => s.autoRotate);
  const setAutoRotate = useExplorerStore((s) => s.setAutoRotate);
  const rotationSpeed = useExplorerStore((s) => s.rotationSpeed);
  const setRotationSpeed = useExplorerStore((s) => s.setRotationSpeed);

  // Earth Intelligence toggles
  const swotWaterVisible = useExplorerStore((s) => s.swotWaterVisible);
  const setSwotWaterVisible = useExplorerStore((s) => s.setSwotWaterVisible);
  const disastersVisible = useExplorerStore((s) => s.disastersVisible);
  const setDisastersVisible = useExplorerStore((s) => s.setDisastersVisible);
  const radarVisible = useExplorerStore((s) => s.radarVisible);
  const setRadarVisible = useExplorerStore((s) => s.setRadarVisible);
  const geocaVisible = useExplorerStore((s) => s.geocaVisible);
  const setGeocaVisible = useExplorerStore((s) => s.setGeocaVisible);

  const handleZoomIn = () => {
    window.dispatchEvent(new CustomEvent('globe:zoomIn'));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent('globe:zoomOut'));
  };

  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('globe:reset'));
  };

  const handleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  const cycleSpeed = () => {
    if (rotationSpeed <= 0.35) setRotationSpeed(0.8);
    else if (rotationSpeed <= 0.8) setRotationSpeed(1.8);
    else setRotationSpeed(0.35);
  };

  const buttonStyle = {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--surface-raised)',
    border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--motion-fast)',
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
      }}
    >
      <button
        type="button"
        onClick={handleZoomIn}
        style={buttonStyle}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </button>

      <button
        type="button"
        onClick={handleZoomOut}
        style={buttonStyle}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </button>

      <button
        type="button"
        onClick={handleReset}
        style={buttonStyle}
        title="Reset Camera (R)"
        aria-label="Reset Camera"
      >
        <RotateCcw size={15} />
      </button>

      <button
        type="button"
        onClick={handleAutoRotate}
        style={{
          ...buttonStyle,
          color: autoRotate ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderColor: autoRotate ? 'var(--accent-primary)' : 'var(--border-hairline)',
        }}
        title="Auto-Rotate Globe (Space)"
        aria-label="Auto-Rotate Globe"
      >
        {autoRotate ? <Pause size={15} /> : <Play size={15} />}
      </button>

      {autoRotate && (
        <button
          type="button"
          onClick={cycleSpeed}
          style={{
            ...buttonStyle,
            fontSize: '0.65rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-primary)',
          }}
          title={`Rotation Speed: ${rotationSpeed} (Click to cycle 0.35x / 0.8x / 1.8x)`}
          aria-label="Cycle Rotation Speed"
        >
          {rotationSpeed <= 0.35 ? '0.3x' : rotationSpeed <= 0.8 ? '0.8x' : '1.8x'}
        </button>
      )}

      <button
        type="button"
        onClick={() => setParticlesOn(!particlesOn)}
        style={{
          ...buttonStyle,
          color: particlesOn ? 'var(--accent-primary)' : 'var(--text-muted)',
          borderColor: particlesOn ? 'var(--accent-primary)' : 'var(--border-hairline)',
        }}
        title="Toggle Streamlines (P)"
        aria-label="Toggle Streamlines"
      >
        <Sparkles size={15} />
      </button>

      {/* NASA SWOT Water Intelligence Toggle */}
      <button
        type="button"
        onClick={() => setSwotWaterVisible(!swotWaterVisible)}
        style={{
          ...buttonStyle,
          color: swotWaterVisible ? 'var(--accent-water)' : 'var(--text-muted)',
          borderColor: swotWaterVisible ? 'var(--accent-water)' : 'var(--border-hairline)',
          backgroundColor: swotWaterVisible ? 'rgba(6,182,212,0.12)' : 'var(--surface-raised)',
        }}
        title="NASA SWOT Water Intelligence (Lakes, Reservoirs, Rivers)"
        aria-label="NASA SWOT Water Intelligence"
      >
        <Droplets size={15} />
      </button>

      {/* NASA Disasters Program Toggle */}
      <button
        type="button"
        onClick={() => setDisastersVisible(!disastersVisible)}
        style={{
          ...buttonStyle,
          color: disastersVisible ? 'var(--accent-disaster)' : 'var(--text-muted)',
          borderColor: disastersVisible ? 'var(--accent-disaster)' : 'var(--border-hairline)',
          backgroundColor: disastersVisible ? 'rgba(239,68,68,0.12)' : 'var(--surface-raised)',
        }}
        title="NASA Disasters Intelligence (Wildfires, Floods, Landslides, Cyclones)"
        aria-label="NASA Disasters Intelligence"
      >
        <ShieldAlert size={15} />
      </button>

      {/* Alaska Satellite Facility (ASF) SAR Radar Toggle */}
      <button
        type="button"
        onClick={() => setRadarVisible(!radarVisible)}
        style={{
          ...buttonStyle,
          color: radarVisible ? 'var(--accent-radar)' : 'var(--text-muted)',
          borderColor: radarVisible ? 'var(--accent-radar)' : 'var(--border-hairline)',
          backgroundColor: radarVisible ? 'rgba(168,85,247,0.12)' : 'var(--surface-raised)',
        }}
        title="Alaska Satellite Facility (ASF) Sentinel-1 SAR Radar Swaths"
        aria-label="ASF SAR Radar Observations"
      >
        <Radar size={15} />
      </button>

      {/* Canadian Geo.ca Regional Geospatial Toggle */}
      <button
        type="button"
        onClick={() => setGeocaVisible(!geocaVisible)}
        style={{
          ...buttonStyle,
          color: geocaVisible ? '#ef4444' : 'var(--text-muted)',
          borderColor: geocaVisible ? '#ef4444' : 'var(--border-hairline)',
          backgroundColor: geocaVisible ? 'rgba(239,68,68,0.12)' : 'var(--surface-raised)',
        }}
        title="Geo.ca Canadian Geospatial Data (Flood Risk, Caribou, Permafrost)"
        aria-label="Canadian Geo.ca Data"
      >
        <MapPin size={15} />
      </button>

      {/* NASA FIRMS Active Wildfires Layer Toggle */}
      <button
        type="button"
        onClick={() => setFiresVisible(!firesVisible)}
        style={{
          ...buttonStyle,
          color: firesVisible ? '#ef4444' : 'var(--text-muted)',
          borderColor: firesVisible ? '#ef4444' : 'var(--border-hairline)',
        }}
        title="NASA FIRMS Active Fire Hotspots"
        aria-label="NASA FIRMS Active Fire Hotspots"
      >
        <Flame size={15} />
      </button>

      {/* Earth Through Time Historical Mode Toggle */}
      <button
        type="button"
        onClick={() => setHistoricalMode(!historicalMode)}
        style={{
          ...buttonStyle,
          color: historicalMode ? 'var(--accent-primary)' : 'var(--text-muted)',
          borderColor: historicalMode ? 'var(--accent-primary)' : 'var(--border-hairline)',
        }}
        title="Earth Through Time (1880 - Present)"
        aria-label="Earth Through Time"
      >
        <History size={15} />
      </button>

      {/* Location Comparison Mode Toggle */}
      <button
        type="button"
        onClick={() => setComparisonMode(!comparisonMode)}
        style={{
          ...buttonStyle,
          color: comparisonMode ? 'var(--accent-ocean)' : 'var(--text-muted)',
          borderColor: comparisonMode ? 'var(--accent-ocean)' : 'var(--border-hairline)',
        }}
        title="Compare Environmental Locations"
        aria-label="Compare Environmental Locations"
      >
        <GitCompare size={15} />
      </button>

      {/* Satellite Tracking Mode Toggle */}
      <button
        type="button"
        onClick={() => setSatelliteMode(!satelliteMode)}
        style={{
          ...buttonStyle,
          color: satelliteMode ? '#c084fc' : 'var(--text-muted)',
          borderColor: satelliteMode ? '#c084fc' : 'var(--border-hairline)',
          backgroundColor: satelliteMode ? 'rgba(192,132,252,0.1)' : 'var(--surface-raised)',
        }}
        title="Satellite Tracking Mode — Live orbital positions"
        aria-label="Toggle Satellite Tracking Mode"
      >
        <SatelliteDish size={15} />
      </button>
    </div>
  );
}
