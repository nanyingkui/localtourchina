import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogCopy, catalogInquiry, tripCatalog} from '../src/trip-catalog.mjs';
for (const lang of ['ko','zh','en']) test(`${lang}: legacy hotel names stay available while classic inquiries use the confirmed hotel basis`,()=>{
 assert.match(catalogCopy[lang].hotels,/Homeinn Plus/);
 assert.doesNotMatch(catalogCopy[lang].hotels,/Home Inn Selected|Homein Plus|셀렉티드/);
 assert.doesNotMatch(catalogInquiry(tripCatalog[0],4,lang),/Homeinn Plus/);
 assert.match(catalogInquiry(tripCatalog[0],4,lang),/Mercure|머큐어|美居/);
 assert.match(catalogInquiry(tripCatalog.find(p=>p.kind==='trekking'),4,lang),/Homeinn Plus/);
});
test('Chinese name and existing Korean brand remain consistent',()=>{
 assert.match(catalogCopy.zh.hotels,/如家精选/);
 assert.match(catalogCopy.ko.hotels,/홈 인 플러스/);
});
