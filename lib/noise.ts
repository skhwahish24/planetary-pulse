/** Seeded 32-bit pseudo-random number generator (Mulberry32). */
export function createSeededRng(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cubic smoothstep function. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Linear interpolation. */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/** Hash function mapping integer 2D lattice points to a [-1, 1] scalar. */
function hash2D(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1442695040888963407);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) & 0x7fffffff) / 0x3fffffff - 1;
}

/** 2D Value Noise with smoothstep interpolation. */
export function valueNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const v00 = hash2D(ix, iy, seed);
  const v10 = hash2D(ix + 1, iy, seed);
  const v01 = hash2D(ix, iy + 1, seed);
  const v11 = hash2D(ix + 1, iy + 1, seed);

  const sx = smoothstep(fx);
  const sy = smoothstep(fy);

  const top = lerp(v00, v10, sx);
  const bot = lerp(v01, v11, sx);
  return lerp(top, bot, sy);
}

/** Fractal Brownian Motion (fBm) synthesized from multiple noise octaves. */
export function fbm(
  x: number,
  y: number,
  octaves = 4,
  seed = 42
): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise2D(x * frequency, y * frequency, seed + i * 101);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return norm > 0 ? value / norm : 0;
}
