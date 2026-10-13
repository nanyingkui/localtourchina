import test from 'node:test';
import assert from 'node:assert/strict';
import {reminderFor,retryDelay,kakaoTemplate} from '../server/reminder-policy.mjs';
const now = new Date('2026-10-13T12:00:00Z');
const lead = {id:'test-id',reference:'TEST',crm_stage:'new',status:'received',created_at:'2026-10-13T11:00:00Z',first_replied_at:null,assigned_to:'Operator',contact:'PRIVATE',inquiry_text:'PRIVATE'};
test('unanswered reminders wait 30 minutes and never disclose contact or full messages',()=>{
 assert.equal(reminderFor({...lead,created_at:'2026-10-13T11:45:00Z'},now),null);
 const result=reminderFor(lead,now);assert.equal(result.kind,'unanswered');assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
test('closed and paused inquiries do not generate follow-up messages',()=>{
 for(const crm_stage of ['closed','paused']) assert.equal(reminderFor({...lead,crm_stage,follow_up_at:'2026-10-13T10:00:00Z'},now),null);
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
