'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExplorerStore } from '@/store/useExplorerStore';
import { vec3ToLatLon } from '@/lib/geo';

export function PointerPicker() {
  const { camera, gl, invalidate } = useThree();
  const setProbe = useExplorerStore((s) => s.setProbe);

  const pointerDownPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const hoverRaf = useRef<number | null>(null);

  /** Solves ray-sphere intersection analytically for unit sphere centered at origin. */
  const intersectAnalyticSphere = useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

      const ray = new THREE.Ray();
      ray.origin.setFromMatrixPosition(camera.matrixWorld);
      const target = new THREE.Vector3(ndcX, ndcY, 0.5)
        .unproject(camera)
        .sub(ray.origin)
        .normalize();
      ray.direction.copy(target);

      // |origin + t * dir|^2 = 1.0^2
      const a = ray.direction.dot(ray.direction);
      const b = 2.0 * ray.origin.dot(ray.direction);
      const c = ray.origin.dot(ray.origin) - 1.0;
      const discriminant = b * b - 4.0 * a * c;

      if (discriminant < 0) return null;

      const sqrtDisc = Math.sqrt(discriminant);
      const t0 = (-b - sqrtDisc) / (2.0 * a);
      const t1 = (-b + sqrtDisc) / (2.0 * a);
      const t = t0 > 0 ? t0 : t1 > 0 ? t1 : null;

      if (t === null) return null;
      return ray.origin.clone().addScaledVector(ray.direction, t);
    },
    [camera, gl.domElement]
  );

  useEffect(() => {
    const el = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos.current = {
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
      };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!pointerDownPos.current) return;
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      const distancePx = Math.sqrt(dx * dx + dy * dy);
      const durationMs = performance.now() - pointerDownPos.current.time;

      if (distancePx < 4 && durationMs < 250) {
        const hit = intersectAnalyticSphere(e.clientX, e.clientY);
        if (hit) {
          const { lat, lon } = vec3ToLatLon(hit);
          setProbe({ lat, lon });
          invalidate();
        }
      }
      pointerDownPos.current = null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (hoverRaf.current !== null) return;
      hoverRaf.current = requestAnimationFrame(() => {
        hoverRaf.current = null;
        const hit = intersectAnalyticSphere(e.clientX, e.clientY);
        if (hit) {
          const { lat, lon } = vec3ToLatLon(hit);
          window.dispatchEvent(
            new CustomEvent('globe:hover', {
              detail: { lat, lon, hit: true },
            })
          );
        } else {
          window.dispatchEvent(
            new CustomEvent('globe:hover', {
              detail: { hit: false },
            })
          );
        }
      });
    };

    const handlePointerLeave = () => {
      window.dispatchEvent(
        new CustomEvent('globe:hover', {
          detail: { hit: false },
        })
      );
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      if (hoverRaf.current !== null) cancelAnimationFrame(hoverRaf.current);
    };
  }, [gl.domElement, intersectAnalyticSphere, setProbe, invalidate]);

  return null;
}
