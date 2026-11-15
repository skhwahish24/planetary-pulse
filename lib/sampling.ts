/** Bilinear sampling of a W x H equirectangular scalar grid with longitude wrap. */
export function bilinearSample(
  grid: Float32Array,
  W: number,
  H: number,
  lat: number,
  lon: number
): number {
  let normalizedLon = lon;
  while (normalizedLon < -180) normalizedLon += 360;
  while (normalizedLon >= 180) normalizedLon -= 360;
  const clampedLat = Math.max(-90, Math.min(90, lat));

  const u = ((normalizedLon + 180) / 360) * W;
  const v = ((90 - clampedLat) / 180) * (H - 1);

  const i0 = (Math.floor(u) % W + W) % W;
  const i1 = (i0 + 1) % W;
  const j0 = Math.max(0, Math.min(H - 2, Math.floor(v)));
  const j1 = j0 + 1;

  const tx = u - Math.floor(u);
  const ty = v - j0;

  const v00 = grid[j0 * W + i0];
  const v10 = grid[j0 * W + i1];
  const v01 = grid[j1 * W + i0];
  const v11 = grid[j1 * W + i1];

  const neighbors = [
    { val: v00, weight: (1 - tx) * (1 - ty) },
    { val: v10, weight: tx * (1 - ty) },
    { val: v01, weight: (1 - tx) * ty },
    { val: v11, weight: tx * ty },
  ];

  const valid = neighbors.filter((n) => Number.isFinite(n.val));
  if (valid.length === 0) return NaN;
  if (valid.length < 4) {
    valid.sort((a, b) => b.weight - a.weight);
    return valid[0].val;
  }

  return (
    v00 * (1 - tx) * (1 - ty) +
    v10 * tx * (1 - ty) +
    v01 * (1 - tx) * ty +
    v11 * tx * ty
  );
}

/** Inverse-Distance Weighting (IDW) interpolation from sparse point samples. */
export function idwInterpolate(
  points: { lat: number; lon: number; value: number }[],
  targetLat: number,
  targetLon: number,
  maxDistanceM = 1_000_000,
  power = 2
): number {
  const eps = 1e-4;
  let weightSum = 0;
  let valueSum = 0;

  const DEG = Math.PI / 180;
  const R = 6_371_000;

  for (const p of points) {
    const dLat = (p.lat - targetLat) * DEG;
    const dLon = (p.lon - targetLon) * DEG;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(targetLat * DEG) * Math.cos(p.lat * DEG) * Math.sin(dLon / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (dist > maxDistanceM) continue;

    const w = 1 / (dist + eps) ** power;
    weightSum += w;
    valueSum += w * p.value;
  }

  return weightSum === 0 ? NaN : valueSum / weightSum;
}
