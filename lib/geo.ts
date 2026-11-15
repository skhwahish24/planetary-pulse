import * as THREE from 'three';

const DEG = Math.PI / 180;

/** Converts geographic coordinates to a 3D Cartesian vector on the globe. */
export function latLonToVec3(lat: number, lon: number, R = 1): THREE.Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi),
    R * Math.sin(phi) * Math.sin(theta)
  );
}

/** Converts a 3D vector back to geographic coordinates (lat [-90,90], lon [-180,180]). */
export function vec3ToLatLon(v: THREE.Vector3): { lat: number; lon: number } {
  const R = v.length();
  if (R === 0) return { lat: 0, lon: 0 };
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, v.y / R))) / DEG;
  let lon = Math.atan2(v.z, -v.x) / DEG - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

/** Haversine great-circle distance in meters between two lat/lon coordinates. */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * DEG;
  const dLon = (lon2 - lon1) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Spherical linear interpolation between two unit direction vectors. */
export function slerpVec3(
  a: THREE.Vector3,
  b: THREE.Vector3,
  t: number
): THREE.Vector3 {
  const v1 = a.clone().normalize();
  const v2 = b.clone().normalize();
  const dot = Math.max(-1, Math.min(1, v1.dot(v2)));

  if (dot > 0.9995) {
    return v1.lerp(v2, t).normalize();
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinTheta;
  const w2 = Math.sin(t * theta) / sinTheta;

  return v1.multiplyScalar(w1).add(v2.multiplyScalar(w2)).normalize();
}

/** Clamps a number to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
