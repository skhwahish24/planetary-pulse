'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGridField } from '@/hooks/useGridField';
import { LAYER_REGISTRY } from '@/lib/layers';
import { buildLutTexture } from '@/lib/colormap';
import type { GridField } from '@/types/data';

/** Builds a HalfFloat DataTexture from a GridField scalar buffer. */
function buildHalfFloatDataTexture(field: GridField): THREE.DataTexture {
  const { W, H, scalar } = field;
  const count = W * H;
  const halfArray = new Uint16Array(count);

  for (let i = 0; i < count; i++) {
    const val = scalar[i];
    halfArray[i] = THREE.DataUtils.toHalfFloat(Number.isFinite(val) ? val : 0);
  }

  const texture = new THREE.DataTexture(
    halfArray,
    W,
    H,
    THREE.RedFormat,
    THREE.HalfFloatType
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/** Builds an 8-bit mask DataTexture from a GridField mask buffer. */
function buildMaskDataTexture(field: GridField): THREE.DataTexture {
  const { W, H, mask } = field;
  const texture = new THREE.DataTexture(
    mask,
    W,
    H,
    THREE.RedFormat,
    THREE.UnsignedByteType
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function LayerManager() {
  const { invalidate } = useThree();
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const timeIso = useExplorerStore((s) => s.timeIso);

  const { data: gridField } = useGridField(activeLayer, timeIso);

  const currentSlotRef = useRef<'A' | 'B'>('A');
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gridField) return;

    // Cache the CPU-side scalar array globally for zero-GPU-overhead hover sampling
    (window as unknown as { __activeGridField?: GridField }).__activeGridField = gridField;

    const layerDef = LAYER_REGISTRY[gridField.layerId as keyof typeof LAYER_REGISTRY] ||
      LAYER_REGISTRY['temperature'];

    const dataTexture = buildHalfFloatDataTexture(gridField);
    const maskTexture = buildMaskDataTexture(gridField);
    const lutTexture = buildLutTexture(layerDef.rampTokens);

    const idleSlot = currentSlotRef.current === 'A' ? 'B' : 'A';

    window.dispatchEvent(
      new CustomEvent('globe:setLayerSlot', {
        detail: {
          slot: idleSlot,
          dataTexture,
          maskTexture,
          lutTexture,
          range: layerDef.range,
        },
      })
    );

    // Cross-fade animation over 400ms
    const startTime = performance.now();
    const duration = 400;
    const startMix = idleSlot === 'B' ? 0.0 : 1.0;
    const endMix = idleSlot === 'B' ? 1.0 : 0.0;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const animateTransition = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1.0, elapsed / duration);
      const eased = t * (2 - t);
      const currentMix = startMix + (endMix - startMix) * eased;

      window.dispatchEvent(
        new CustomEvent('globe:setMix', { detail: { mix: currentMix } })
      );
      invalidate();

      if (t < 1.0) {
        animFrameRef.current = requestAnimationFrame(animateTransition);
      } else {
        currentSlotRef.current = idleSlot;
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animateTransition);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gridField, invalidate]);

  return null;
}
