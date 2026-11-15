https://github.com/skhwahish24/planetary-pulse.git'use client';

import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useExplorerStore } from '@/store/useExplorerStore';
import { fbm } from '@/lib/noise';

const GLOBE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const GLOBE_FRAGMENT = /* glsl */ `
  uniform sampler2D uAlbedo;
  uniform sampler2D uLayerA;
  uniform sampler2D uLayerB;
  uniform sampler2D uMaskA;
  uniform sampler2D uMaskB;
  uniform sampler2D uLutA;
  uniform sampler2D uLutB;
  uniform vec2 uRangeA;
  uniform vec2 uRangeB;
  uniform float uMix;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 lightDir = normalize(vec3(3.0, 2.0, 3.5));
    float diff = max(dot(vNormal, lightDir), 0.05);
    vec4 baseAlbedo = texture2D(uAlbedo, vUv);
    vec3 surfaceColor = baseAlbedo.rgb * (diff * 0.8 + 0.2);

    // Layer A sample
    float maskA = texture2D(uMaskA, vUv).r;
    float rawValA = texture2D(uLayerA, vUv).r;
    float normA = clamp((rawValA - uRangeA.x) / max(0.0001, uRangeA.y - uRangeA.x), 0.0, 1.0);
    vec4 colorA = texture2D(uLutA, vec2(normA, 0.5));

    // Layer B sample
    float maskB = texture2D(uMaskB, vUv).r;
    float rawValB = texture2D(uLayerB, vUv).r;
    float normB = clamp((rawValB - uRangeB.x) / max(0.0001, uRangeB.y - uRangeB.x), 0.0, 1.0);
    vec4 colorB = texture2D(uLutB, vec2(normB, 0.5));

    // Resolve active layer color with smooth cross-fade
    vec3 layerRgb = mix(colorA.rgb, colorB.rgb, uMix);
    float activeMask = mix(maskA, maskB, uMix);

    if (activeMask > 0.5) {
      surfaceColor = mix(surfaceColor, layerRgb, uOpacity);
    }

    gl_FragColor = vec4(surfaceColor, 1.0);
  }
`;

/** Generates an offline high-detail Earth albedo texture. */
function createProceduralEarthAlbedo(): THREE.DataTexture {
  const width = 1024;
  const height = 512;
  const data = new Uint8Array(width * height * 4);

  for (let j = 0; j < height; j++) {
    const lat = 90 - (j / (height - 1)) * 180;
    const absLat = Math.abs(lat);

    for (let i = 0; i < width; i++) {
      const lon = -180 + (i / width) * 360;
      const continent = fbm(lon / 55 + 2.5, lat / 40 + 1.2, 5, 108);
      const isLand = continent > 0.08 && absLat < 78;

      let r = 10;
      let g = 25;
      let b = 48; // Deep oceanic blue-gray

      if (absLat > 72) {
        // Polar ice caps
        r = 215;
        g = 220;
        b = 225;
      } else if (isLand) {
        // Continental landmasses with biome shading
        if (absLat < 20 && Math.abs(lon) < 50) {
          // Equatorial rainforests
          r = 38;
          g = 58;
          b = 32;
        } else if (continent > 0.25 || (lat > 15 && lat < 35 && lon > -10 && lon < 60)) {
          // Arid deserts & plateaus
          r = 110;
          g = 95;
          b = 70;
        } else {
          // Temperate plains & forests
          r = 50;
          g = 68;
          b = 45;
        }
      }

      const offset = (j * width + i) * 4;
      data[offset + 0] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function Globe() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useExplorerStore((s) => s.quality);
  const segments = quality === 'high' ? 96 : 64;

  const albedoTexture = useMemo(() => createProceduralEarthAlbedo(), []);

  const dummyFloatTexture = useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint16Array([THREE.DataUtils.toHalfFloat(0)]),
      1,
      1,
      THREE.RedFormat,
      THREE.HalfFloatType
    );
    tex.needsUpdate = true;
    return tex;
  }, []);

  const dummyMaskTexture = useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint8Array([255]),
      1,
      1,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    tex.needsUpdate = true;
    return tex;
  }, []);

  const dummyLutTexture = useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint8Array([128, 128, 128, 255]),
      1,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    tex.needsUpdate = true;
    return tex;
  }, []);

  const uniforms = useMemo(() => {
    return {
      uAlbedo: { value: albedoTexture },
      uLayerA: { value: dummyFloatTexture },
      uLayerB: { value: dummyFloatTexture },
      uMaskA: { value: dummyMaskTexture },
      uMaskB: { value: dummyMaskTexture },
      uLutA: { value: dummyLutTexture },
      uLutB: { value: dummyLutTexture },
      uRangeA: { value: new THREE.Vector2(0, 1) },
      uRangeB: { value: new THREE.Vector2(0, 1) },
      uMix: { value: 0 },
      uOpacity: { value: 0.8 },
    };
  }, [albedoTexture, dummyFloatTexture, dummyMaskTexture, dummyLutTexture]);

  useEffect(() => {
    const handleSetLayerSlot = (e: Event) => {
      const customEvent = e as CustomEvent<{
        slot: 'A' | 'B';
        dataTexture: THREE.DataTexture;
        maskTexture: THREE.DataTexture;
        lutTexture: THREE.DataTexture;
        range: [number, number];
      }>;
      const { slot, dataTexture, maskTexture, lutTexture, range } = customEvent.detail;
      if (!materialRef.current) return;

      const u = materialRef.current.uniforms;
      if (slot === 'A') {
        u['uLayerA'].value = dataTexture;
        u['uMaskA'].value = maskTexture;
        u['uLutA'].value = lutTexture;
        u['uRangeA'].value.set(range[0], range[1]);
      } else {
        u['uLayerB'].value = dataTexture;
        u['uMaskB'].value = maskTexture;
        u['uLutB'].value = lutTexture;
        u['uRangeB'].value.set(range[0], range[1]);
      }
    };

    const handleSetMix = (e: Event) => {
      const customEvent = e as CustomEvent<{ mix: number }>;
      if (materialRef.current) {
        materialRef.current.uniforms['uMix'].value = customEvent.detail.mix;
      }
    };

    window.addEventListener('globe:setLayerSlot', handleSetLayerSlot);
    window.addEventListener('globe:setMix', handleSetMix);

    return () => {
      window.removeEventListener('globe:setLayerSlot', handleSetLayerSlot);
      window.removeEventListener('globe:setMix', handleSetMix);
    };
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[1, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={GLOBE_VERTEX}
        fragmentShader={GLOBE_FRAGMENT}
        uniforms={uniforms}
      />
    </mesh>
  );
}