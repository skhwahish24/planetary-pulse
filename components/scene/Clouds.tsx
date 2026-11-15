'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

export function Clouds() {
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudsMap = useLoader(THREE.TextureLoader, '/textures/earth-clouds.png');

  cloudsMap.wrapS = THREE.RepeatWrapping;
  cloudsMap.wrapT = THREE.ClampToEdgeWrapping;
  cloudsMap.colorSpace = THREE.SRGBColorSpace;

  // Slowly drift clouds relative to the Earth surface
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.003;
    }
  });

  return (
    <mesh ref={cloudsRef} scale={[1.006, 1.006, 1.006]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={cloudsMap}
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.NormalBlending}
        roughness={1.0}
      />
    </mesh>
  );
}
