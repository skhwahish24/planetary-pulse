'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/geo';
import { useExplorerStore } from '@/store/useExplorerStore';
import type { SARSceneMetadata } from '@/types/radar';

interface RadarObservationLayerProps {
  visible: boolean;
}

export function RadarObservationLayer({ visible }: RadarObservationLayerProps) {
  const [scenes, setScenes] = useState<SARSceneMetadata[]>([]);
  const setSelectedRadarScene = useExplorerStore((s) => s.setSelectedRadarScene);
  const selectedRadarScene = useExplorerStore((s) => s.selectedRadarScene);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    fetch('/api/radar/asf')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.scenes) {
          setScenes(data.scenes);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Construct polygon line segments for each SAR scene swath footprint
  const lineGeometries = useMemo(() => {
    if (!visible || scenes.length === 0) return [];

    return scenes.map((scene) => {
      const points: THREE.Vector3[] = [];
      scene.footprintCoordinates.forEach(([lat, lon]) => {
        points.push(latLonToVec3(lat, lon, 1.012));
      });
      // Close the polygon
      if (scene.footprintCoordinates.length > 0) {
        const [firstLat, firstLon] = scene.footprintCoordinates[0];
        points.push(latLonToVec3(firstLat, firstLon, 1.012));
      }
      return {
        scene,
        geometry: new THREE.BufferGeometry().setFromPoints(points),
        center: latLonToVec3(scene.centerLatitude, scene.centerLongitude, 1.014),
      };
    });
  }, [scenes, visible]);

  if (!visible || scenes.length === 0) return null;

  return (
    <group>
      {lineGeometries.map(({ scene, geometry, center }) => {
        const isSelected = selectedRadarScene?.granuleName === scene.granuleName;

        return (
          <group key={scene.granuleName}>
            <line>
              <primitive object={geometry} />
              <lineBasicMaterial
                color={isSelected ? '#f43f5e' : '#c084fc'}
                transparent
                opacity={isSelected ? 0.95 : 0.65}
                linewidth={1.5}
                depthWrite={false}
              />
            </line>

            {/* Clickable center marker */}
            <mesh
              position={[center.x, center.y, center.z]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRadarScene(scene);
              }}
            >
              <octahedronGeometry args={[0.02, 0]} />
              <meshBasicMaterial color={isSelected ? '#f43f5e' : '#c084fc'} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
