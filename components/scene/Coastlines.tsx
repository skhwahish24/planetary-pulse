'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { latLonToVec3 } from '@/lib/geo';

export function Coastlines() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let active = true;

    fetch('/geo/countries-50m.json')
      .then((res) => res.json())
      .then((topology: Topology<{ countries: GeometryCollection }>) => {
        if (!active) return;

        // Extract boundaries mesh
        const mesh = topojson.mesh(topology, topology.objects.countries);
        const points: THREE.Vector3[] = [];
        const r = 1.0012;

        if (mesh.type === 'MultiLineString') {
          for (const line of mesh.coordinates) {
            for (let i = 0; i < line.length - 1; i++) {
              const [lon1, lat1] = line[i];
              const [lon2, lat2] = line[i + 1];
              // Avoid wrapping jump artifacts
              if (Math.abs(lon1 - lon2) < 180) {
                points.push(latLonToVec3(lat1, lon1, r));
                points.push(latLonToVec3(lat2, lon2, r));
              }
            }
          }
        }

        const geom = new THREE.BufferGeometry().setFromPoints(points);
        setGeometry(geom);
      })
      .catch(() => {
        // Fallback silently if fetch blocked
      });

    return () => {
      active = false;
    };
  }, []);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </lineSegments>
  );
}
