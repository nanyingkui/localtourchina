import test from 'node:test';
import assert from 'node:assert/strict';
import {isTestInquiry,isOverdue,filterInquiries,inquirySummary,statusConflict,normalizedContact} from '../public/assets/admin-workspace.mjs';
test('test view is reversible and never excludes ordinary travellers based on request prose',()=>{
 const rows=[{id:1,customer_name:'Guest',inquiry_text:'test trip'}, {id:2,customer_name:'[测试/테스트] 完整咨询验收'}, {id:3,contact:'TEST-NOT-A-CUSTOMER'}];
 assert.deepEqual(filterInquiries(rows,{scope:'live'}).map(x=>x.id),[1]);assert.equal(filterInquiries(rows,{scope:'all'}).length,3);assert.equal(filterInquiries(rows,{scope:'test'}).length,2);assert.equal(isTestInquiry({customer_name:'Testa'}),false);
});
test('closed, completed and cancelled records never count as overdue; paused deadlines remain actionable',()=>{
 const row={crm_stage:'followup',status:'reviewing',follow_up_at:'2026-01-01'};
 assert.ok(isOverdue(row));for(const status of ['completed','cancelled'])assert.equal(isOverdue({...row,status}),false);assert.ok(isOverdue({...row,crm_stage:'paused'}));for(const crm_stage of ['closed'])assert.equal(isOverdue({...row,crm_stage}),false);
});
test('summary infers candidates without changing original fields and date filtering uses them',()=>{
 const row={inquiry_text:'여행 시기: 2026-11-20\n인원: 3명\n예상 총 금액: 238,592원',service:'combo'};
 assert.deepEqual(inquirySummary(row),{date:'2026-11-20',people:'3',amount:'238,592원',dateInferred:true});assert.equal(row.travel_date,undefined);
 assert.equal(filterInquiries([row],{from:'2026-11-19',to:'2026-11-20'}).length,1);assert.equal(filterInquiries([row],{from:'2026-11-21'}).length,0);
});
test('filters combine service, assignee and status without altering records',()=>{
 const rows=[{service:'guide',assigned_to:'A',crm_stage:'payment',status:'reviewing'},{service:'ticket',assigned_to:null,status:'confirmed'}];
 assert.equal(filterInquiries(rows,{service:'guide',owner:'A',queue:'active'}).length,1);assert.equal(filterInquiries(rows,{owner:'__unassigned',status:'confirmed-group'}).length,1);assert.equal(rows.length,2);
});
test('customer-facing confirmation requires the underlying facts',()=>{
 assert.match(statusConflict({status:'deposit_paid',payment_received:false}),/付款/);assert.match(statusConflict({status:'confirmed',supplier_confirmed:false}),/供应商/);
 assert.equal(statusConflict({status:'deposit_paid',payment_received:true,quote_amount:null}),'');assert.equal(statusConflict({status:'confirmed',supplier_confirmed:true,quote_amount:0}),'');
});
test('related contact normalization preserves identifiers and country prefixes',()=>{
 assert.equal(normalizedContact('+82 (10) 1234-5678'),'821012345678');assert.equal(normalizedContact('Guest@Example.com'),'guest@example.com');assert.notEqual(normalizedContact('01012345678'),normalizedContact('+821012345678'));
});
