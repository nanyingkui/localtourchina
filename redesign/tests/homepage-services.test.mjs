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
 test(`${lang}: six service entries use the shared catalogue and remain available after intact packages`,()=>{
  const html=render(lang);
  const service=html.slice(html.indexOf('id="service-entry"'),html.indexOf('id="travel-information"'));
  assert.equal((service.match(/class="intent-card"/g)||[]).length,6);
  const prefix=lang==='ko'?'':'/'+lang;
  for(const page of ['multi-booking.html?category=ticket','multi-booking.html?category=vehicle','multi-booking.html?category=guide','multi-booking.html?category=daytour','private-tour.html?mode=custom','online-guide.html']) assert.ok(service.includes(`href="${prefix}/${page}"`),page);
  assert.ok(html.indexOf('id="service-entry"')>html.indexOf('class="trip-catalog'));
  assert.equal((html.match(/class="trip-catalog-card"/g)||[]).length,6);
  assert.ok(service.includes('multi-booking.html'));
 });
 test(`${lang}: Hainan distinguishes inquiry-only services and keeps destination context`,()=>{
  const html=render(lang,'hainan');
  const service=html.slice(html.indexOf('id="service-entry"'),html.indexOf('id="travel-information"'));
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

test('homepage starts with one recommended route, a qualified budget and optional details',()=>{
 for(const lang of ['ko','zh','en']) {
  const html=render(lang),prefix=lang==='ko'?'':'/'+lang;
  const home=html.slice(html.indexOf('class="travel-home"'),html.indexOf('<section hidden',html.indexOf('class="travel-home"')));
  assert.ok(home.includes('href="/travel-planner/?departure=unknown&amp;days=4&amp;party=&amp;from=home#start-plan"'));
  assert.doesNotMatch(home,/870,000|970,000/,'no numerical price before a party is chosen');
  assert.ok(home.includes(`href="${lang==='ko'?'/':prefix+'/index.html'}?view=recommendation&amp;mode=help&amp;route=regular34&amp;step=details&amp;departure=unknown"`));
  assert.ok(home.includes('class="recommended-details"'));
  assert.ok(!home.includes('class="recommended-details" open'));
  assert.ok(home.includes('class="recommended-price"'));
  assert.ok(home.includes('regular34'));
  assert.ok(home.includes(`href="${prefix}/travel-info.html#weather-information"`));
  assert.ok(!home.includes('class="rounded-project"'));
  assert.ok(!home.includes('class="rounded-package"'));
  assert.ok(!home.includes('class="trip-price"'));
  const guides=home.slice(home.indexOf('class="hub-guide-grid"'),home.indexOf('class="hub-scenery"'));
  assert.ok(!guides.includes('multi-booking.html'));
  assert.ok(!guides.includes('tickets.html'));
  assert.doesNotMatch(home,/hub-weather|weather-widget|home-weather/);
  assert.match(home,/yuanjiajie-day.webp/);
  assert.match(home,/yuanjiajie-night.webp/);
  assert.match(home,/id="home-scene-time"/);
 }
});

test('single-service booking is visible before the itinerary recommendation in every locale',()=>{
 for(const lang of ['ko','zh','en']){
  const html=render(lang),prefix=lang==='ko'?'/':`/${lang}/`;
  assert.ok(html.indexOf('class="home-service-shortcuts"')<html.indexOf('class="recommended-experience"'));
  for(const category of ['ticket','vehicle','guide'])assert.ok(html.includes(`${prefix}multi-booking.html?category=${category}&amp;planner=0&amp;entry=home`));
  const shortcuts=html.slice(html.indexOf('class="home-service-shortcuts"'),html.indexOf('class="recommended-experience"'));
  assert.ok(!shortcuts.includes('<details'));
  assert.ok(!shortcuts.includes('view=recommendation'));
 }
});
