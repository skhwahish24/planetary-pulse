'use client';

/**
 * OrbitalTrail — renders the predicted orbital path for the selected satellite.
 * Orbit points are fetched from server-side API (SGP4 propagation runs in Node.js).
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { useExplorerStore } from '@/store/useExplorerStore';
import { SATELLITE_CATEGORY_COLORS } from '@/types/satellites';
import type { SatelliteCategory } from '@/types/satellites';

interface OrbitPoint { lat: number; lon: number; altKm: number; }
interface OrbitApiResponse { noradId: number; points: OrbitPoint[]; periodMin: number; computedAt: string; }

const EARTH_RADIUS_KM = 6371;

function latLonAltToVec3(lat: number, lon: number, altKm: number): THREE.Vector3 {
  const scale = 1.0 + altKm / EARTH_RADIUS_KM;
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -scale * Math.sin(phi) * Math.cos(theta),
     scale * Math.cos(phi),
     scale * Math.sin(phi) * Math.sin(theta),
  );
}

export function OrbitalTrail() {
  const selectedSatellite = useExplorerStore((s) => s.selectedSatellite);
  const satelliteTrailsVisible = useExplorerStore((s) => s.satelliteTrailsVisible);

  const { data: orbitData } = useQuery<OrbitApiResponse>({
    queryKey: ['orbit', selectedSatellite?.noradId],
    queryFn: async () => {
      if (!selectedSatellite) throw new Error('No satellite');
      const res = await fetch(
        `/api/satellites/orbit?noradId=${selectedSatellite.noradId}&group=stations`
      );
      if (!res.ok) throw new Error('Orbit fetch failed');
      return res.json() as Promise<OrbitApiResponse>;
    },
    enabled: !!selectedSatellite && satelliteTrailsVisible,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const geometry = useMemo(() => {
    if (!orbitData || orbitData.points.length < 2) return null;
    const points = orbitData.points.map((p) => latLonAltToVec3(p.lat, p.lon, p.altKm));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [orbitData]);

  if (!geometry || !selectedSatellite || !satelliteTrailsVisible) return null;

  const hex = SATELLITE_CATEGORY_COLORS[selectedSatellite.category as SatelliteCategory] ?? '#ffffff';

  return (
    <line>
      <primitive object={geometry} />
      <lineBasicMaterial color={hex} transparent opacity={0.4} depthTest depthWrite={false} />
    </line>
  );
}
