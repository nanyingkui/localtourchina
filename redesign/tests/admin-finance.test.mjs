import test from 'node:test';
import assert from 'node:assert/strict';
import {money,quoteTotal,paymentBalance,prepareFinance} from '../public/assets/admin-finance.mjs';
const payment={id:'11111111-1111-4111-8111-111111111111',kind:'receipt',amount:'100.10',occurred_at:'2026-10-19T10:00:00Z',method:'bank',note:''};
test('quote totals use cents and reject malformed quantities and negative prices',()=>{
 assert.equal(quoteTotal([{name:'A',quantity:3,unit_price:'0.10'},{name:'B',quantity:1,unit_price:'0.20'}]),0.5);
 for(const value of ['-1','NaN','1.001','1e3'])assert.throws(()=>money(value));assert.throws(()=>quoteTotal([{name:'A',quantity:1.5,unit_price:1}]));
});
test('deposit is constrained while original records remain unchanged',()=>{
 const old={test_mode:'live',other:'preserve'},items=[{name:'Guide',quantity:2,unit_price:100}];
 const result=prepareFinance(old,items,'50',null,'KRW');assert.equal(result.deposit_due,50);assert.equal(result.other,'preserve');assert.deepEqual(old,{test_mode:'live',other:'preserve'});
 assert.throws(()=>prepareFinance(old,items,'201',null,'KRW'));
});
test('repeating an uncertain receipt does not double-record it',()=>{
 const first=prepareFinance({},[],'',payment,'KRW');assert.equal(paymentBalance(first.payments,'KRW'),100.1);
 const retry=prepareFinance(first,[],'',payment,'KRW');assert.equal(retry.payments.length,1);
 assert.throws(()=>prepareFinance(first,[],'',{...payment,amount:101},'KRW'),/编号已使用/);
});
test('refund requires recorded funds and cannot change the currency of an existing ledger',()=>{
 const first=prepareFinance({},[],'',payment,'KRW'),refund={...payment,id:'22222222-2222-4222-8222-222222222222',kind:'refund',amount:50};
 assert.equal(paymentBalance(prepareFinance(first,[],'',refund,'KRW').payments,'KRW'),50.1);
 assert.throws(()=>prepareFinance(first,[],'',{...refund,amount:101},'KRW'),/退款累计/);
 assert.throws(()=>prepareFinance(first,[],'',null,'USD'),/币种/);
});
test('historical paid flags require explicit reconciliation without inventing an amount',()=>{
 assert.throws(()=>prepareFinance({},[],'',{...payment,legacy_paid:true},'KRW'),/历史/);
 assert.equal(prepareFinance({},[],'',{...payment,legacy_paid:true},'KRW',true).legacy_reconciled,true);
});
