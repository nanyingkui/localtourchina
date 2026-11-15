import test from 'node:test';import assert from 'node:assert/strict';
import {resolveReferenceQuote,referenceQuote,formatReferenceQuote,canonicalItem} from '../src/selections/catalog-config.mjs';
const record={id:'34',paths:{ko:'/package-regular34.html',zh:'/zh/tours/regular34.html',en:'/en/tours/regular34.html'},locales:Object.fromEntries(['ko','zh','en'].map(k=>[k,{title:'34',sections:''}])),pricing:{policy:'dated_package',pricingRevision:6}};
test('dated package never uses static tiers, requires date and party, and sends the exact public conditions',async()=>{
 const original=globalThis.fetch;let sent;
 const conditions={date:'2027-02-06',party:'4',hotel:'HT-139',arrival:'late',departure:'night',mode:'private',room:'standard'};
 try{globalThis.fetch=async(url,init)=>{sent={url,body:JSON.parse(init.body)};return {ok:true,json:async()=>({status:'ok',quote:{totalKRW:3800000}})}};
 assert.equal(referenceQuote(record,conditions),null);
 assert.equal((await resolveReferenceQuote(record,{})).status,'missing');assert.equal(sent,undefined);
 const result=await resolveReferenceQuote(record,conditions);assert.deepEqual(sent.body,conditions);assert.equal(sent.url,'/api/package34/quote');assert.equal(result.quote.totalKRW,3800000);
 }finally{globalThis.fetch=original}
});
test('dated packages retain configured meal count and product identity in each language',()=>{
 const fx={date:'2026-11-13',rates:{CNY:.0049897,USD:.00074787}},q={basis:'dated-package',totalKRW:3400000,perPersonKRW:850000,nights:3,scenario:'late_night',mealCount:8,rooms:2,hotelDates:['2026-12-09','2026-12-10','2026-12-11'],hotelState:'estimated',pricingRevision:6,quoteFx:fx,conditions:{party:'4',date:'2026-12-09'}};
 for(const lang of ['ko','zh','en']){const x=formatReferenceQuote(q,lang,fx);assert.match(x.displayText,/8/);assert.match(x.displayText,/2026-12-10/);assert.equal(canonicalItem(record,lang,q.conditions,x).id,'product:34');}
});
