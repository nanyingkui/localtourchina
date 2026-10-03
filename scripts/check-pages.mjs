import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['index.html', 'travel-info.html', 'private-tour.html', 'tickets.html', 'day-tours.html', 'local-guide.html', 'vehicles.html', 'multi-booking.html', 'company.html'];
const koreanNames=[...names,'reviews.html','booking.html','food-map.html','online-guide.html'];
const pages = [...new Set([...koreanNames,'inquiry-status.html','en/inquiry-status.html','admin.html', ...names.map(name => `en/${name}`), ...koreanNames.map(name => `zh/${name}`)])];

for (const page of pages) {
  const html = await readFile(path.join(root, page), 'utf8');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  scripts.forEach(({ 1: code }) => new Function(code));
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) throw new Error(`${page}: duplicate IDs: ${duplicateIds.join(', ')}`);
  const assets = [...html.matchAll(/(?:src|href)="((?:\.\.\/)?assets\/[^"]+)"/g)].map(match => match[1]);
  for (const asset of assets) await access(path.resolve(path.dirname(path.join(root, page)), asset.split(/[?#]/)[0]));
  console.log(`${page}: ok`);
}
