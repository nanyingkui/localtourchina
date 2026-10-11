import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url),viteRequire=createRequire(require.resolve('vite/package.json'));
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=fileURLToPath(new URL('../',import.meta.url)),temp=mkdtempSync(path.join(root,'.editorial-test-'));
let Storefront;
try {viteRequire('esbuild').buildSync({entryPoints:[path.join(root,'src/Storefront.jsx')],outfile:path.join(temp,'entry.cjs'),bundle:true,format:'cjs',platform:'node',external:['react']});Storefront=require(path.join(temp,'entry.cjs')).default;} finally {rmSync(temp,{recursive:true,force:true});}
function render(lang,search=''){globalThis.location={search};return renderToStaticMarkup(React.createElement(Storefront,{lang,onSelect:()=>{},onHelp:()=>{}}));}
for(const lang of ['ko','zh','en']) test(`${lang}: editorial hierarchy keeps all paths, prices, safety copy and six playable films`,()=>{
 const html=render(lang);
 assert.equal((html.match(/class="intent-card"/g)||[]).length,6);
 assert.equal((html.match(/class="video-guide-open"/g)||[]).length,6);
 assert.equal((html.match(/class="trip-configuration"/g)||[]).length,6);
 assert.doesNotMatch(html,/class="brand-greeting"|class="brand-halo"/);
 const articles=html.match(/<article[^>]+class="trip-catalog-card"[\s\S]*?<\/article>/g);
 assert.equal(articles.length,6);
 for(const card of articles){const pos=card.indexOf('class="trip-configuration"');assert.ok(card.indexOf('class="trip-catalog-price"')<pos);assert.ok(card.indexOf('trip-catalog-walking')<pos);assert.ok(card.indexOf('trip-catalog-price-note')<pos);assert.ok(card.lastIndexOf('</details>')<card.indexOf('class="trip-catalog-action'));assert.doesNotMatch(card,/<details class="trip-configuration" open/);}
});
test('deep-linked package reveals its retained configuration',()=>{const html=render('en','?product=regular34&pax=6');assert.match(html,/<section class="trip-configuration">/);assert.match(html,/<input[^>]*checked=""[^>]*value="6"/);});
test('party inputs cannot be hidden and invalid parties cannot continue',()=>{const html=render('en','?product=regular34&pax=3');assert.match(html,/<section class="trip-configuration">/);assert.match(html,/<input[^>]*id="[^"]+-custom"/);assert.doesNotMatch(html,/<details class="trip-configuration"/);const s=readFileSync(path.join(root,'src/TripCatalog.jsx'),'utf8');assert.match(s,/disabled=\{!validPax/);});
test('all six video entries keep uncropped image thumbnails',()=>{const css=readFileSync(path.join(root,'src/video-guides.css'),'utf8');assert.match(css,/object-fit:contain/);assert.match(css,/grid-template-columns:88px minmax\(0,1fr\)/);assert.doesNotMatch(css,/nth-child\(n\+4\) \.video-guide-image \{ display:none/);});
