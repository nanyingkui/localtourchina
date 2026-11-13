import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {referenceQuote,formatReferenceQuote,canonicalItem} from '../src/selections/catalog-config.mjs';
import {contactChannel} from '../src/selections/contact-channels.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../../catalog-site/catalog.json',import.meta.url)));
const fx={date:'2026-11-13',rates:{CNY:.0049897,USD:.00074787}};
test('22 unique records produce matching public detail records in all three languages',()=>{
 assert.equal(Object.keys(catalogue).length,22);
 for(const record of Object.values(catalogue))for(const lang of ['ko','zh','en']){
  const html=fs.readFileSync(new URL('../../'+record.paths[lang].slice(1),import.meta.url),'utf8');
  const matches=[...html.matchAll(/<script[^>]*id="catalog-current"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(matches.length,1,record.id+'/'+lang);
  assert.deepEqual(JSON.parse(matches[0][1]),record,record.id+'/'+lang);
  assert.equal(canonicalItem(record,lang).id,'product:'+record.id);
  assert.doesNotMatch(html,/采购成本|整团利润|planning_cost|direct_cost/);
 }
});
test('all multi-day plans have the correct number of days and end with airport transfer',()=>{
 for(const record of Object.values(catalogue).filter(r=>r.discovery.group==='packages')){
  assert.equal(record.plans.length,3);
  for(const plan of record.plans){assert.equal(plan.days.length,record.pricing.nights+1);assert.match(plan.days.at(-1).code,/airport$/);for(const day of plan.days)for(const lang of ['ko','zh','en'])assert.ok(day.title[lang]&&day.text[lang].length>25)}
 }
});
test('unknown conditions and weaker conversion cannot masquerade as verified package prices',()=>{
 const record=catalogue['45furong'];const c={party:'4',mode:'private',date:'2026-12-08',arrival:'late',departure:'night',season:'regular',room:'standard'};
 assert.equal(referenceQuote(record,{...c,room:'extra'}),null);assert.equal(referenceQuote(record,{...c,departure:''}),null);
 const q=referenceQuote(record,c);assert.equal(q.totalKRW,4040000);
 assert.equal(formatReferenceQuote(q,'ko',{...fx,rates:{...fx.rates,CNY:.004}}),null);
 assert.match(formatReferenceQuote(q,'zh',fx).displayText,/¥20,158\.39/);assert.match(formatReferenceQuote(q,'en',fx).displayText,/\$3,021\.39/);
});
test('shared savings remain conditional, with no payable group total or client-entered combined size',()=>{
 for(const id of ['forest','tianmen','canyon','furong','fenghuang']){
  const q=referenceQuote(catalogue[id],{party:'2',mode:'shared',season:'regular',room:'standard'});
  assert.equal(q.exampleParty,4);assert.equal(q.totalKRW,null);assert.ok(q.savingPerPersonKRW>0);
  for(const lang of ['ko','zh','en'])assert.ok(formatReferenceQuote(q,lang,fx).displayText);
 }
});
test('guide base excludes direct overtime and uncosted extras; Hainan is a benchmark not profit',()=>{
 const c={mode:'private',party:'2',date:'2026-12-08',language:'ko',guideRole:'tour',startTime:'09:00',endTime:'17:00',guideMeals:'provided'};
 const guide=referenceQuote(catalogue['local-guide'],c);assert.equal(guide.totalKRW,220000);assert.equal(guide.overtimeHoursPerDay,2);assert.equal(guide.directGuideOvertimeKRW,20000);
 assert.equal(referenceQuote(catalogue['local-guide'],{...c,guideMeals:'quote'}),null);
 for(const id of ['sanya-44','sanya-45','sanya-48','sanya-49']){
  const q=referenceQuote(catalogue[id],{mode:'private',party:'4'});for(const lang of ['ko','zh','en']){const out=formatReferenceQuote(q,lang,fx);assert.equal(out.totalKRW,null);assert.ok(out.displayAmount>0)}
 }
 assert.equal(contactChannel('zh').id,'nanyingkui');assert.match(contactChannel('en').url,/wa.me/);assert.match(contactChannel('ko').url,/kakao/);
});

test('standalone Furong transfer does not replace airport hire and is unique across languages',async()=>{
 const {selectionIdentity,transition}=await import('../src/selections/model.mjs');
 let state={version:1,revision:0,items:[],undo:null};
 const hire={...canonicalItem(catalogue.vehicles,'ko'),amountKRW:50000};
 state=transition(state,{type:'save',item:hire}).state;
 const transfer={...hire,id:selectionIdentity('vehicles','furong'),kind:'furong',title:'Furong transfer',amountKRW:48000};
 state=transition(state,{type:'save',item:transfer}).state;
 assert.equal(state.items.length,2);assert.equal(state.items[0].amountKRW,50000);
 state=transition(state,{type:'save',item:{...transfer,title:'芙蓉镇接送'},expectedItemRevision:1}).state;
 assert.equal(state.items.length,2);assert.equal(state.items[1].amountKRW,48000);
});
