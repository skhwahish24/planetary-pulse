import * as THREE from 'three';

/** Reads a CSS variable by name from documentElement. */
export function getComputedToken(tokenName: string, fallback = '#888888'): string {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
  return val || fallback;
}

/** Parses a CSS color value into a THREE.Color instance. */
export function tokenToColor(tokenName: string, fallback = '#888888'): THREE.Color {
  const cssValue = getComputedToken(tokenName, fallback);
  try {
    return new THREE.Color(cssValue);
  } catch {
    return new THREE.Color(fallback);
  }
}

/**
 * Builds a 256x1 RGBA DataTexture lookup table by interpolating color stops
 * defined by CSS token names.
 */
export function buildLutTexture(tokenNames: string[]): THREE.DataTexture {
  const width = 256;
  const data = new Uint8Array(width * 4);

  const colors = tokenNames.map((name) => tokenToColor(name));
  const count = colors.length;

  for (let i = 0; i < width; i++) {
    const t = i / (width - 1);
    let r = 0.5;
    let g = 0.5;
    let b = 0.5;

    if (count === 1) {
      r = colors[0].r;
      g = colors[0].g;
      b = colors[0].b;
    } else {
      const scaled = t * (count - 1);
      const idx = Math.min(Math.floor(scaled), count - 2);
      const frac = scaled - idx;
      const c1 = colors[idx];
      const c2 = colors[idx + 1];

      r = c1.r + (c2.r - c1.r) * frac;
      g = c1.g + (c2.g - c1.g) * frac;
      b = c1.b + (c2.b - c1.b) * frac;
    }

    const offset = i * 4;
    data[offset] = Math.round(Math.max(0, Math.min(1, r)) * 255);
    data[offset + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
    data[offset + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
    data[offset + 3] = 255;
  }

  const texture = new THREE.DataTexture(
    data,
    width,
    1,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/** Reads global scene tokens: space background, atmosphere rim, probe ring. */
export function getSceneTokens(): {
  spaceBg: THREE.Color;
  atmosphereRim: THREE.Color;
  probeRing: THREE.Color;
} {
  return {
    spaceBg: tokenToColor('--space-bg', '#030303'),
    atmosphereRim: tokenToColor('--atmosphere-rim', '#c8c8c8'),
    probeRing: tokenToColor('--probe-ring', '#f0f0f0'),
  };
}

/** Observes theme changes and triggers a callback to rebuild dynamic textures. */
export function observeThemeChanges(onThemeChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const observer = new MutationObserver(() => {
    onThemeChange();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'style'],
  });

  return () => observer.disconnect();
}
