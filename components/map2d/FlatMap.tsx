'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  ImageOverlay,
  useMapEvents,
  CircleMarker,
  Tooltip,
  Polygon,
  Rectangle,
} from 'react-leaflet';
import L from 'leaflet';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGridField } from '@/hooks/useGridField';
import { LAYER_REGISTRY } from '@/lib/layers';
import { getComputedToken } from '@/lib/colormap';
import type { LayerId } from '@/types/layers';
import type { SWOTWaterBody } from '@/types/swot';
import type { DisasterEvent } from '@/types/disasters';
import type { SARSceneMetadata } from '@/types/radar';
import type { GeoCaDatasetEntry } from '@/types/coastal-geoca';
import type { FireHotspot } from '@/app/api/events/firms/route';

function MapClickHandler() {
  const setProbe = useExplorerStore((s) => s.setProbe);

  useMapEvents({
    click(e) {
      let { lat, lng } = e.latlng;
      while (lng < -180) lng += 360;
      while (lng > 180) lng -= 360;
      lat = Math.max(-90, Math.min(90, lat));
      setProbe({ lat, lon: lng });
    },
  });

  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 128,
    parseInt(clean.slice(2, 4), 16) || 128,
    parseInt(clean.slice(4, 6), 16) || 128,
  ];
}

