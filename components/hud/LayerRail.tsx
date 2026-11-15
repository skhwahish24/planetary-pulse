'use client';

import { useState, useMemo } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { LAYER_REGISTRY } from '@/lib/layers';
import type { LayerId, Domain } from '@/types/layers';
import {
  Thermometer,
  Flame,
  Wind,
  Waves,
  Compass,
  Activity,
  Layers,
  Droplets,
  CloudRain,
  Sprout,
  TreePine,
  Wheat,
  ShieldAlert,
  Radar,
  Eye,
  Satellite,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface DomainSection {
  domain: Domain;
  label: string;
  icon: typeof Layers;
  layers: { id: LayerId; icon: typeof Thermometer }[];
}

const DOMAIN_SECTIONS: DomainSection[] = [
  {
    domain: 'atmosphere',
    label: 'Atmosphere',
    icon: Wind,
    layers: [
      { id: 'temperature', icon: Thermometer },
      { id: 'anomaly', icon: Flame },
      { id: 'aqi', icon: Activity },
      { id: 'wind', icon: Wind },
      { id: 'aerosols', icon: Zap },
      { id: 'humidity', icon: Droplets },
    ],
  },
  {
    domain: 'ocean_water',
    label: 'Oceans & Water',
    icon: Waves,
    layers: [
      { id: 'sst', icon: Thermometer },
      { id: 'currents', icon: Compass },
      { id: 'waves', icon: Waves },
      { id: 'swot_water', icon: Droplets },
      { id: 'lakes_reservoirs', icon: RefreshCw },
      { id: 'rivers', icon: CloudRain },
    ],
  },
  {
    domain: 'ecosystems',
    label: 'Ecosystems',
    icon: Sprout,
    layers: [
      { id: 'ndvi', icon: Sprout },
      { id: 'agriculture', icon: Wheat },
      { id: 'soil_moisture', icon: Droplets },
      { id: 'forestry', icon: TreePine },
      { id: 'wetlands', icon: CloudRain },
      { id: 'coastal_change', icon: Waves },
    ],
  },
  {
    domain: 'disasters',
    label: 'Disasters',
    icon: ShieldAlert,
    layers: [
      { id: 'wildfires', icon: Flame },
      { id: 'floods', icon: CloudRain },
      { id: 'landslides', icon: ShieldAlert },
      { id: 'cyclones', icon: Wind },
      { id: 'recovery', icon: RefreshCw },
    ],
  },
  {
    domain: 'satellite_intel',
    label: 'Satellite Intelligence',
    icon: Satellite,
    layers: [
      { id: 'sar_observations', icon: Radar },
      { id: 'optical_imagery', icon: Eye },
      { id: 'satellite_imagery', icon: Satellite },
      { id: 'geoca_canada', icon: MapPin },
    ],
  },
];

export function LayerRail() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const setLayer = useExplorerStore((s) => s.setLayer);
  const setDomain = useExplorerStore((s) => s.setDomain);
  const [searchQuery, setSearchQuery] = useState('');
  const [aboutOpen, setAboutOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (dom: string) => {
    setCollapsedSections((prev) => ({ ...prev, [dom]: !prev[dom] }));
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return DOMAIN_SECTIONS;
    const q = searchQuery.toLowerCase().trim();

    return DOMAIN_SECTIONS.map((section) => ({
      ...section,
      layers: section.layers.filter(({ id }) => {
        const def = LAYER_REGISTRY[id];
        if (!def) return false;
        return (
          def.label.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          def.source.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q)
        );
      }),
    })).filter((section) => section.layers.length > 0);
  }, [searchQuery]);

  const activeDef = LAYER_REGISTRY[activeLayer] || LAYER_REGISTRY['temperature'];

  return (
    <aside
      style={{
        width: '270px',
        backgroundColor: 'var(--surface-raised)',
        borderRight: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.875rem 0.625rem',
        gap: '0.75rem',
        zIndex: 10,
        userSelect: 'none',
        overflowY: 'auto',
      }}
      aria-label="Earth Intelligence Layer Navigation"
    >
      {/* Header & Dataset Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            EARTH INTELLIGENCE
          </span>
          <span style={{ fontSize: '0.625rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            NASA 2026
          </span>
        </div>

        {/* Dataset Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search datasets (SWOT, NDVI, SAR...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 1.75rem 0.4rem 1.85rem',
              fontSize: '0.75rem',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.4rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px',
              }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Layer Domain Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {filteredSections.map((section) => {
          const SectionIcon = section.icon;
          const isCollapsed = !searchQuery && !!collapsedSections[section.domain];

          return (
            <div key={section.domain} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.domain)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.25rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <SectionIcon size={13} color="var(--accent-primary)" />
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {section.label}
                  </span>
                </div>
                {isCollapsed ? <ChevronDown size={12} color="var(--text-muted)" /> : <ChevronUp size={12} color="var(--text-muted)" />}
              </button>

              {/* Layers List */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  {section.layers.map(({ id: lid, icon: LayerIcon }) => {
                    const def = LAYER_REGISTRY[lid];
                    if (!def) return null;
                    const isActive = activeLayer === lid;

                    return (
                      <button
                        key={lid}
                        type="button"
                        onClick={() => {
                          setDomain(def.domain);
                          setLayer(lid);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isActive ? 'var(--surface-sunken)' : 'transparent',
                          border: '1px solid',
                          borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 600 : 500,
                          textAlign: 'left',
                          transition: 'all var(--motion-fast)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <LayerIcon
                            size={14}
                            color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
                            style={{ flexShrink: 0 }}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {def.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                            flexShrink: 0,
                            marginLeft: '0.25rem',
                          }}
                        >
                          {def.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsible About This Layer Card */}
      <div
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--surface-sunken)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setAboutOpen(!aboutOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={11} color="var(--accent-primary)" />
            <span>DATA PROVENANCE</span>
          </div>
          {aboutOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {aboutOpen && (
          <div
            style={{
              padding: '0 8px 8px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              lineHeight: 1.35,
            }}
          >
            <div style={{ color: 'var(--text-secondary)' }}>{activeDef.description}</div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.15rem',
                paddingTop: '0.25rem',
                borderTop: '1px solid var(--border-hairline)',
                fontSize: '0.6rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>SCIENTIFIC SOURCE:</span>
              <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{activeDef.source}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>DYNAMIC RANGE:</span>
              <span style={{ color: 'var(--accent-primary)' }}>
                {activeDef.range[0]} to {activeDef.range[1]} {activeDef.unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
