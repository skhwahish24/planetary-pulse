import { create } from 'zustand';
import type { ExplorerState, Mode, Probe } from '@/types/store';
import type { LayerId, Domain } from '@/types/layers';
import type { TLERecord, SatelliteCategory } from '@/types/satellites';
import type { SWOTWaterBody } from '@/types/swot';
import type { DisasterEvent } from '@/types/disasters';
import type { SARSceneMetadata } from '@/types/radar';
import type { GeoCaDatasetEntry } from '@/types/coastal-geoca';
import { DOMAIN_DEFAULT_LAYER } from '@/lib/layers';

export const useExplorerStore = create<ExplorerState>((set) => ({
  mode: '3d',
  domain: 'atmosphere',
  activeLayer: 'temperature',
  particlesOn: true,
  firesVisible: false,
  historicalMode: false,
  selectedYear: 2026,
  comparisonMode: false,
  compareProbe: null,
  timeIso: '2026-10-01T12:00:00.000Z',
  probe: null,
  panelOpen: false,
  quality: 'high',

  // Earth rotation defaults
  autoRotate: true,
  rotationSpeed: 0.35,

  // Satellite tracking defaults
  satelliteMode: false,
  selectedSatellite: null,
  satelliteCategory: 'all',
  satelliteTrailsVisible: true,
  followSatellite: false,

  // Earth Intelligence Modules defaults
  swotWaterVisible: false,
  disastersVisible: false,
  radarVisible: false,
  geocaVisible: false,
  selectedWaterBody: null,
  selectedDisasterEvent: null,
  selectedRadarScene: null,
  selectedGeoCaDataset: null,

  setMode: (m: Mode) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('m', m);
      window.history.replaceState({}, '', url.toString());
    }
    set({ mode: m });
  },

  setDomain: (d: Domain) => {
    const defaultLayer = DOMAIN_DEFAULT_LAYER[d];
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('layer', defaultLayer);
      window.history.replaceState({}, '', url.toString());
    }
    set({ domain: d, activeLayer: defaultLayer });
  },

  setLayer: (l: LayerId) => {
    const isVector = l === 'wind' || l === 'currents';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('layer', l);
      window.history.replaceState({}, '', url.toString());
    }
    set({
      activeLayer: l,
      particlesOn: isVector,
      swotWaterVisible: l === 'swot_water' || l === 'lakes_reservoirs' || l === 'rivers',
      disastersVisible: l === 'wildfires' || l === 'floods' || l === 'landslides' || l === 'cyclones' || l === 'recovery',
      radarVisible: l === 'sar_observations',
      geocaVisible: l === 'geoca_canada',
    });
  },

  setProbe: (p: Probe | null) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (p) {
        url.searchParams.set('lat', p.lat.toFixed(4));
        url.searchParams.set('lon', p.lon.toFixed(4));
      } else {
        url.searchParams.delete('lat');
        url.searchParams.delete('lon');
      }
      window.history.replaceState({}, '', url.toString());
    }
    set({ probe: p, panelOpen: p !== null });
  },

  setCompareProbe: (p: Probe | null) => set({ compareProbe: p }),

  setComparisonMode: (enabled: boolean) => set({ comparisonMode: enabled }),

  setHistoricalMode: (enabled: boolean) => set({ historicalMode: enabled }),

  setSelectedYear: (year: number) => set({ selectedYear: year }),

  setFiresVisible: (visible: boolean) => set({ firesVisible: visible }),

  setTime: (iso: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('t', iso);
      window.history.replaceState({}, '', url.toString());
    }
    set({ timeIso: iso });
  },

  closePanel: () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('lat');
      url.searchParams.delete('lon');
      window.history.replaceState({}, '', url.toString());
    }
    set({ panelOpen: false, probe: null });
  },

  setParticlesOn: (on: boolean) => set({ particlesOn: on }),

  setQuality: (q: 'high' | 'low') => set({ quality: q }),

  setAutoRotate: (enabled: boolean) => set({ autoRotate: enabled }),
  setRotationSpeed: (speed: number) => set({ rotationSpeed: speed }),

  // Satellite setters
  setSatelliteMode: (enabled: boolean) => set({ satelliteMode: enabled }),
  setSelectedSatellite: (sat: TLERecord | null) => set({ selectedSatellite: sat }),
  setSatelliteCategory: (cat: SatelliteCategory | 'all') => set({ satelliteCategory: cat }),
  setSatelliteTrailsVisible: (visible: boolean) => set({ satelliteTrailsVisible: visible }),
  setFollowSatellite: (follow: boolean) => set({ followSatellite: follow }),

  // Earth Intelligence setters
  setSwotWaterVisible: (visible: boolean) => set({ swotWaterVisible: visible }),
  setDisastersVisible: (visible: boolean) => set({ disastersVisible: visible }),
  setRadarVisible: (visible: boolean) => set({ radarVisible: visible }),
  setGeocaVisible: (visible: boolean) => set({ geocaVisible: visible }),
  setSelectedWaterBody: (body: SWOTWaterBody | null) => set({ selectedWaterBody: body }),
  setSelectedDisasterEvent: (event: DisasterEvent | null) => set({ selectedDisasterEvent: event }),
  setSelectedRadarScene: (scene: SARSceneMetadata | null) => set({ selectedRadarScene: scene }),
  setSelectedGeoCaDataset: (entry: GeoCaDatasetEntry | null) => set({ selectedGeoCaDataset: entry }),
}));
