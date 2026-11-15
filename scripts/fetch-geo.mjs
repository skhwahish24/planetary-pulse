import { copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '../node_modules/world-atlas/countries-50m.json');
const dest = join(__dirname, '../public/geo/countries-50m.json');

try {
  mkdirSync(join(__dirname, '../public/geo'), { recursive: true });
  copyFileSync(src, dest);
  console.log('Geo assets successfully copied to public/geo/countries-50m.json');
} catch (err) {
  console.error('Failed to copy geo assets:', err);
  process.exit(1);
}
