'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/geo';

export function Graticule() {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const r = 1.0008;

    // Parallels (Latitude lines from -75 to 75 every 15 deg)
    for (let lat = -75; lat <= 75; lat += 15) {
      const step = 2.5;
      for (let lon = -180; lon < 180; lon += step) {
        const p1 = latLonToVec3(lat, lon, r);
        const p2 = latLonToVec3(lat, lon + step, r);
        points.push(p1, p2);
      }
    }

    // Meridians (Longitude lines every 15 deg)
    for (let lon = -180; lon < 180; lon += 15) {
      const step = 2.5;
      for (let lat = -85; lat < 85; lat += step) {
        const p1 = latLonToVec3(lat, lon, r);
        const p2 = latLonToVec3(lat + step, lon, r);
        points.push(p1, p2);
      }
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, []);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial
        color="#2e3e56"
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </lineSegments>
  );
}
