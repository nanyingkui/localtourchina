import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preservePublishedAssets, finalizePublicRelease, copyPublicTree } from './public-build.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontend = path.join(root, 'redesign');
const dist = path.join(frontend, 'dist/client');
const run = (script, cwd, args = []) => execFileSync(process.execPath, [script, ...args], {
  cwd, stdio: 'inherit', env: { ...process.env, VITE_LTC_MODE: 'production' },
});
const python = script => execFileSync(process.env.PYTHON || 'python3', [script], { cwd: root, stdio: 'inherit' });

python('scripts/export-catalog.py');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'catalog-site/catalog.json'), 'utf8'));
await fs.writeFile(path.join(frontend, 'src/catalog-transfer-rates.mjs'),
  '// Generated from the reviewed public catalogue.\nexport const RATES=' + JSON.stringify(catalog.vehicles.pricing.furong_transfer?.rates || {}) + ';\n');
run('scripts/build-pages.mjs', root);
run('scripts/seo-service-content.mjs', root);
run('scripts/sync-legacy.mjs', frontend, [root]);
run('scripts/build-shop-products.mjs', frontend);
run('scripts/build-flights.mjs', frontend, [root]);
run('scripts/build-reviews.mjs', root);
run('scripts/apply-brand-system.mjs', root);
run('scripts/apply-journal-theme.mjs', frontend);
run('scripts/apply-visual-system.mjs', frontend);
run('scripts/apply-my-selections.mjs', frontend);
run('scripts/build-traveler.mjs', frontend);
run('node_modules/vite/bin/vite.js', frontend, ['build']);
await copyPublicTree(path.join(frontend, 'public'), dist);
run('scripts/prerender.mjs', frontend);
run('scripts/prepare-sites-build.mjs', frontend);
await preservePublishedAssets(root, dist);
await copyPublicTree(dist, root);
python('scripts/build-reviewed-catalog.py');
run('scripts/build-notebook.mjs', root);
run('scripts/build-brand-upgrade.mjs', root);
await finalizePublicRelease(root, dist);
console.log('Public pages generated; quotes and protected administration use the existing runtime.');

