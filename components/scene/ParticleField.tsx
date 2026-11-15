'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGridField } from '@/hooks/useGridField';
import { latLonToVec3 } from '@/lib/geo';
import { bilinearSample } from '@/lib/sampling';
import { createSeededRng } from '@/lib/noise';

export function ParticleField() {
  const { invalidate } = useThree();
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const timeIso = useExplorerStore((s) => s.timeIso);
  const quality = useExplorerStore((s) => s.quality);

  const isVectorLayer = activeLayer === 'wind' || activeLayer === 'currents';
  const isVisible = particlesOn && isVectorLayer;

  const { data: gridField } = useGridField(activeLayer, timeIso);
  const particleCount = quality === 'high' ? 7000 : 3500;

  const stateRef = useRef<{
    lats: Float32Array;
    lons: Float32Array;
    ages: Float32Array;
    maxAges: Float32Array;
  } | null>(null);

  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, positions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const lats = new Float32Array(particleCount);
    const lons = new Float32Array(particleCount);
    const ages = new Float32Array(particleCount);
    const maxAges = new Float32Array(particleCount);
    const rng = createSeededRng(2026);

    const isWind = activeLayer === 'wind';

    for (let i = 0; i < particleCount; i++) {
      lats[i] = (rng() - 0.5) * 160;
      lons[i] = (rng() - 0.5) * 360;
      ages[i] = rng() * 100;
      maxAges[i] = 50 + rng() * 70;

      const v = latLonToVec3(lats[i], lons[i], 1.012);
      pos[i * 3 + 0] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      // Vivid cyan for wind, emerald for ocean currents
      if (isWind) {
        col[i * 3 + 0] = 0.22;
        col[i * 3 + 1] = 0.74;
        col[i * 3 + 2] = 0.97;
      } else {
        col[i * 3 + 0] = 0.06;
        col[i * 3 + 1] = 0.65;
        col[i * 3 + 2] = 0.91;
      }
    }

    stateRef.current = { lats, lons, ages, maxAges };

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return { geometry: geom, positions: pos, colors: col };
  }, [particleCount, activeLayer]);

  useFrame((_, delta) => {
    if (!isVisible || !gridField?.u || !gridField?.v || !stateRef.current) return;

    const { lats, lons, ages, maxAges } = stateRef.current;
    const { W, H, u, v } = gridField;
    const dt = Math.min(delta, 0.08);
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

    const rng = Math.random;

    for (let i = 0; i < particleCount; i++) {
      ages[i] += 1;

      if (ages[i] >= maxAges[i] || Math.abs(lats[i]) > 84) {
        lats[i] = (rng() - 0.5) * 155;
        lons[i] = (rng() - 0.5) * 360;
        ages[i] = 0;
      }

      const curLat = lats[i];
      const curLon = lons[i];

      const u1 = bilinearSample(u, W, H, curLat, curLon);
      const v1 = bilinearSample(v, W, H, curLat, curLon);

      if (!Number.isFinite(u1) || !Number.isFinite(v1)) {
        ages[i] = maxAges[i];
        continue;
      }

      const cosLat1 = Math.max(0.12, Math.cos((curLat * Math.PI) / 180));
      const midLat = curLat + ((v1 * dt * 0.5) / 111320) * (180 / Math.PI);
      const midLon = curLon + ((u1 * dt * 0.5) / (111320 * cosLat1)) * (180 / Math.PI);

      const u2 = bilinearSample(u, W, H, midLat, midLon);
      const v2 = bilinearSample(v, W, H, midLat, midLon);
      const effU = Number.isFinite(u2) ? u2 : u1;
      const effV = Number.isFinite(v2) ? v2 : v1;

      const cosLatMid = Math.max(0.12, Math.cos((midLat * Math.PI) / 180));
      const nextLat = curLat + ((effV * dt) / 111320) * (180 / Math.PI);
      let nextLon = curLon + ((effU * dt) / (111320 * cosLatMid)) * (180 / Math.PI);

      if (nextLon < -180) nextLon += 360;
      if (nextLon > 180) nextLon -= 360;

      lats[i] = nextLat;
      lons[i] = nextLon;

      const vec = latLonToVec3(nextLat, nextLon, 1.012);
      positions[i * 3 + 0] = vec.x;
      positions[i * 3 + 1] = vec.y;
      positions[i * 3 + 2] = vec.z;
    }

    posAttr.needsUpdate = true;
    invalidate();
  });

  if (!isVisible) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={2.2}
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
