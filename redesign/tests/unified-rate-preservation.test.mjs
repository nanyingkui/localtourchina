import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const source=fs.readFileSync(new URL('../../src/site-template.html',import.meta.url),'utf8'),fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/pre-unification-rates.json',import.meta.url),'utf8'));
for(const {name,pattern,sha256}of fixtures)test('pre-refactor rates and arithmetic retained: '+name,()=>{const match=source.match(new RegExp(pattern,'s'));assert.ok(match,'rate block exists');assert.equal(createHash('sha256').update(match[0]).digest('hex'),sha256);});

// Assert the published price data, rather than hashing implementation and copy.
import {tripCatalog,getTripPrice} from '../src/trip-catalog.mjs';
test('six package catalogues retain their original published even-party rates',()=>{
 assert.deepEqual(tripCatalog.map(trip=>[trip.id,trip.prices.map(tier=>[tier.pax,tier.priceKRW])]),[
 ['regular34',[[2,970000],[4,870000],[6,840000],[8,820000],[10,800000]]],
 ['regular45',[[2,1130000],[4,970000],[6,950000],[8,930000],[10,910000]]],
 ['regular56',[[2,1360000],[4,1130000],[6,1110000],[8,1090000],[10,1060000]]],
 ['trek34',[[2,1070000],[4,970000],[6,940000],[8,920000],[10,900000]]],
 ['trek45',[[2,1230000],[4,1070000],[6,1050000],[8,1030000],[10,1010000]]],
 ['trek56',[[2,1460000],[4,1230000],[6,1210000],[8,1190000],[10,1160000]]]]);
 for(const trip of tripCatalog.filter(trip=>trip.kind==='trekking'))assert.equal(getTripPrice(trip,3),null);
});

test('approved guide baseline is 220000 for 6 hours; overtime is paid directly to guide',()=>{
 const rates=source.match(/const guides=(.*?);/s)[1];assert.equal((rates.match(/price:220000/g)||[]).length,4);
 assert.match(source,/extraHours=translation\?0:Math.max\(0,hours-6\)\*20000/);
 assert.match(source,/dailyTotal=base\+extraPeople\+meal/);
});
