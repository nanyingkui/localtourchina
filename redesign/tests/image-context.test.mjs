import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('guide photo description does not claim the pictured person speaks a specific language',()=>{
 const html=read('en/local-guide.html');
 assert.match(html,/alt="Local guide meeting travellers"/);
 assert.match(html,/Past guide meeting; guide assignment confirmed with your booking\./);
 assert.match(html,/fluent English-speaking local guide/);
});
test('full-bleed source retains regional provenance without using altered archived scenery',()=>{
 const source=read('redesign/src/Storefront.jsx');
 assert.match(source,/hero-jpg-2478\.webp/);
 assert.doesNotMatch(source,/expanded|retouched|zhangjiajie-hero-desktop-v2/);
 const note=read('assets/HERO-SOURCES.md');
 assert.match(note,/No crop, retouch, colour alteration/);
 assert.match(note,/not newly established/);
});
