import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const source=fs.readFileSync(new URL('../../src/site-template.html',import.meta.url),'utf8'),fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/pre-unification-rates.json',import.meta.url),'utf8'));
for(const {name,pattern,sha256}of fixtures)test('pre-refactor rates and arithmetic retained: '+name,()=>{const match=source.match(new RegExp(pattern,'s'));assert.ok(match,'rate block exists');assert.equal(createHash('sha256').update(match[0]).digest('hex'),sha256);});

test('six package catalogues and party price bands remain unchanged',()=>{assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../src/trip-catalog.mjs',import.meta.url))).digest('hex'),'9df6d7ce21fd199a139de7613841b828a1a24794b207a93575267eddb145a526');});
