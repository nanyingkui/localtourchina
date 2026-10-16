import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {renderReminderHistory,summarizeReminders} from '../public/assets/admin-reminders.mjs';
const row={dedup_key:'id:followup_due:2026-10-14T02:00:00.000Z',kind:'followup_due',status:'sent',attempts:1,created_at:'2026-10-14T02:00:00Z',sent_at:'2026-10-14T02:15:00Z',inquiries:{id:'customer-id',reference:'TEST-123',customer_name:'Test guest'}};
test('history uses actual sent time, actionable customer ID, reminder reason and honest result',()=>{const html=renderReminderHistory([row]);assert.match(html,/data-reminder-inquiry="customer-id"/);assert.match(html,/10:15:00/);assert.match(html,/跟进到期/);assert.match(html,/未确认已读/);assert.match(html,/未保存完整消息原文/);});
test('daily reminder repeats differ from retries and duplicate keys',()=>{const repeat={...row,dedup_key:row.dedup_key+':2026-10-15'};const summary=summarizeReminders([row,repeat]);assert.equal(summary.repeatEvents,1);assert.equal(summary.retried,0);assert.equal(summary.repeatedKeys,0);assert.match(renderReminderHistory([repeat]),/逾期每日再次提醒/);assert.equal(summarizeReminders([row,row]).repeatedKeys,1);});
test('pending records never invent a successful sending time, and missing customers have no link',()=>{const html=renderReminderHistory([{...row,status:'pending',sent_at:null,inquiries:null}]);assert.match(html,/尚无成功发送时间/);assert.doesNotMatch(html,/data-reminder-inquiry/);});
test('untrusted customer names and errors are escaped',()=>{const html=renderReminderHistory([{...row,inquiries:{...row.inquiries,customer_name:'<img onerror=alert(1)>'},last_error:'<script>alert(1)</script>'}]);assert.doesNotMatch(html,/<img|<script/);assert.match(html,/&lt;script&gt;/);});
test('clicking a delivery opens the exact loaded inquiry and clears stale filters',async()=>{
 const fields={};const q=id=>fields[id]??={value:'old-filter',textContent:'',scrollIntoView(){this.scrolled=true;},focus(){this.focused=true;}};
 const button={dataset:{reminderInquiry:'customer-id'}};q('kakaoDeliveryList').querySelectorAll=()=>[button];
 const source=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');let fn=source.slice(source.indexOf('async function loadDeliveryHistory()'),source.indexOf('  async function loadReminderStatus()'));
 fn=fn.replace("const {renderReminderHistory}=await import('./admin-reminders.mjs?v=reminder-history-20261016');",'');
 const customer={id:'customer-id',reference:'TEST-123'};let detail,list;
 const ctx=vm.createContext({q,api:async(path)=>{assert.match(path,/inquiries!inner/);assert.match(path,/inquiries.source_channel=eq.website/);return [row];},renderReminderHistory,orders:[customer],selected:null,renderList(){list=true;},renderDetail(){detail=true;},window:{confirm:()=>true}});
 vm.runInContext(fn,ctx);await ctx.loadDeliveryHistory();button.onclick();assert.equal(ctx.selected,customer);assert.equal(q('search').value,'TEST-123');assert.equal(q('statusFilter').value,'');assert.equal(q('queueFilter').value,'');assert.ok(list&&detail&&q('orderDetail').focused);
});
test('exact reference search opens the matching customer and unmatched search clears stale detail',async()=>{
 const {findInquiryByReference,inquiryMatchesSearch,compareAdminInquiries}=await import('../public/assets/admin-login.mjs');
 const source=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');const fn=source.slice(source.indexOf('function renderList()'),source.indexOf('  async function renderDetail()'));
 const fields={};const q=id=>fields[id]??={value:'',textContent:'',querySelectorAll:()=>[]};const first={id:'one',reference:'LTC-20261016-AAAAAA',customer_name:'First',contact:'test',language:'ko',status:'received',crm_stage:'new',created_at:'2026-10-16T10:00:00Z'},second={...first,id:'two',reference:'LTC-20261016-BBBBBB',customer_name:'Second'};let renders=0;
 const ctx=vm.createContext({q,orders:[first,second],selected:first,findInquiryByReference,inquiryMatchesSearch,compareAdminInquiries,stages:{new:'未回复'},serviceLabels:{},esc:v=>String(v||''),renderDetail:()=>renders++,Date});vm.runInContext(fn,ctx);
 q('search').value=second.reference;ctx.renderList();assert.equal(ctx.selected.id,'two');assert.equal(renders,1);
 q('search').value='NO-MATCH';ctx.renderList();assert.equal(ctx.selected,null);assert.equal(renders,2);
 ctx.selected=first;q('saveStatus').textContent='有未保存的修改';q('search').value=second.reference;ctx.renderList();assert.equal(ctx.selected.id,'one');
});
