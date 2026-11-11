import { readFileSync } from 'node:fs';
import { validateProducts } from './product-schema.mjs';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));
const errors = validateProducts(read('products.json'), read('products.schema.json'));
if (errors.length) throw Error(`Product matrix validation failed:\n${errors.join('\n')}`);
console.log('Public product matrix schema: OK');
