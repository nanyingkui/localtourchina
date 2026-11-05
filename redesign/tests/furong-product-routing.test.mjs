import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transferQuote} from '../src/furong-transfer.mjs';
const source=fs.readFileSync(new URL('../../src/site-template.html',import.meta.url),'utf8');
const vehicleCode=source.slice(source.indexOf('  const vehicleProducts='),source.indexOf("  $$('#vehicleService .pill')"));
function vehicleQuote({service='airport',key='car5',region='city',direction='one',hours=8,meal=0}){
 const nodes=new Map(),initial={vehicleType:key,vehicleDate:'2026-12-10',vehicleTime:'10:00',vehiclePeople:'3',vehicleLuggage:'2',vehiclePickup:'QA pickup',vehicleDropoff:'QA dropoff',vehicleRoute:region,vehicleDirection:direction,vehicleHours:String(hours),vehicleDriverMeal:String(meal),vehicleReturnDate:'2026-12-11',vehicleReturnTime:'10:00',vehicleReturnPickup:'QA return',vehicleReturnDropoff:'QA hotel'};
 function $(selector){const id=selector.replace(/^#/,'');if(!nodes.has(id)){const n={value:initial[id]||'',textContent:'',selectedOptions:[{textContent:initial[id]||''}],dataset:{},hidden:false};let html='';Object.defineProperty(n,'innerHTML',{get:()=>html,set:value=>{html=value;if(id==='vehicleType'){const options=[...value.matchAll(/<option value="([^"]+)"([^>]*)>([^<]+)/g)];const option=options.find(x=>x[2].includes('selected'))||options[0];n.value=option[1];n.selectedOptions=[{textContent:option[3]}];}}});nodes.set(id,n);}return nodes.get(id);}
 vm.runInNewContext(vehicleCode+';renderVehicle();',{privateRadio:()=>service,$,$$:()=>[],val:s=>$(s).value,won:n=>n+'원',wonZh:n=>n+'韩元',customerMessage:(ko,zh)=>ko.concat(zh).join('\n'),CATALOG:{version:'test',effective:'2026-11-05'}});
 return {summary:$('#vehicleSummary').innerHTML,inquiry:$('#vehicleInquiry').value,notice:$('#vehicleNotice').innerHTML};
}
test('airport quotes retain every original route and direction price without Furong fees',()=>{
 const rates={car5:[20000,60000],car7:[30000,70000],car9:[40000,80000],mini:[50000,90000],bus:[60000,110000]};
 for(const [key,amounts] of Object.entries(rates))for(const [i,region] of ['city','wulingyuan'].entries())for(const direction of ['one','round']){const result=vehicleQuote({key,region,direction});assert.ok(result.summary.includes(`<div class="price">${amounts[i]*(direction==='round'?2:1)}원</div>`));assert.doesNotMatch(result.inquiry+result.notice,/FURONG|부용진|芙蓉/);assert.match(result.inquiry,new RegExp('TRANSFER-'+key.toUpperCase()+'-'+region.toUpperCase()));if(direction==='round')assert.match(result.inquiry,/2026-12-11/);}
});
test('daily rental base, overtime and meal charges remain independent',()=>{
 for(const [key,base] of Object.entries({car9:170000,car14:200000,car18:220000}))for(const hours of [8,10])for(const meal of [0,10000,20000]){const result=vehicleQuote({service:'rental',key,hours,meal});assert.ok(result.summary.includes(`<div class="price">${base+Math.max(0,hours-8)*20000+meal}원</div>`));assert.doesNotMatch(result.inquiry,/FURONG|부용진|芙蓉/);}
});
test('standalone Furong remains the only transfer price and never inherits airport or daily rates',()=>{
 for(const [region,shared,privateFare] of [['city',24000,192000],['wulingyuan',39000,312000]])for(const people of [1,3,8]){assert.equal(transferQuote({region,mode:'shared',journey:'roundtrip',people}).total,shared*people);assert.equal(transferQuote({region,mode:'private',journey:'roundtrip',people}).total,privateFare);}
 assert.throws(()=>transferQuote({people:9}));assert.equal(transferQuote({mode:'private',journey:'roundtrip',region:'city',returnRegion:'wulingyuan'}).total,252000);
});
test('vehicle source removes obsolete control, pricing and inquiry suffix and provides a product link',()=>{
 assert.doesNotMatch(source,/vehicleFurong["']|furongFee|furongOption|-FURONG|부용진 왕복 추가|부용진 왕복: 5/);
 assert.match(source,/data-furong-transfer-link href="index\.html\?view=furong"/);
});
test('generated vehicle pages route each language to the same existing localized Furong product',()=>{
 for(const locale of ['','zh/','en/']){const html=fs.readFileSync(new URL('../../'+locale+'vehicles.html',import.meta.url),'utf8');assert.match(html,/data-furong-transfer-link href="index\.html\?view=furong"/);assert.doesNotMatch(html,/id="vehicleFurong"|furongFee|부용진 왕복 추가|芙蓉镇往返：5/);assert.ok(html.includes(locale==='zh/'?'合作运输方':locale==='en/'?'partner operator':'제휴 운송업체'));}
});
