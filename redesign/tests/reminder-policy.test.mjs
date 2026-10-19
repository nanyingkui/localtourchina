import test from 'node:test';
import assert from 'node:assert/strict';
import {reminderFor,retryDelay,kakaoTemplate,reminderDigest,isTestReminder} from '../server/reminder-policy.mjs';
import {isTestInquiry} from '../public/assets/admin-workspace.mjs';
const now = new Date('2026-10-13T12:00:00Z');
const lead = {id:'test-id',reference:'TEST',crm_stage:'new',status:'received',created_at:'2026-10-13T11:00:00Z',first_replied_at:null,assigned_to:'Operator',contact:'PRIVATE',inquiry_text:'PRIVATE'};
test('unanswered reminders wait 30 minutes and never disclose contact or full messages',()=>{
 assert.equal(reminderFor({...lead,created_at:'2026-10-13T11:45:00Z'},now),null);
 const result=reminderFor(lead,now);assert.equal(result.kind,'unanswered');assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
test('closed inquiries do not generate follow-up messages',()=>{
 for(const crm_stage of ['closed']) assert.equal(reminderFor({...lead,crm_stage,follow_up_at:'2026-10-13T10:00:00Z'},now),null);
});
test('repeated polling keeps key stable; new follow-up deadline produces a new key',()=>{
 const due={...lead,follow_up_at:'2026-10-13T10:00:00Z'};
 assert.equal(reminderFor(due,now).dedup_key,reminderFor(due,new Date(+now+60000)).dedup_key);
 assert.notEqual(reminderFor(due,now).dedup_key,reminderFor({...due,follow_up_at:'2026-10-13T11:00:00Z'},now).dedup_key);
});
test('retries back off and Kakao message links only to authenticated admin page',()=>{
 assert.equal(retryDelay(1),60000);assert.equal(retryDelay(100),3600000);
 assert.equal(kakaoTemplate('test').link.web_url,'https://localtourchina.com/admin.html');
});

test('paused customers get the agreed follow-up reminder, but no unanswered alert',()=>{assert.equal(reminderFor({...lead,crm_stage:'paused'},now),null);assert.equal(reminderFor({...lead,crm_stage:'paused',follow_up_at:'2026-10-13T10:00:00Z'},now).kind,'followup_due');});
test('large batches count every queued event while keeping private data out of Kakao messages',()=>{
 const rows=Array.from({length:200},(_,i)=>({kind:'unanswered',inquiries:{reference:'LTC-TEST-'+i,contact:'PRIVATE',inquiry_text:'PRIVATE'}}));
 const text=reminderDigest(rows);assert.ok(text.includes('미응답 200건'));assert.ok(text.includes('외 190개'));assert.ok(text.length<1000);assert.ok(!text.includes('PRIVATE'));
});
test('test inquiries are excluded at delivery time, while an explicit live override is respected',()=>{
 for(const row of [{customer_name:'[测试/테스트] 验收'},{contact:'TEST-NO-CONTACT'},{admin_data:{test_mode:'test'}}]){
  assert.equal(reminderFor({...lead,...row},now),null);assert.equal(isTestReminder(row),isTestInquiry(row));
 }
 const explicit={...lead,contact:'TEST-NO-CONTACT',admin_data:{test_mode:'live'}};assert.ok(reminderFor(explicit,now));assert.equal(isTestReminder(explicit),false);
});
