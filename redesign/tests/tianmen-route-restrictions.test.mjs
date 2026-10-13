import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../../src/site-template.html',import.meta.url),'utf8');
const helper=html.slice(html.indexOf('  function tianmenCOnly('),html.indexOf('  function dataFor(id){'));
function setup(date,route,time='08:00–09:00'){
 const inputs=['A코스','B코스','C코스'].map(value=>({value,checked:value===route,disabled:false,closest:()=>({classList:{toggle(){}}})}));
 const early={value:'07:00–08:00'};const timeInput={value:time,options:[early,{value:'08:00–09:00'}]};const notice={hidden:true};
 const ctx={val:()=>date,$$:()=>inputs,$:selector=>selector.includes('option')?early:selector==='#tianmenTime'?timeInput:notice};vm.createContext(ctx);vm.runInContext(helper,ctx);return{ctx,inputs,timeInput,notice,early};
}
for(const date of ['2026-10-13','2026-10-14','2027-05-01',''])test('suspended A/B are rejected for '+(date||'undecided date'),()=>{
 for(const route of ['A코스','B코스']){const s=setup(date,route);s.ctx.syncTianmenRoutes();assert.equal(s.inputs[0].disabled,true);assert.equal(s.inputs[1].disabled,true);assert.equal(s.inputs.some(x=>x.checked),false);assert.equal(s.notice.hidden,false);}
 const s=setup(date,'C코스');s.ctx.syncTianmenRoutes();assert.equal(s.inputs[2].checked,true);assert.equal(s.inputs[2].disabled,false);
});
test('pre-closure date keeps prior route state',()=>{const s=setup('2026-10-12','A코스');s.ctx.syncTianmenRoutes();assert.equal(s.inputs[0].disabled,false);assert.equal(s.inputs[0].checked,true);});
test('suspended early entry time clears with route restriction',()=>{const s=setup('2026-10-14','A코스','07:00–08:00');s.ctx.syncTianmenRoutes();assert.equal(s.timeInput.value,'');assert.equal(s.early.disabled,true);});
test('generated Korean and Chinese pages protect initial markup',()=>{for(const prefix of ['','zh/']){const s=fs.readFileSync(new URL('../../'+prefix+'tickets.html',import.meta.url),'utf8');for(const route of ['A','B'])assert.match(s,new RegExp('name="tianmen-route" value="'+route+'[^" ]+" disabled'));assert.match(s,/syncTianmenRoutes\(\);updatePricing/);}});
