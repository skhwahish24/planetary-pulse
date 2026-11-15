'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/geo';
import { useExplorerStore } from '@/store/useExplorerStore';
import type { FireHotspot } from '@/app/api/events/firms/route';

interface FireHotspotsLayerProps {
  visible: boolean;
}

export function FireHotspotsLayer({ visible }: FireHotspotsLayerProps) {
  const [hotspots, setHotspots] = useState<FireHotspot[]>([]);
  const setProbe = useExplorerStore((s) => s.setProbe);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    fetch('/api/events/firms')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.hotspots) {
          setHotspots(data.hotspots);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const { positions, colors } = useMemo(() => {
    if (!visible || hotspots.length === 0) {
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }

    const pos = new Float32Array(hotspots.length * 3);
    const col = new Float32Array(hotspots.length * 3);

    hotspots.forEach((h, i) => {
      const v = latLonToVec3(h.latitude, h.longitude, 1.015);
      pos[i * 3 + 0] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      // Vivid thermal flame color (bright red-orange)
      col[i * 3 + 0] = 1.0;
      col[i * 3 + 1] = 0.28;
      col[i * 3 + 2] = 0.05;
    });

    return { positions: pos, colors: col };
  }, [hotspots, visible]);

  if (!visible || hotspots.length === 0) return null;

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={8}
          sizeAttenuation={false}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Interactive invisible hit spheres for easy clicking */}
      {hotspots.map((h) => {
        const v = latLonToVec3(h.latitude, h.longitude, 1.015);
        return (
          <mesh
            key={h.id}
            position={[v.x, v.y, v.z]}
            onClick={(e) => {
              e.stopPropagation();
              setProbe({ lat: h.latitude, lon: h.longitude });
            }}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        );
      })}
    </group>
  );
}
