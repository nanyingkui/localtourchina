import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tripCatalog,packageTitle,getTripPrice,formatTripPrice} from '../src/trip-catalog.mjs';
const root=new URL('../../',import.meta.url);
const catalogue=JSON.parse(fs.readFileSync(new URL('assets/shop-products.json',root),'utf8'));
test('published shop retains all six routes, 90 localized price tiers and complete itineraries',()=>{
 assert.equal(catalogue.packages.length,6);
 for(const source of tripCatalog){const product=catalogue.packages.find(p=>p.id===source.id);assert.ok(product);assert.ok(fs.existsSync(new URL(product.image.slice(1),root)));
  for(const lang of ['ko','zh','en']){const copy=product.locales[lang];assert.equal(copy.title,packageTitle(source,lang));assert.deepEqual(copy.itinerary,source.copy[lang].itinerary);for(const pax of [2,4,6,8,10])assert.equal(copy.prices[pax],formatTripPrice(getTripPrice(source,pax),lang));}
 }
});
test('release assets match maintained sources after the full build',()=>{
 for(const name of ['shop-products.json','service-validation.js','redesign.js','redesign.css','brand-system.js','brand-system.css','journey-planner.mjs','journey-rules.mjs'])assert.equal(fs.readFileSync(new URL('assets/'+name,root),'utf8'),fs.readFileSync(new URL('../public/assets/'+name,import.meta.url),'utf8'),name);
});
