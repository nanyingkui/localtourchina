import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transportMatrix} from '../../supabase/functions/ltc-runtime/pricing.mjs';
import {transportDisplay} from '../src/selections/transport-quote.mjs';

const rules=()=>({routes:{'forest-city-city':{product_id:'forest',rates:{car9:100,car14:160}}},fees:.03,reserve:.08,target_margin:.3,margin_floor:.25,profit_floor:0,growth_floor:100,fx:{rates:{CNY:.005}},guide_small:100,guide_large:120,guide_meal:0,tour_costs:{forest:{tickets:10}},listed_tariffs:{'forest-city-city|day|car9':{krw:40000,minimum_profit:50,margin_floor:.15},'forest-city-city|day|car14':{krw:60000,minimum_profit:80,margin_floor:.15}}});
test('approved whole-vehicle tariff scales with vehicle count and retains fixed KRW under FX movement',()=>{
 const r=rules();for(const fx of [.005,.0051]){r.fx.rates.CNY=fx;for(const [vehicle,seats,rate]of [['car9',8,40000],['car14',13,60000]])for(const party of [1,8,9,13,14,30,99]){const row=transportMatrix(r,{route:'forest-city-city',vehicle,maxParty:party}).at(-1);assert.equal(row.totalKRW,Math.ceil(party/seats)*rate);assert.equal(row.safe,true);}}
});
test('approved standalone tariffs do not change guided tours, and unsafe costs suppress quotes',()=>{
 const r=rules(),plain=structuredClone(r);delete plain.listed_tariffs;const context={route:'forest-city-city',guided:true,maxParty:30};assert.deepEqual(transportMatrix(r,context),transportMatrix(plain,context));r.routes['forest-city-city'].rates.car9=300;assert.equal(transportMatrix(r,{route:'forest-city-city',vehicle:'car9'})[0].safe,false);
});
test('old standalone vehicle quotes cannot appear in any language',()=>{for(const lang of ['ko','zh','en'])for(const pricingRevision of [undefined,6])assert.equal(transportDisplay({productId:'airport-pickup',pricingRevision,expiresOn:'2099-01-01'},lang),null);});
test('notebook inquiry refresh removes old price before fetching and preserves customer notes',async()=>{
 const store=new Map();let resolve;const pending=new Promise(r=>resolve=r);const box={window:{Notebook:{money:String,api:()=>pending}},sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},Date,Intl,AbortSignal};vm.createContext(box);vm.runInContext(fs.readFileSync(new URL('../notebook/ko/service-data.js',import.meta.url),'utf8'),box);const S=box.window.Services,s=S.read('airport');s.fields.date='2026-12-01';s.notes.wishes='Keep luggage request';s.quote={key:S.key(s),pricingRevision:6,totalKRW:17000,expiresOn:'2099-01-01'};assert.equal(S.valid(s),false);const refreshed=S.refresh(s);assert.equal(s.quote,null);resolve(new Response(JSON.stringify({status:'ok',quote:{pricingRevision:7,totalKRW:30000,expiresOn:'2099-01-01'}})));await refreshed;assert.equal(s.quote.totalKRW,30000);assert.equal(s.notes.wishes,'Keep luggage request');assert.equal(S.valid(s),true);
});
