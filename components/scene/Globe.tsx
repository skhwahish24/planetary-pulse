'use client';

import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { useExplorerStore } from '@/store/useExplorerStore';

const GLOBE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const GLOBE_FRAGMENT = /* glsl */ `
  uniform sampler2D uAlbedo;
  uniform sampler2D uNormalMap;
  uniform sampler2D uSpecularMap;
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
  uniform vec3 uSunDirection;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;

  void main() {
    // Wrap-safe UV coordinate for seamless antimeridian sampling
    vec2 safeUv = vec2(fract(vUv.x), clamp(vUv.y, 0.001, 0.999));

    // Base satellite Earth texture
    vec4 albedo = texture2D(uAlbedo, safeUv);
    float oceanSpec = texture2D(uSpecularMap, safeUv).r;

    // Solar lighting with realistic day-to-night terminator
    vec3 lightDir = normalize(uSunDirection);
    float nDotL = dot(vNormal, lightDir);
    
    // Day illumination with smooth terminator falloff
    float dayFactor = smoothstep(-0.15, 0.25, nDotL);
    float diffuse = clamp(nDotL * 0.75 + 0.25, 0.08, 1.0);

    // Specular ocean reflection in direct sunlight
    vec3 halfVector = normalize(lightDir + vViewDir);
    float spec = pow(max(dot(vNormal, halfVector), 0.0), 32.0) * oceanSpec * 0.65 * dayFactor;

    // Realistic night hemisphere city lights (warm amber glow on landmasses in darkness)
    float nightFactor = 1.0 - dayFactor;
    float isLand = 1.0 - oceanSpec;
    // Generate organic night light distribution based on land albedo patterns
    float cityLights = pow(albedo.r * 1.4, 3.0) * isLand * nightFactor;
    vec3 nightColor = vec3(1.0, 0.82, 0.45) * cityLights * 1.2;

    vec3 surfaceColor = (albedo.rgb * diffuse + vec3(spec)) * dayFactor + nightColor + (albedo.rgb * 0.06 * nightFactor);

    // Sample data layers with bilinear half-float texture lookup
    float maskA = texture2D(uMaskA, safeUv).r;
    float rawA = texture2D(uLayerA, safeUv).r;
    float normA = clamp((rawA - uRangeA.x) / max(0.001, uRangeA.y - uRangeA.x), 0.0, 1.0);
    vec4 colorA = texture2D(uLutA, vec2(normA, 0.5));

    float maskB = texture2D(uMaskB, safeUv).r;
    float rawB = texture2D(uLayerB, safeUv).r;
    float normB = clamp((rawB - uRangeB.x) / max(0.001, uRangeB.y - uRangeB.x), 0.0, 1.0);
    vec4 colorB = texture2D(uLutB, vec2(normB, 0.5));

    // Smooth data layer blend over Earth surface
    vec3 dataRgb = mix(colorA.rgb, colorB.rgb, uMix);
    float activeMask = mix(maskA, maskB, uMix);

    if (activeMask > 0.4) {
      surfaceColor = mix(surfaceColor, dataRgb, uOpacity);
    }

    gl_FragColor = vec4(surfaceColor, 1.0);
  }
`;

export function Globe() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useExplorerStore((s) => s.quality);
  const segments = quality === 'high' ? 128 : 64;

  // Load official satellite textures
  const [albedoTex, normalTex, specTex] = useLoader(THREE.TextureLoader, [
    '/textures/earth-blue-marble.jpg',
    '/textures/earth_normal_2048.jpg',
    '/textures/earth_specular_2048.jpg',
  ]);

  useMemo(() => {
    [albedoTex, normalTex, specTex].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.anisotropy = 8;
    });
  }, [albedoTex, normalTex, specTex]);

  const defaultTex = useMemo(() => {
    const t = new THREE.DataTexture(
      new Uint16Array([THREE.DataUtils.toHalfFloat(0)]),
      1,
      1,
      THREE.RedFormat,
      THREE.HalfFloatType
    );
    t.needsUpdate = true;
    return t;
  }, []);

  const defaultMask = useMemo(() => {
    const t = new THREE.DataTexture(
      new Uint8Array([255]),
      1,
      1,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    t.needsUpdate = true;
    return t;
  }, []);

  const defaultLut = useMemo(() => {
    const t = new THREE.DataTexture(
      new Uint8Array([14, 165, 233, 255]),
      1,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    t.needsUpdate = true;
    return t;
  }, []);

  const uniforms = useMemo(() => {
    return {
      uAlbedo: { value: albedoTex },
      uNormalMap: { value: normalTex },
      uSpecularMap: { value: specTex },
      uLayerA: { value: defaultTex },
      uLayerB: { value: defaultTex },
      uMaskA: { value: defaultMask },
      uMaskB: { value: defaultMask },
      uLutA: { value: defaultLut },
      uLutB: { value: defaultLut },
      uRangeA: { value: new THREE.Vector2(-50, 50) },
      uRangeB: { value: new THREE.Vector2(-50, 50) },
      uMix: { value: 0 },
      uOpacity: { value: 0.72 },
      uSunDirection: { value: new THREE.Vector3(4.5, 2.0, 3.5).normalize() },
    };
  }, [albedoTex, normalTex, specTex, defaultTex, defaultMask, defaultLut]);

  useEffect(() => {
    const handleSetSlot = (e: Event) => {
      const { slot, dataTexture, maskTexture, lutTexture, range } = (
        e as CustomEvent<{
          slot: 'A' | 'B';
          dataTexture: THREE.DataTexture;
          maskTexture: THREE.DataTexture;
          lutTexture: THREE.DataTexture;
          range: [number, number];
        }>
      ).detail;

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
      const { mix } = (e as CustomEvent<{ mix: number }>).detail;
      if (materialRef.current) {
        materialRef.current.uniforms['uMix'].value = mix;
      }
    };

    const handleWireframe = (e: Event) => {
      const { wireframe } = (e as CustomEvent<{ wireframe: boolean }>).detail;
      if (materialRef.current) {
        materialRef.current.wireframe = wireframe;
      }
    };

    window.addEventListener('globe:setLayerSlot', handleSetSlot);
    window.addEventListener('globe:setMix', handleSetMix);
    window.addEventListener('globe:debugWireframe', handleWireframe);

    return () => {
      window.removeEventListener('globe:setLayerSlot', handleSetSlot);
      window.removeEventListener('globe:setMix', handleSetMix);
      window.removeEventListener('globe:debugWireframe', handleWireframe);
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
