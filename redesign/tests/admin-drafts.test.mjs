import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {changedDraft} from '../public/assets/admin-workspace.mjs';
const source=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');
test('applying AI snapshots edited values, not only the pasted JSON',()=>{
 const fields={fInternal:{id:'fInternal',value:''},fCustomer:{id:'fCustomer',value:''},fStatus:{id:'fStatus',value:'received'},fPayment:{id:'fPayment',value:''},aiDraft:{value:'{"internal_note":"Keep all details","status":"reviewing"}'},saveStatus:{textContent:''}};
 fields.orderForm={querySelectorAll:()=>[fields.fInternal,fields.fCustomer,fields.fStatus,fields.fPayment]};
 const drafts=new Map(),ctx=vm.createContext({q:id=>fields[id],drafts,changedDraft,financeEditor:null,editorBase:null,selected:{id:'A'},savingOrder:false,labels:{reviewing:'审核中'}});
 vm.runInContext(source.slice(source.indexOf('function editorValues()'),source.indexOf("  window.addEventListener('beforeunload'")),ctx);
 vm.runInContext(source.slice(source.indexOf('function applyAiDraft()'),source.indexOf('  async function loadReceipts')),ctx);
 ctx.applyAiDraft();assert.equal(drafts.get('A').values.fInternal,'Keep all details');assert.equal(drafts.get('A').values.fStatus,'reviewing');assert.match(drafts.get('A').ai,/Keep all details/);
 fields.aiDraft.value='not json';ctx.applyAiDraft();assert.equal(drafts.get('A').values.fInternal,'Keep all details');assert.match(fields.saveStatus.textContent,/无法识别/);
});
test('note-only drafts do not restore obsolete quote or payment fields after a refresh',()=>{
 const base={values:{note:'',amount:'100',paid:false},finance:{quote_items:[{name:'A',quantity:1,unit_price:'100'}],deposit_due:'20'}};
 const delta=changedDraft({...base.values,note:'my note'},structuredClone(base.finance),base);
 assert.deepEqual(delta.values,{note:'my note'});assert.equal(delta.finance,undefined);
 const latest={note:'other note',amount:'200',paid:true};assert.deepEqual({...latest,...delta.values},{note:'my note',amount:'200',paid:true});
 const depositOnly=changedDraft(base.values,{...base.finance,deposit_due:'30'},base);assert.deepEqual(depositOnly.finance,{deposit_due:'30'});
});
