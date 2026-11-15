'use client';

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useExplorerStore } from '@/store/useExplorerStore';
import { latLonToVec3 } from '@/lib/geo';
import { tokenToColor, observeThemeChanges } from '@/lib/colormap';

export function ProbeMarker() {
  const probe = useExplorerStore((s) => s.probe);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const pinMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const markerColor = useMemo(
    () => tokenToColor('--probe-ring', '#f0f0f0'),
    []
  );

  useEffect(() => {
    const unbind = observeThemeChanges(() => {
      const col = tokenToColor('--probe-ring', '#f0f0f0');
      if (ringMatRef.current) ringMatRef.current.color.copy(col);
      if (pinMatRef.current) pinMatRef.current.color.copy(col);
    });
    return unbind;
  }, []);

  const markerTransform = useMemo(() => {
    if (!probe) return null;
    const pos = latLonToVec3(probe.lat, probe.lon, 1.002);
    const normal = pos.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
    return { pos, quat };
  }, [probe]);

  if (!markerTransform) return null;

  return (
    <group position={markerTransform.pos} quaternion={markerTransform.quat}>
      {/* Surface target ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.026, 32]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={markerColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          depthTest={false}
        />
      </mesh>
      {/* Normal pin vector */}
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.05, 12]} />
        <meshBasicMaterial
          ref={pinMatRef}
          color={markerColor}
          transparent
          opacity={0.85}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
