'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/geo';
import { useExplorerStore } from '@/store/useExplorerStore';
import type { DisasterEvent } from '@/types/disasters';

interface DisasterIntelligenceLayerProps {
  visible: boolean;
}

export function DisasterIntelligenceLayer({ visible }: DisasterIntelligenceLayerProps) {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const setSelectedDisasterEvent = useExplorerStore((s) => s.setSelectedDisasterEvent);
  const selectedDisasterEvent = useExplorerStore((s) => s.selectedDisasterEvent);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    fetch('/api/disasters')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.events) {
          setEvents(data.events);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const { positions, colors } = useMemo(() => {
    if (!visible || events.length === 0) {
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }

    const pos = new Float32Array(events.length * 3);
    const col = new Float32Array(events.length * 3);

    events.forEach((ev, i) => {
      const v = latLonToVec3(ev.latitude, ev.longitude, 1.02);
      pos[i * 3 + 0] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      const isSelected = selectedDisasterEvent?.id === ev.id;
      if (isSelected) {
        col[i * 3 + 0] = 1.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 0.2; // Bright yellow highlight
      } else if (ev.category === 'wildfire') {
        col[i * 3 + 0] = 1.0;
        col[i * 3 + 1] = 0.22;
        col[i * 3 + 2] = 0.05; // Bright red-orange
      } else if (ev.category === 'flood') {
        col[i * 3 + 0] = 0.08;
        col[i * 3 + 1] = 0.65;
        col[i * 3 + 2] = 1.0; // Flood blue
      } else if (ev.category === 'landslide') {
        col[i * 3 + 0] = 0.95;
        col[i * 3 + 1] = 0.62;
        col[i * 3 + 2] = 0.08; // Amber
      } else if (ev.category === 'cyclone') {
        col[i * 3 + 0] = 0.85;
        col[i * 3 + 1] = 0.2;
        col[i * 3 + 2] = 0.95; // Magenta
      } else {
        col[i * 3 + 0] = 0.4;
        col[i * 3 + 1] = 0.8;
        col[i * 3 + 2] = 0.4; // Recovery green
      }
    });

    return { positions: pos, colors: col };
  }, [events, visible, selectedDisasterEvent]);

  if (!visible || events.length === 0) return null;

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={12}
          sizeAttenuation={false}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Interactive Raycast meshes */}
      {events.map((ev) => {
        const v = latLonToVec3(ev.latitude, ev.longitude, 1.02);
        return (
          <mesh
            key={ev.id}
            position={[v.x, v.y, v.z]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDisasterEvent(ev);
            }}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        );
      })}
    </group>
  );
}
