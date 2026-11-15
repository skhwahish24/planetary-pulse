'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createSeededRng } from '@/lib/noise';

export function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const starCount = 3500;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const rng = createSeededRng(1984);

    for (let i = 0; i < starCount; i++) {
      // Deep space spherical shell (radius 45 to 85) positioned well behind the globe
      const u = rng();
      const v = rng();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 45 + rng() * 40;

      const sinPhi = Math.sin(phi);
      pos[i * 3 + 0] = r * sinPhi * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * sinPhi * Math.sin(theta);

      // Star spectral variations: warm white, pale blue-white, and amber
      const temp = rng();
      if (temp > 0.8) {
        // Hot blue-white stars
        col[i * 3 + 0] = 0.82;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 1.0;
      } else if (temp < 0.15) {
        // Red/amber dwarf stars
        col[i * 3 + 0] = 1.0;
        col[i * 3 + 1] = 0.82;
        col[i * 3 + 2] = 0.68;
      } else {
        // Neutral white
        col[i * 3 + 0] = 0.94;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 0.98;
      }

      // Warm white, pale blue-white, or amber
      const spectral = 0.5 + rng() * 0.5;
      col[i * 3 + 0] *= spectral;
      col[i * 3 + 1] *= spectral;
      col[i * 3 + 2] *= spectral;
    }

    return { positions: pos, colors: col };
  }, []);

  // Subtle natural twinkling effect using time sine modulation
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    // Very subtle slow rotation for parallax depth
    pointsRef.current.rotation.y = time * 0.0006;
  });

  return (
    <points ref={pointsRef}>
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
        size={1.3}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
