'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

/** Atmospheric scattering rim shader (Rayleigh blue envelope). */
const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // Smooth fresnel rim intensity falloff
    float intensity = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.8);
    // Authentic atmospheric cyan-blue Rayleigh tone
    vec3 atmosphereColor = vec3(0.24, 0.58, 0.95);
    gl_FragColor = vec4(atmosphereColor, intensity * 0.75);
  }
`;

function EarthMesh() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load official high-resolution satellite imagery textures
  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-blue-marble.jpg',
    '/textures/earth_normal_2048.jpg',
    '/textures/earth_specular_2048.jpg',
    '/textures/earth-clouds.png',
  ]);

  useMemo(() => {
    [colorMap, normalMap, specularMap, cloudsMap].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [colorMap, normalMap, specularMap, cloudsMap]);

  // Subtle continuous rotation for dynamic realism
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
    if (cloudsRef.current) {
      // Clouds drift slightly faster than the surface for atmospheric realism
      cloudsRef.current.rotation.y += delta * 0.019;
    }
  });

  return (
    <group>
      {/* 1. Base Earth Sphere with Satellite Map, Surface Relief & Specular Oceans */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughnessMap={specularMap}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Realistic Drifting Cloud Layer */}
      <mesh ref={cloudsRef} scale={[1.008, 1.008, 1.008]}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.82}
          blending={THREE.NormalBlending}
          depthWrite={false}
          roughness={1.0}
        />
      </mesh>

      {/* 3. Outer Atmospheric Rim Glow */}
      <mesh scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export function PhotorealisticEarth() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <EarthCanvas />
    </div>
  );
}

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function EarthCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.7], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ width: '100%', height: '100%', background: '#000000' }}
    >
      {/* Deep Space Black Clear Color */}
      <color attach="background" args={['#000000']} />

      {/* Realistic Sunlight Directional Vector */}
      <directionalLight position={[5, 2.5, 4]} intensity={2.4} color="#ffffff" />
      {/* Subtle Space Ambient Illumination for Silhouette Contrast */}
      <ambientLight intensity={0.06} color="#406080" />

      <Suspense fallback={null}>
        <EarthMesh />
      </Suspense>

      {/* Smooth OrbitControls: Drag to rotate, wheel to zoom, centered */}
      <OrbitControls
        enablePan={false}
        enableRotate={true}
        enableZoom={true}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={1.25}
        maxDistance={6.0}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
