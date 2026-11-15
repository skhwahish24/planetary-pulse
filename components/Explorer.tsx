'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExplorerStore } from '@/store/useExplorerStore';
import { TopBar } from '@/components/hud/TopBar';
import { LayerRail } from '@/components/hud/LayerRail';
import { Legend } from '@/components/hud/Legend';
import { CursorReadout } from '@/components/hud/CursorReadout';
import { DrilldownPanel } from '@/components/panels/DrilldownPanel';
import { HelpDialog } from '@/components/hud/HelpDialog';
import { HistoricalTimeline } from '@/components/hud/HistoricalTimeline';
import { LocationComparisonModal } from '@/components/hud/LocationComparisonModal';
import { GlobeControls } from '@/components/hud/GlobeControls';
import { SatelliteSearch } from '@/components/hud/SatelliteSearch';
import { SatelliteInfoPanel } from '@/components/panels/SatelliteInfoPanel';
import { WaterIntelligenceModal } from '@/components/panels/WaterIntelligenceModal';
import { DisasterModal } from '@/components/panels/DisasterModal';
import { RadarInspectorModal } from '@/components/panels/RadarInspectorModal';
import { GeoCaModal } from '@/components/panels/GeoCaModal';
import type { LayerId } from '@/types/layers';
import { MousePointerClick, X } from 'lucide-react';

// Dynamic client-side only imports for 3D WebGL Canvas and 2D Leaflet
const GlobeCanvas = dynamic(
  () => import('@/components/scene/GlobeCanvas').then((m) => m.GlobeCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--space-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          fontFamily: 'monospace',
        }}
      >
        INITIALIZING PLANETARY TWIN...
      </div>
    ),
  }
);

const FlatMap = dynamic(
  () => import('@/components/map2d/FlatMap').then((m) => m.FlatMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--space-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          fontFamily: 'monospace',
        }}
      >
        LOADING EQUIRECTANGULAR PROJECTION...
      </div>
    ),
  }
);

export function Explorer() {
  const [queryClient] = useState(() => new QueryClient());
  const mode = useExplorerStore((s) => s.mode);
  const setMode = useExplorerStore((s) => s.setMode);
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const setLayer = useExplorerStore((s) => s.setLayer);
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const setParticlesOn = useExplorerStore((s) => s.setParticlesOn);
  const panelOpen = useExplorerStore((s) => s.panelOpen);
  const closePanel = useExplorerStore((s) => s.closePanel);

  // Satellite and Earth Intelligence states
  const satelliteMode = useExplorerStore((s) => s.satelliteMode);
  const selectedSatellite = useExplorerStore((s) => s.selectedSatellite);
  const selectedWaterBody = useExplorerStore((s) => s.selectedWaterBody);
  const selectedDisasterEvent = useExplorerStore((s) => s.selectedDisasterEvent);
  const selectedRadarScene = useExplorerStore((s) => s.selectedRadarScene);
  const selectedGeoCaDataset = useExplorerStore((s) => s.selectedGeoCaDataset);

  const [helpOpen, setHelpOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('pp-visited');
      if (!visited) setShowHint(true);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pp-visited', '1');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside input / textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const layerKeys: Record<string, LayerId> = {
        '1': 'temperature',
        '2': 'anomaly',
        '3': 'aqi',
        '4': 'wind',
        '5': 'sst',
        '6': 'waves',
        '7': 'currents',
      };

      if (layerKeys[e.key]) {
        e.preventDefault();
        setLayer(layerKeys[e.key]);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMode(mode === '3d' ? '2d' : '3d');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setParticlesOn(!particlesOn);
      } else if (e.key === 'Escape') {
        closePanel();
        setHelpOpen(false);
      } else if (e.key === '?') {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, setMode, activeLayer, setLayer, particlesOn, setParticlesOn, closePanel]);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100dvh',
          backgroundColor: 'var(--surface-base)',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Control Bar */}
        <TopBar />

        {/* Workspace Canvas & Rails */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left Layer Rail */}
          <LayerRail />

          {/* Central Viewport */}
          <main
            style={{
              flex: 1,
              position: 'relative',
              backgroundColor: 'var(--space-bg)',
              overflow: 'hidden',
            }}
          >
            {mode === '3d' ? <GlobeCanvas /> : <FlatMap />}

            {/* Viewport Control Palette */}
            <GlobeControls />

            {/* Satellite Tracking UI Overlays */}
            {satelliteMode && <SatelliteSearch />}
            {selectedSatellite && <SatelliteInfoPanel />}

            {/* Earth Intelligence Specialized Inspector Modals */}
            {selectedWaterBody && <WaterIntelligenceModal />}
            {selectedDisasterEvent && <DisasterModal />}
            {selectedRadarScene && <RadarInspectorModal />}
            {selectedGeoCaDataset && <GeoCaModal />}

            {/* Bottom-left Data Legend */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                zIndex: 10,
              }}
            >
              <Legend />
            </div>

            {/* Bottom-right Cursor Coordinate & Value Readout */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                zIndex: 10,
              }}
            >
              <CursorReadout />
            </div>

            {/* First-visit onboarding hint card */}
            {showHint && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '4.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 25,
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                }}
              >
                <MousePointerClick size={15} color="var(--accent-primary)" />
                <span>Click any coordinate on the globe to open physical telemetry.</span>
                <button
                  type="button"
                  onClick={dismissHint}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label="Dismiss hint"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Earth Through Time Historical Timeline Controller */}
            <HistoricalTimeline />
          </main>

          {/* Right Drill-down Dashboard */}
          {panelOpen && <DrilldownPanel />}
        </div>

        {/* Location Comparison Modal */}
        <LocationComparisonModal />

        {/* Keyboard Shortcuts Dialog */}
        <HelpDialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </QueryClientProvider>
  );
}
