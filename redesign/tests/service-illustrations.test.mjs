import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import { decorateServiceIllustrationHtml } from '../scripts/service-illustrations.mjs';

const read = path => fs.readFile(new URL('../' + path, import.meta.url), 'utf8');
const labels = { ko: 'AI 브랜드 일러스트', zh: 'AI 品牌插画', en: 'AI brand illustration' };
const routes = ['private-tour.html', 'vehicles.html'];
for (const [lang, label] of Object.entries(labels)) for (const filename of routes) {
  const locale = lang === 'ko' ? '' : lang;
  const planning = filename === 'private-tour.html';
  test(`${lang} ${filename}: one labelled service hero, responsive artwork and existing first action`, async () => {
    const html = await read(`public/${locale ? locale + '/' : ''}${filename}`);
    assert.equal((html.match(/data-brand-illustration="/g) || []).length, 1);
    assert.equal((html.match(/class="service-illustration-art"/g) || []).length, 1);
    assert.match(html, new RegExp(`<figcaption>${label}</figcaption>`));
    assert.match(html, /sizes="\(max-width:760px\) 64vw/);
    const asset = planning ? 'trip-planning' : 'airport-welcome';
    for (const width of [480, 800, 1200]) assert.ok(html.includes(`${asset}-${width}.webp`));
    const target = lang === 'en' ? 'inquiry' : planning ? 'privateModeChooser' : 'vehicleService';
    assert.ok(html.includes(`href="#${target}"`));
    assert.ok(html.includes(`id="${target}"`));
    if (lang !== 'en' && planning) assert.match(html, /id="privateProgressText"/);
    const controls = lang === 'en' ? ['dates', 'people', 'notes', 'copy'] : planning ? ['privatePeople', 'privateCopy'] : ['vehiclePeople', 'vehicleLuggage', 'vehicleInquiry', 'vehicleCopy'];
    for (const id of controls) assert.ok(html.includes(`id="${id}"`), id);
    assert.equal(decorateServiceIllustrationHtml(html, {filename, locale}), html, 'repeat decoration must do nothing');
  });
}
test('the transform preserves all original progress, content, scripts and controls outside its hero', () => {
  const hero = '<span class="brand">TEST</span><h1>Original heading</h1><p>Original explanation</p><div id="privateProgress"><span></span></div><small id="privateProgressText">1 / 5</small>';
  const tail = '<div id="privateModeChooser"><input id="privatePeople" value="2"><textarea id="privateInquiry">Exact quote</textarea></div><script>const untouched="pricing;validation;copy";</script></body></html>';
  const source = '<html><head></head><body><nav>Quick nav</nav><header class="module-head media-head private-head">' + hero + '</header>' + tail;
  const result = decorateServiceIllustrationHtml(source, {filename:'private-tour.html'});
  assert.ok(result.includes(hero));
  assert.ok(result.endsWith(tail));
  assert.ok(result.indexOf('<nav>Quick nav</nav>') < result.indexOf('class="service-illustration-hero"'));
  assert.equal((result.match(/<script>/g) || []).length, 1);
  assert.equal(decorateServiceIllustrationHtml(result, {filename:'private-tour.html'}), result);
});
test('home, food, guide and support routes are byte-for-byte excluded', () => {
  const source = '<html><head></head><body><main>Original photograph and content</main></body></html>';
  for (const filename of ['index.html', 'food-map.html', 'local-guide.html', 'online-guide.html', 'travel-info.html']) assert.equal(decorateServiceIllustrationHtml(source, {filename}), source);
  assert.equal(decorateServiceIllustrationHtml(source.replace('<main>', '<main id="root">'), {filename:'private-tour.html'}), source.replace('<main>', '<main id="root">'));
});
test('missing target hero fails the build instead of silently adding a second section', () => {
  assert.throws(() => decorateServiceIllustrationHtml('<html><head></head><body></body></html>', {filename:'private-tour.html'}), /hero not found/);
});
test('artwork stays uncropped and uses lightweight responsive files with recorded provenance', async () => {
  const css = await read('public/assets/service-illustrations.css');
  assert.match(css, /object-fit:contain/);
  assert.match(css, /\.service-illustration-hero \.service-illustration-copy \.brand-heading-icon \{ display:none; \}/);
  assert.doesNotMatch(css, /object-fit:cover|scale\(|clip-path/);
  const manifest = JSON.parse(await read('reports/service-illustration-assets.json'));
  assert.equal(manifest.length, 2);
  for (const asset of manifest) for (const variant of asset.variants) {
    const data = await fs.readFile(new URL('../../' + variant.path, import.meta.url));
    assert.equal(data.subarray(8, 12).toString(), 'WEBP');
    assert.equal(data.byteLength, variant.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), variant.sha256);
    assert.ok(data.byteLength < 60000);
  }
});
