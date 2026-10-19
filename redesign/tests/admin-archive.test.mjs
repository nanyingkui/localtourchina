import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {isArchived,archivePatch,filterInquiries,isActive,isOverdue} from '../public/assets/admin-workspace.mjs';
import {reminderFor} from '../server/reminder-policy.mjs';
const source=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');
const row={id:'fixture',row_version:4,status:'reviewing',crm_stage:'followup',follow_up_at:'2026-01-01',admin_data:{test_mode:'live',payments:[{id:'retain'}],quote_items:[{name:'retain'}]}};
test('archive removes records from every default scope without changing original state or financial metadata',()=>{
 const saved={...row,...archivePatch(row,true,new Date('2026-10-19T10:00:00Z'))};
 assert.ok(isArchived(saved));assert.equal(saved.status,row.status);assert.equal(saved.crm_stage,row.crm_stage);
 assert.deepEqual(saved.admin_data.payments,row.admin_data.payments);assert.deepEqual(saved.admin_data.quote_items,row.admin_data.quote_items);
 for(const scope of ['live','all','test'])assert.equal(filterInquiries([saved],{scope}).length,0);
 assert.equal(filterInquiries([saved],{scope:'all',area:'archived'}).length,1);assert.equal(isActive(saved),false);assert.equal(isOverdue(saved),false);assert.equal(reminderFor(saved),null);
 const restored={...saved,...archivePatch(saved,false)};assert.equal(isArchived(restored),false);assert.equal(filterInquiries([restored]).length,1);assert.equal(reminderFor(restored).kind,'followup_due');assert.deepEqual(restored.admin_data.payments,row.admin_data.payments);
});
function setup(api){
 const fields={};const q=id=>fields[id]??={textContent:'',disabled:false};q('orderForm').querySelectorAll=()=>[];
 const ctx=vm.createContext({q,selected:structuredClone(row),savingOrder:false,drafts:new Map(),rememberDraft(){},isArchived,archivePatch,api,loadOrders:async()=>{},renderDetail(){},Date});
 vm.runInContext(source.slice(source.indexOf('async function toggleArchive('),source.indexOf('  async function saveOrder(')),ctx);return {ctx,q};
}
test('archive sends only version-protected metadata and blocks duplicate actions',async()=>{
 let finish,calls=0;const {ctx,q}=setup(async(path,options)=>{calls++;assert.match(path,/row_version=eq.4/);assert.deepEqual(Object.keys(JSON.parse(options.body)),['admin_data']);await new Promise(r=>finish=r);return [{}];});
 const pending=ctx.toggleArchive();assert.equal(q('archiveInquiry').disabled,true);await ctx.toggleArchive();assert.equal(calls,1);finish();await pending;assert.match(q('archiveNotice').textContent,/已移入归档区/);
});
test('archive never hides an unsaved draft',async()=>{let calls=0;const {ctx,q}=setup(async()=>{calls++;});ctx.drafts.set(row.id,{values:{fInternal:'keep'}});await ctx.toggleArchive();assert.equal(calls,0);assert.match(q('archiveStatus').textContent,/先保存/);assert.ok(ctx.drafts.has(row.id));});
test('archive conflict preserves selection and clearly reports refresh requirement',async()=>{const {ctx,q}=setup(async()=>[]);await ctx.toggleArchive();assert.equal(ctx.selected.id,row.id);assert.match(q('archiveStatus').textContent,/申请已被更新/);assert.equal(q('archiveInquiry').disabled,false);});
