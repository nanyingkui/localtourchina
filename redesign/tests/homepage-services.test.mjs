import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const viteRequire=createRequire(require.resolve('vite/package.json'));
const {buildSync}=viteRequire('esbuild');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=fileURLToPath(new URL('../',import.meta.url));
const temp=mkdtempSync(path.join(root,'.service-test-'));
let Storefront;
try {
 buildSync({entryPoints:[path.join(root,'src/Storefront.jsx')],outfile:path.join(temp,'storefront.cjs'),bundle:true,format:'cjs',platform:'node',external:['react']});
 Storefront=require(path.join(temp,'storefront.cjs')).default;
} finally { rmSync(temp,{recursive:true,force:true}); }
function render(lang,destination='zhangjiajie') {
 globalThis.location={search:'?destination='+destination};
 return renderToStaticMarkup(React.createElement(Storefront,{lang,onSelect:()=>{},onHelp:()=>{}}));
}
for (const lang of ['ko','zh','en']) {
 test(`${lang}: six direct service entries precede intact full package catalog`,()=>{
  const html=render(lang);
  const service=html.slice(html.indexOf('id="service-entry"'),html.indexOf('id="prepared-trips"'));
  assert.equal((service.match(/class="intent-card"/g)||[]).length,6);
  const prefix=lang==='ko'?'':'/'+lang;
  for(const page of ['tickets.html','vehicles.html','local-guide.html','day-tours.html','private-tour.html?mode=custom','online-guide.html']) assert.ok(service.includes(`href="${prefix}/${page}"`),page);
  assert.ok(html.indexOf('id="service-entry"')<html.indexOf('class="trip-catalog'));
  assert.equal((html.match(/class="trip-catalog-card"/g)||[]).length,6);
  assert.ok(service.includes('multi-booking.html'));
 });
 test(`${lang}: Hainan distinguishes inquiry-only services and keeps destination context`,()=>{
  const html=render(lang,'hainan');
  const service=html.slice(html.indexOf('id="service-entry"'),html.indexOf('id="prepared-trips"'));
  assert.equal((service.match(/class="intent-card"/g)||[]).length,6);
  assert.equal((service.match(/<button class="intent-card"/g)||[]).length,4);
  for(const page of ['tickets.html','vehicles.html','local-guide.html','private-tour.html']) assert.ok(!service.includes(page),page);
  assert.ok(service.includes('href="#prepared-trips"'));
  assert.ok(service.includes('online-guide.html'));
  assert.equal((html.match(/class="hainan-card"/g)||[]).length,3);
 });
}
test('destination switching supports back/forward and touch entries have explicit focus styles',()=>{
 const source=readFileSync(path.join(root,'src/Storefront.jsx'),'utf8');
 const css=readFileSync(path.join(root,'src/styles.css'),'utf8');
 assert.ok(source.includes('history.pushState'));
 assert.ok(source.includes("addEventListener('popstate'"));
 assert.ok(source.includes('onClick={()=>onHelp(destination)}'));
 assert.ok(css.includes('.intent-card:focus-visible'));
 assert.match(css,/\.intent-grid \{ grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
