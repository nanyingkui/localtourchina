import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {statusConflict} from '../public/assets/admin-workspace.mjs';
import {prepareFinance,quoteTotal,paymentBalance} from '../public/assets/admin-finance.mjs';
const source=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');
function setup(api){
 const fields={}; const q=id=>fields[id]??=( {value:'',checked:false,textContent:''} );
 for(const [id,value] of Object.entries({fName:'Test guest',fIdentity:'unverified',fStage:'followup',fStatus:'reviewing',fAssigned:'Test staff',fFollow:'2026-10-20T10:00'}))q(id).value=value;
 const buttons=[{disabled:false},{disabled:false}];q('orderForm').querySelectorAll=()=>buttons;
 const ctx=vm.createContext({q,selected:{id:'test-inquiry',row_version:1},orders:[],savingOrder:false,statusConflict,prepareFinance,quoteTotal,paymentBalance,financeEditor:null,paymentIds:new Map(),drafts:new Map(),api,loadOrders:async()=>{q('saveStatus').textContent='';},Date});
 const fn=source.slice(source.indexOf('async function saveOrder('),source.indexOf('  function copyAiBrief'));
 vm.runInContext(fn,ctx);return {ctx,q,buttons};
}
test('saving progress submits selected record, blocks duplicate clicks and keeps confirmation after refresh',async()=>{
 let finish,calls=0;const {ctx,q,buttons}=setup(async(path,options)=>{calls++;assert.match(path,/id=eq.test-inquiry&row_version=eq.1/);assert.equal(JSON.parse(options.body).crm_stage,'followup');await new Promise(r=>finish=r);return [{id:'test-inquiry'}];});
 const pending=ctx.saveOrder({preventDefault(){}});assert.ok(buttons.every(b=>b.disabled));await ctx.saveOrder({preventDefault(){}});assert.equal(calls,1);finish();await pending;
 assert.match(q('saveStatus').textContent,/已保存/);assert.ok(buttons.every(b=>!b.disabled));
});
test('failed save keeps an explicit failure and re-enables retry',async()=>{
 const {ctx,q,buttons}=setup(async()=>{throw Error('offline');});await ctx.saveOrder({preventDefault(){}});
 assert.match(q('saveStatus').textContent,/保存失败.*offline/);assert.ok(buttons.every(b=>!b.disabled));
});
test('routine internal follow-up saves without owner, reminder or known guest name',async()=>{
 let saved;const {ctx,q}=setup(async(_,options)=>{saved=JSON.parse(options.body);return [{id:'test-inquiry'}];});
 q('fAssigned').value='';q('fFollow').value='';q('fName').value='';q('fInternal').value='等待客人确认日期';q('fCustomer').value='Existing customer message';
 await ctx.saveOrder({preventDefault(){}});
 assert.equal(saved.assigned_to,null);assert.equal(saved.follow_up_at,null);assert.equal(saved.internal_note,'等待客人确认日期');assert.equal(saved.customer_note,'Existing customer message');assert.equal(saved.customer_name,'미입력');assert.match(q('saveStatus').textContent,/已保存/);
});
test('stale row version never clears the draft or claims save success',async()=>{
 const {ctx,q}=setup(async()=>[]);ctx.drafts.set('test-inquiry',{values:{fInternal:'retain'}});await ctx.saveOrder({preventDefault(){}});
 assert.match(q('saveStatus').textContent,/申请已被更新/);assert.ok(ctx.drafts.has('test-inquiry'));
});
