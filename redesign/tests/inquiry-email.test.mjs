import test from 'node:test';
import assert from 'node:assert/strict';
import {mailConfiguration,newInquiryEmail,testEmail,deliveryOutcome} from '../server/inquiry-email/mail-policy.mjs';
const config={from:'notify@mail.localtourchina.com',recipient:'operator@example.invalid'};
const row={reference:'LTC-20261016-ABC123',service:'private',customer_name:'<img onerror=alert(1)>',contact:'synthetic@example.invalid',inquiry_text:'여행 시기: 2026-11-02\n인원: 3명\nPRIVATE_ORIGINAL_TEXT',access_token:'PRIVATE_PROGRESS_TOKEN'};
test('notification emails use the fixed Gmail routing prefix, correct trip fields, escaped content and an admin-only link',()=>{
 const mail=newInquiryEmail(row,config);
 assert.ok(mail.subject.startsWith('[LTC-NEW-INQUIRY]'));assert.ok(mail.subject.includes('2026-11-02'));assert.ok(mail.subject.includes('3人'));
 assert.deepEqual(mail.to,[config.recipient]);assert.ok(mail.html.includes('&lt;img'));assert.ok(!mail.html.includes('<img onerror'));
 assert.ok(mail.html.includes('https://localtourchina.com/admin.html?inquiry=LTC-20261016-ABC123'));
 assert.ok(!JSON.stringify(mail).includes('PRIVATE_PROGRESS_TOKEN'));assert.ok(!JSON.stringify(mail).includes('PRIVATE_ORIGINAL_TEXT'));
});
test('undecided dates and optional names remain valid; forged references cannot create foreign links',()=>{
 assert.ok(newInquiryEmail({...row,inquiry_text:'',customer_name:''},config).text.includes('日期待确认'));
 assert.throws(()=>newInquiryEmail({...row,reference:'https://evil.example'},config));
});
test('configuration pins recipient to verified admin identity and sender to the company domain',()=>{
 const input={from:config.from,apiKey:'re_synthetic_not_a_real_key',recipient:'attacker@example.invalid'};
 assert.equal(mailConfiguration(input,config.recipient).recipient,config.recipient);
 assert.throws(()=>mailConfiguration({...input,from:'notify@localtourchina.com.evil.example'},config.recipient));
 assert.throws(()=>mailConfiguration({...input,apiKey:'invalid'},config.recipient));
 assert.throws(()=>mailConfiguration(input,''));
});
test('test notifications are clearly labeled and never represent an actual application',()=>{
 const message=testEmail(config);assert.ok(message.subject.includes('[测试 / 테스트]'));assert.ok(message.subject.includes('LTC-NEW-INQUIRY'));assert.ok(!JSON.stringify(message).includes(row.reference));
});
test('retry window stays below provider 24-hour dedup retention; permanent and ambiguous failures differ',()=>{
 const now=Date.parse('2026-10-16T12:00:00Z'),recent=new Date(now-3600000).toISOString(),old=new Date(now-21*3600000).toISOString();
 assert.equal(deliveryOutcome(200,recent,now),'accepted');assert.equal(deliveryOutcome(429,recent,now),'pending');assert.equal(deliveryOutcome(403,recent,now),'failed');assert.equal(deliveryOutcome(0,old,now),'uncertain');assert.equal(deliveryOutcome(409,recent,now),'uncertain');assert.notEqual(deliveryOutcome(0,recent,now,8),'pending');
});
