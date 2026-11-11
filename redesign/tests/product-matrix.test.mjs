import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateProducts, validateSchema } from '../scripts/product-schema.mjs';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));
const data = read('products.json'), schema = read('products.schema.json');
test('public matrix conforms to schema', () => assert.deepEqual(validateProducts(data, schema), []));
test('private keys fail, including nested open objects', () => {
  for (const target of ['root', 'product', 'nested']) {
    const sample = structuredClone(data);
    const object = target === 'root' ? sample : target === 'product' ? sample.products[0] : sample.products[0].single_supplement_krw.standard_hotel;
    object.internal_name_zh = 'private';
    assert.ok(validateProducts(sample, schema).some(x => x.includes('internal_name_zh')));
  }
});
test('actual schema constraints reject malformed data', () => {
  for (const mutate of [d => d.currency = 'USD', d => delete d.products[0].name_ko, d => d.products[0].highlights_ko.pop(), d => d.products[0].price_per_person_krw.regular['4'] = -1, d => d.products[0].solo_price_krw.extra = 0]) {
    const sample = structuredClone(data); mutate(sample); assert.ok(validateProducts(sample, schema).length);
  }
  assert.ok(validateSchema(1, {oneOf: [{type:'integer'}, {type:'number'}]}).length);
});
