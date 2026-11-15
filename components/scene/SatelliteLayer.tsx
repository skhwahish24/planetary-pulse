'use client';

/**
 * SatelliteLayer — renders satellites as instanced 3D points with per-category colors.
 * Positions are SGP4-propagated from real TLE data. Never fabricates coordinates.
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSatellites } from '@/hooks/useSatellites';
import { useExplorerStore } from '@/store/useExplorerStore';
import { SATELLITE_CATEGORY_COLORS } from '@/types/satellites';
import type { SatelliteCategory } from '@/types/satellites';
import type { LiveSatellite } from '@/hooks/useSatellites';

/** Convert geographic coordinates to 3D Cartesian on a unit sphere scaled by altKm. */
function latLonAltToVec3(lat: number, lon: number, altKm: number, earthRadiusKm = 6371): THREE.Vector3 {
  const earthR = 1.0; // scene units
  const scale = earthR + (altKm / earthRadiusKm) * earthR;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -scale * Math.sin(phi) * Math.cos(theta),
     scale * Math.cos(phi),
     scale * Math.sin(phi) * Math.sin(theta),
  );
}

const EARTH_RADIUS_KM = 6371;
const DUMMY = new THREE.Object3D();

export function SatelliteLayer() {
  const { satellites, isLoading } = useSatellites();
  const satelliteMode = useExplorerStore((s) => s.satelliteMode);
  const selectedSatellite = useExplorerStore((s) => s.selectedSatellite);
  const setSelectedSatellite = useExplorerStore((s) => s.setSelectedSatellite);
  const { invalidate, raycaster, camera } = useThree();

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorArray = useRef<Float32Array>(new Float32Array(0));
  const satellitesRef = useRef<LiveSatellite[]>([]);

  // Geometry — small octahedron for each satellite
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.004, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: false,
        depthWrite: true,
      }),
    []
  );

  const count = satellites.length;

  // Update instance matrices and colors when satellites change
  useEffect(() => {
    satellitesRef.current = satellites;
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;

    const colors = new Float32Array(count * 3);

    satellites.forEach((sat, i) => {
      const pos = sat.position;
      if (!pos) {
        DUMMY.position.set(0, 0, 0);
        DUMMY.scale.setScalar(0); // hide if no position
      } else {
        const vec = latLonAltToVec3(pos.lat, pos.lon, pos.altKm, EARTH_RADIUS_KM);
        DUMMY.position.copy(vec);

        const isSelected = selectedSatellite?.noradId === sat.record.noradId;
        DUMMY.scale.setScalar(isSelected ? 2.5 : 1.0);
      }
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);

      const hex = SATELLITE_CATEGORY_COLORS[sat.record.category as SatelliteCategory] ?? '#ffffff';
      const color = new THREE.Color(hex);
      const isSelected = selectedSatellite?.noradId === sat.record.noradId;
      colors[i * 3]     = isSelected ? 1.0 : color.r;
      colors[i * 3 + 1] = isSelected ? 1.0 : color.g;
      colors[i * 3 + 2] = isSelected ? 0.2 : color.b;
    });

    colorArray.current = colors;
    mesh.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [satellites, count, selectedSatellite, invalidate]);

  // Raycast click to select satellite
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!satelliteMode || !meshRef.current || satellitesRef.current.length === 0) return;

      const canvas = (event.target as HTMLElement).closest('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hits = raycaster.intersectObject(meshRef.current);

      if (hits.length > 0) {
        const instanceId = hits[0].instanceId;
        if (instanceId !== undefined && satellitesRef.current[instanceId]) {
          setSelectedSatellite(satellitesRef.current[instanceId].record);
        }
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [satelliteMode, raycaster, camera, setSelectedSatellite]);

  // Continuous render while satellite mode is active
  useFrame(() => {
    if (satelliteMode) invalidate();
  });

  if (!satelliteMode || isLoading || count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]}>
      <octahedronGeometry args={[0.004, 0]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  );
}