export function FlatMap() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const timeIso = useExplorerStore((s) => s.timeIso);

  // Earth Intelligence layer visibility
  const swotWaterVisible = useExplorerStore((s) => s.swotWaterVisible);
  const disastersVisible = useExplorerStore((s) => s.disastersVisible);
  const radarVisible = useExplorerStore((s) => s.radarVisible);
  const geocaVisible = useExplorerStore((s) => s.geocaVisible);
  const firesVisible = useExplorerStore((s) => s.firesVisible);

  // Selection setters
  const setSelectedWaterBody = useExplorerStore((s) => s.setSelectedWaterBody);
  const setSelectedDisasterEvent = useExplorerStore((s) => s.setSelectedDisasterEvent);
  const setSelectedRadarScene = useExplorerStore((s) => s.setSelectedRadarScene);
  const setSelectedGeoCaDataset = useExplorerStore((s) => s.setSelectedGeoCaDataset);
  const setProbe = useExplorerStore((s) => s.setProbe);

  // Active selections
  const selectedWaterBody = useExplorerStore((s) => s.selectedWaterBody);
  const selectedDisasterEvent = useExplorerStore((s) => s.selectedDisasterEvent);
  const selectedRadarScene = useExplorerStore((s) => s.selectedRadarScene);
  const selectedGeoCaDataset = useExplorerStore((s) => s.selectedGeoCaDataset);

  // Fetched data states
  const [waterBodies, setWaterBodies] = useState<SWOTWaterBody[]>([]);
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [radarScenes, setRadarScenes] = useState<SARSceneMetadata[]>([]);
  const [geocaDatasets, setGeocaDatasets] = useState<GeoCaDatasetEntry[]>([]);
  const [fireHotspots, setFireHotspots] = useState<FireHotspot[]>([]);

  // Fetch SWOT water data when visible
  useEffect(() => {
    if (!swotWaterVisible) return;
    let isMounted = true;
    fetch('/api/water/swot')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.waterBodies) setWaterBodies(data.waterBodies);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [swotWaterVisible]);

  // Fetch Disasters data when visible
  useEffect(() => {
    if (!disastersVisible) return;
    let isMounted = true;
    fetch('/api/disasters')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.events) setDisasters(data.events);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [disastersVisible]);

  // Fetch SAR radar scenes when visible
  useEffect(() => {
    if (!radarVisible) return;
    let isMounted = true;
    fetch('/api/radar/asf')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.scenes) setRadarScenes(data.scenes);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [radarVisible]);

  // Fetch Canadian Geo.ca data when visible
  useEffect(() => {
    if (!geocaVisible) return;
    let isMounted = true;
    fetch('/api/regional/geoca')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.canadianDatasets) setGeocaDatasets(data.canadianDatasets);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [geocaVisible]);

  // Fetch FIRMS fire hotspots when visible
  useEffect(() => {
    if (!firesVisible) return;
    let isMounted = true;
    fetch('/api/events/firms')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.hotspots) setFireHotspots(data.hotspots);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [firesVisible]);

  const { data: gridField } = useGridField(activeLayer, timeIso);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!gridField) return;

    const { W, H, scalar, mask } = gridField;
    const def = LAYER_REGISTRY[activeLayer as LayerId] || LAYER_REGISTRY['temperature'];
    const [min, max] = def.range;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const canvas = offscreenCanvasRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(W, H);
    const pixels = imgData.data;
    const stops = def.rampTokens.map((t) => hexToRgb(getComputedToken(t, '#38bdf8')));
    const numStops = stops.length;

    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const idx = j * W + i;
        const pIdx = idx * 4;

        if (mask[idx] === 0 || !Number.isFinite(scalar[idx])) {
          pixels[pIdx + 3] = 0;
          continue;
        }

        const val = scalar[idx];
        const norm = Math.max(0, Math.min(1, (val - min) / (max - min)));

        const pos = norm * (numStops - 1);
        const sIdx = Math.min(Math.floor(pos), numStops - 2);
        const frac = pos - sIdx;

        const c1 = stops[sIdx];
        const c2 = stops[sIdx + 1];

        pixels[pIdx + 0] = Math.round(c1[0] + (c2[0] - c1[0]) * frac);
        pixels[pIdx + 1] = Math.round(c1[1] + (c2[1] - c1[1]) * frac);
        pixels[pIdx + 2] = Math.round(c1[2] + (c2[2] - c1[2]) * frac);
        pixels[pIdx + 3] = 210;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setOverlayUrl(canvas.toDataURL());
  }, [gridField, activeLayer]);

  const bounds: L.LatLngBoundsExpression = [
    [-90, -180],
    [90, 180],
  ];

  const canadaBounds: L.LatLngBoundsExpression = [
    [41.67, -141.0],
    [83.11, -52.62],
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--space-bg)',
        position: 'relative',
      }}
    >
      <style>{`
        .leaflet-container {
          background-color: #020408 !important;
        }
        .leaflet-bar a {
          background-color: var(--surface-raised) !important;
          color: var(--text-primary) !important;
          border-color: var(--border-hairline) !important;
        }
        .leaflet-control-attribution {
          background-color: var(--surface-sunken) !important;
          color: var(--text-muted) !important;
          font-family: monospace;
          font-size: 10px;
          border: 1px solid var(--border-hairline);
        }
        .custom-leaflet-tooltip {
          background-color: var(--surface-raised) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-active) !important;
          font-family: monospace !important;
          font-size: 11px !important;
          padding: 4px 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
      `}</style>
      <MapContainer
        crs={L.CRS.EPSG4326}
        center={[20, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={8}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#020408',
        }}
      >
        <MapClickHandler />

        {/* Real NASA Satellite Basemap underlay for equirectangular projection */}
        <ImageOverlay url="/textures/earth-blue-marble.jpg" bounds={bounds} opacity={0.65} />
        {overlayUrl && <ImageOverlay url={overlayUrl} bounds={bounds} opacity={0.9} />}

        {/* Canadian Geo.ca National Boundary Box */}
        {geocaVisible && (
          <Rectangle
            bounds={canadaBounds}
            pathOptions={{
              color: '#ef4444',
              weight: 1.5,
              dashArray: '5, 5',
              fillColor: '#ef4444',
              fillOpacity: 0.04,
            }}
          >
            <Tooltip className="custom-leaflet-tooltip" permanent={false}>
              Canada Territorial Boundary (Geo.ca National Framework)
            </Tooltip>
          </Rectangle>
        )}

        {/* ASF SAR Radar Footprint Polygons */}
        {radarVisible &&
          radarScenes.map((scene) => {
            const isSelected = selectedRadarScene?.granuleName === scene.granuleName;
            return (
              <Polygon
                key={scene.granuleName}
                positions={scene.footprintCoordinates}
                pathOptions={{
                  color: isSelected ? '#ffffff' : '#a855f7',
                  weight: isSelected ? 2.5 : 1.5,
                  fillColor: '#a855f7',
                  fillOpacity: isSelected ? 0.35 : 0.18,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedRadarScene(scene);
                  },
                }}
              >
                <Tooltip className="custom-leaflet-tooltip">
                  <strong>SAR: {scene.granuleName}</strong> ({scene.platform})
                </Tooltip>
              </Polygon>
            );
          })}

        {/* NASA SWOT Water Bodies */}
        {swotWaterVisible &&
          waterBodies.map((body) => {
            const isSelected = selectedWaterBody?.id === body.id;
            const color =
              body.type === 'lake'
                ? '#06b6d4'
                : body.type === 'reservoir'
                ? '#10b981'
                : body.type === 'river_reach'
                ? '#38bdf8'
                : '#a855f7';

            return (
              <CircleMarker
                key={body.id}
                center={[body.latitude, body.longitude]}
                radius={isSelected ? 8 : 6}
                pathOptions={{
                  color: isSelected ? '#ffffff' : color,
                  fillColor: color,
                  fillOpacity: 0.85,
                  weight: isSelected ? 2.5 : 1.5,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedWaterBody(body);
                  },
                }}
              >
                <Tooltip className="custom-leaflet-tooltip">
                  <strong>{body.name}</strong> ({body.type})<br />
                  Elev: {body.currentMeasurement.waterSurfaceElevationM}m
                  {body.currentMeasurement.waterStorageChangeMcm !== undefined && (
                    <span>
                      {' '}
                      | Storage Δ:{' '}
                      {body.currentMeasurement.waterStorageChangeMcm > 0 ? '+' : ''}
                      {body.currentMeasurement.waterStorageChangeMcm}Mcm
                    </span>
                  )}
                </Tooltip>
              </CircleMarker>
            );
          })}

        {/* NASA Disasters Events */}
        {disastersVisible &&
          disasters.map((event) => {
            const isSelected = selectedDisasterEvent?.id === event.id;
            const color =
              event.category === 'wildfire'
                ? '#ef4444'
                : event.category === 'flood'
                ? '#0284c7'
                : event.category === 'landslide'
                ? '#f59e0b'
                : event.category === 'cyclone'
                ? '#8b5cf6'
                : '#10b981';

            return (
              <CircleMarker
                key={event.id}
                center={[event.latitude, event.longitude]}
                radius={isSelected ? 9 : 7}
                pathOptions={{
                  color: isSelected ? '#ffffff' : color,
                  fillColor: color,
                  fillOpacity: 0.9,
                  weight: isSelected ? 2.5 : 1.5,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedDisasterEvent(event);
                  },
                }}
              >
                <Tooltip className="custom-leaflet-tooltip">
                  <strong>{event.title}</strong> [{event.severity.toUpperCase()}]<br />
                  {event.summary}
                </Tooltip>
              </CircleMarker>
            );
          })}

        {/* Geo.ca Canadian Datasets */}
        {geocaVisible &&
          geocaDatasets.map((ds) => {
            const isSelected = selectedGeoCaDataset?.id === ds.id;
            return (
              <CircleMarker
                key={ds.id}
                center={[ds.latitude, ds.longitude]}
                radius={isSelected ? 8 : 6}
                pathOptions={{
                  color: isSelected ? '#ffffff' : '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.85,
                  weight: isSelected ? 2.5 : 1.5,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedGeoCaDataset(ds);
                  },
                }}
              >
                <Tooltip className="custom-leaflet-tooltip">
                  <strong>{ds.title}</strong> ({ds.provinceOrTerritory})<br />
                  {ds.keyMetric.label}: {ds.keyMetric.value} {ds.keyMetric.unit}
                </Tooltip>
              </CircleMarker>
            );
          })}

        {/* NASA FIRMS Active Fire Hotspots */}
        {firesVisible &&
          fireHotspots.map((h) => (
            <CircleMarker
              key={h.id}
              center={[h.latitude, h.longitude]}
              radius={4}
              pathOptions={{
                color: '#ff4500',
                fillColor: '#ff2200',
                fillOpacity: 0.95,
                weight: 1,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setProbe({ lat: h.latitude, lon: h.longitude });
                },
              }}
            >
              <Tooltip className="custom-leaflet-tooltip">
                Thermal Hotspot ({h.satellite})<br />
                FRP: {h.frp} MW | Conf: {h.confidence}%
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}