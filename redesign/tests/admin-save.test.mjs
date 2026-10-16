import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');
function setup(api){
 const fields={}; const q=id=>fields[id]??=( {value:'',checked:false,textContent:''} );
 for(const [id,value] of Object.entries({fName:'Test guest',fIdentity:'unverified',fStage:'followup',fStatus:'reviewing',fAssigned:'Test staff',fFollow:'2026-10-20T10:00'}))q(id).value=value;
 const buttons=[{disabled:false},{disabled:false}];q('orderForm').querySelectorAll=()=>buttons;
 const ctx=vm.createContext({q,selected:{id:'test-inquiry'},orders:[],savingOrder:false,api,loadOrders:async()=>{q('saveStatus').textContent='';},Date});
 const fn=source.slice(source.indexOf('async function saveOrder('),source.indexOf('  function copyAiBrief'));
 vm.runInContext(fn,ctx);return {ctx,q,buttons};
}
test('saving progress submits selected record, blocks duplicate clicks and keeps confirmation after refresh',async()=>{
 let finish,calls=0;const {ctx,q,buttons}=setup(async(path,options)=>{calls++;assert.match(path,/id=eq.test-inquiry/);assert.equal(JSON.parse(options.body).crm_stage,'followup');await new Promise(r=>finish=r);});
 const pending=ctx.saveOrder({preventDefault(){}});assert.ok(buttons.every(b=>b.disabled));await ctx.saveOrder({preventDefault(){}});assert.equal(calls,1);finish();await pending;
 assert.match(q('saveStatus').textContent,/已保存/);assert.ok(buttons.every(b=>!b.disabled));
});
test('failed save keeps an explicit failure and re-enables retry',async()=>{
 const {ctx,q,buttons}=setup(async()=>{throw Error('offline');});await ctx.saveOrder({preventDefault(){}});
 assert.match(q('saveStatus').textContent,/保存失败.*offline/);assert.ok(buttons.every(b=>!b.disabled));
});
