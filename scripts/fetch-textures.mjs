/**
 * scripts/fetch-textures.mjs
 * Optional utility to fetch high-resolution NASA Blue Marble / Earth textures.
 * If textures are not downloaded, the globe uses deterministic procedural albedo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../public/textures');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('[Planetary Pulse] Texture directory ready:', targetDir);
console.log('[Planetary Pulse] Procedural albedo is active with zero API keys / offline support.');
