'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/geo';
import { useExplorerStore } from '@/store/useExplorerStore';
import type { GeoCaDatasetEntry } from '@/types/coastal-geoca';

interface GeoCaLayerProps {
  visible: boolean;
}

export function GeoCaLayer({ visible }: GeoCaLayerProps) {
  const [datasets, setDatasets] = useState<GeoCaDatasetEntry[]>([]);
  const setSelectedGeoCaDataset = useExplorerStore((s) => s.setSelectedGeoCaDataset);
  const selectedGeoCaDataset = useExplorerStore((s) => s.selectedGeoCaDataset);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    fetch('/api/regional/geoca')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.canadianDatasets) {
          setDatasets(data.canadianDatasets);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Canadian National Bounding Box Boundary Line (41.6°N to 83.1°N, -141.0°W to -52.6°W)
  const boundaryGeometry = useMemo(() => {
    if (!visible) return null;
    const bbox: [number, number][] = [
      [41.6, -141.0],
      [83.1, -141.0],
      [83.1, -52.6],
      [41.6, -52.6],
      [41.6, -141.0],
    ];
    const points = bbox.map(([lat, lon]) => latLonToVec3(lat, lon, 1.011));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [visible]);

  const { positions, colors } = useMemo(() => {
    if (!visible || datasets.length === 0) {
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }

    const pos = new Float32Array(datasets.length * 3);
    const col = new Float32Array(datasets.length * 3);

    datasets.forEach((ds, i) => {
      const v = latLonToVec3(ds.latitude, ds.longitude, 1.016);
      pos[i * 3 + 0] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      const isSelected = selectedGeoCaDataset?.id === ds.id;
      // Canadian Maple Leaf crimson red with gold highlight
      col[i * 3 + 0] = isSelected ? 1.0 : 0.95;
      col[i * 3 + 1] = isSelected ? 0.9 : 0.15;
      col[i * 3 + 2] = isSelected ? 0.2 : 0.2;
    });

    return { positions: pos, colors: col };
  }, [datasets, visible, selectedGeoCaDataset]);

  if (!visible || datasets.length === 0) return null;

  return (
    <group>
      {/* Canadian Sovereign Geospatial Boundary Frame */}
      {boundaryGeometry && (
        <line>
          <primitive object={boundaryGeometry} />
          <lineDashedMaterial
            color="#ef4444"
            transparent
            opacity={0.4}
            dashSize={0.05}
            gapSize={0.03}
            depthWrite={false}
          />
        </line>
      )}

      {/* Dataset Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={11}
          sizeAttenuation={false}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Clickable Targets */}
      {datasets.map((ds) => {
        const v = latLonToVec3(ds.latitude, ds.longitude, 1.016);
        return (
          <mesh
            key={ds.id}
            position={[v.x, v.y, v.z]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGeoCaDataset(ds);
            }}
          >
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        );
      })}
    </group>
  );
}
