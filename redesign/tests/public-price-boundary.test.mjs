import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../',import.meta.url);
const approved=JSON.parse(fs.readFileSync(new URL('catalog-site/catalog.json',root))).tickets.pricing.direct_prices;
test('customer ticket calculators retain all 28 approved fares without underlying RMB or markup data',()=>{
 for(const path of ['tickets.html','zh/tickets.html']){
  const html=fs.readFileSync(new URL(path,root),'utf8');
  assert.doesNotMatch(html,/const priceSettings=|singleTicketMarkup|cnyToKrw:230/);
  const block=html.match(/const pricing=\{[\s\S]*?(?=  const ticketCarePrice=)/)?.[0];assert.ok(block,path);
  const value=vm.runInNewContext(block+';({pricing,salePrice})');
  for(const [key,amount] of Object.entries(approved))assert.equal(value.salePrice(...key.split('.')),amount,key);
  for(const group of Object.values(value.pricing))for(const option of Object.values(group))assert.deepEqual(Object.keys(option).filter(k=>!['name','adventure','rule'].includes(k)),[]);
 }
});
