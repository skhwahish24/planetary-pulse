'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/geo';
import { useExplorerStore } from '@/store/useExplorerStore';
import type { SWOTWaterBody } from '@/types/swot';

interface WaterIntelligenceLayerProps {
  visible: boolean;
}

export function WaterIntelligenceLayer({ visible }: WaterIntelligenceLayerProps) {
  const [waterBodies, setWaterBodies] = useState<SWOTWaterBody[]>([]);
  const setSelectedWaterBody = useExplorerStore((s) => s.setSelectedWaterBody);
  const selectedWaterBody = useExplorerStore((s) => s.selectedWaterBody);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    fetch('/api/water/swot')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.waterBodies) {
          setWaterBodies(data.waterBodies);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const { positions, colors } = useMemo(() => {
    if (!visible || waterBodies.length === 0) {
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }

    const pos = new Float32Array(waterBodies.length * 3);
    const col = new Float32Array(waterBodies.length * 3);

    waterBodies.forEach((body, i) => {
      const v = latLonToVec3(body.latitude, body.longitude, 1.018);
      pos[i * 3 + 0] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      // Cyan-blue water color (highlighted if selected)
      const isSelected = selectedWaterBody?.id === body.id;
      if (isSelected) {
        col[i * 3 + 0] = 0.4;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 1.0;
      } else if (body.type === 'lake') {
        col[i * 3 + 0] = 0.05;
        col[i * 3 + 1] = 0.75;
        col[i * 3 + 2] = 0.95;
      } else if (body.type === 'reservoir') {
        col[i * 3 + 0] = 0.1;
        col[i * 3 + 1] = 0.85;
        col[i * 3 + 2] = 0.65;
      } else if (body.type === 'river_reach') {
        col[i * 3 + 0] = 0.2;
        col[i * 3 + 1] = 0.6;
        col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3 + 0] = 0.6;
        col[i * 3 + 1] = 0.4;
        col[i * 3 + 2] = 1.0;
      }
    });

    return { positions: pos, colors: col };
  }, [waterBodies, visible, selectedWaterBody]);

  if (!visible || waterBodies.length === 0) return null;

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={10}
          sizeAttenuation={false}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Invisible clickable raycast spheres */}
      {waterBodies.map((body) => {
        const v = latLonToVec3(body.latitude, body.longitude, 1.018);
        return (
          <mesh
            key={body.id}
            position={[v.x, v.y, v.z]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWaterBody(body);
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
