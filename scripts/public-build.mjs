import fs from 'node:fs/promises';
import path from 'node:path';

const selectionAsset = /^assets\/my-selections\/[a-f0-9]{12}\/[\w-]+\.(?:mjs|js|css)$/;
const bundledAsset = /^assets\/index-[\w-]+\.(?:js|css)$/;
const noContactGate = /^(?:404\.html|admin\.html|travel-planner\/index\.html|(?:zh\/|en\/)?travel-safety\.html)$/;

export async function preservePublishedAssets(root, dist) {
  const files = JSON.parse(await fs.readFile(path.join(root, 'public-release-manifest.json'), 'utf8'));
  for (const name of files) {
    const source = path.join(root, name), target = path.join(dist, name);
    // Historical content-addressed URLs must keep the exact already-published bytes.
    if (!selectionAsset.test(name)) {
      try { await fs.access(target); continue; } catch {}
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }
}

export async function finalizePublicRelease(root, dist) {
  const manifestPath = path.join(root, 'public-release-manifest.json');
  const files = new Set(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
  async function scan(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { await scan(file); continue; }
      const name = path.relative(dist, file).split(path.sep).join('/');
      // Extend the curated allowlist only for known frontend build outputs.
      if (selectionAsset.test(name) || bundledAsset.test(name)) files.add(name);
    }
  }
  await scan(path.join(dist, 'assets'));
  for (const name of files) {
    if (!name.endsWith('.html') || noContactGate.test(name)) continue;
    let html = await fs.readFile(path.join(dist, name), 'utf8');
    if (!html.includes('/assets/contact-gate.js')) {
      html = html.replace('</body>', '<script src="/assets/contact-gate.js"></script></body>');
    }
    if (!html.includes('/assets/contact-modal.css')) {
      html = html.replace('</head>', '<link rel="stylesheet" href="/assets/contact-modal.css"></head>');
    }
    await fs.writeFile(path.join(dist, name), html);
    await fs.writeFile(path.join(root, name), html);
  }
  await fs.writeFile(manifestPath, JSON.stringify([...files].sort(), null, 2) + '\n');
  console.log(`Retained published assets and contact notices; ${files.size} allowlisted release files.`);
}
