import test from 'node:test';
import assert from 'node:assert/strict';
import {KEY,readState,commit,totals,requestText} from '../src/selections/model.mjs';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
const item=(id,changes={})=>({id,kind:'vehicle',title:'9-seat airport transfer',summary:'City, 3 passengers',details:'Pickup hotel',fields:[{id:'vehiclePeople',value:'3'}],amountKRW:40000,missing:[],sourcePath:'/vehicles.html',language:'ko',...changes});
test('adding repeated service kinds preserves independent saved snapshots across reload',()=>{
 const storage=memory();commit(storage,{type:'save',item:item('pickup')});commit(storage,{type:'save',item:item('return',{summary:'Return airport transfer'})});
 const saved=readState(storage);assert.equal(saved.items.length,2);assert.deepEqual(saved.items.map(x=>x.id),['pickup','return']);assert.equal(totals(saved.items).amount,80000);
});
test('editing replaces the same id and canceling a working copy leaves saved content unchanged',()=>{
 const storage=memory();commit(storage,{type:'save',item:item('a')});const before=readState(storage);const working=structuredClone(before.items[0]);working.summary='Unsaved change';assert.equal(readState(storage).items[0].summary,'City, 3 passengers');
 const result=commit(storage,{type:'save',item:working,expectedItemRevision:1});assert.equal(result.state.items.length,1);assert.equal(result.state.items[0].revision,2);assert.equal(result.state.items[0].summary,'Unsaved change');
});
test('failed storage does not report success and a retry keeps the original stable item id',()=>{
 const storage=memory(),set=storage.setItem;storage.setItem=()=>{throw Error('quota')};assert.throws(()=>commit(storage,{type:'save',item:item('stable')}),/STORAGE/);assert.equal(readState(storage).items.length,0);
 storage.setItem=set;commit(storage,{type:'save',item:item('stable')});const retried=commit(storage,{type:'save',item:item('stable')});assert.equal(retried.unchanged,true);assert.equal(retried.state.items.length,1);
});
test('silent write failures are detected by read-back verification',()=>{const storage=memory();storage.setItem=()=>{};assert.throws(()=>commit(storage,{type:'save',item:item('a')}),/STORAGE/);});
test('deletion undo survives reload and retains intervening unrelated additions',()=>{
 const storage=memory();commit(storage,{type:'save',item:item('a')});commit(storage,{type:'remove',id:'a',expectedItemRevision:1});commit(storage,{type:'save',item:item('b',{summary:'Different date'})});
 assert.equal(readState(storage).undo.item.id,'a');const result=commit(storage,{type:'undo'});assert.deepEqual(result.state.items.map(x=>x.id),['a','b']);assert.equal(result.state.undo,null);
});
test('stale edits cannot overwrite another tab and a stale global revision is rejected',()=>{
 const storage=memory();commit(storage,{type:'save',item:item('a')});const stale=readState(storage);commit(storage,{type:'save',item:item('a',{summary:'Newer change'}),expectedItemRevision:1});
 assert.throws(()=>commit(storage,{type:'save',item:item('a',{summary:'Stale change'}),expectedItemRevision:1}),/CONFLICT/);
 assert.throws(()=>commit(storage,{type:'save',item:item('b')},stale.revision),/CONFLICT/);assert.equal(readState(storage).items[0].summary,'Newer change');
});
test('an identical double-add resolves to the saved item instead of duplicating it',()=>{const storage=memory();commit(storage,{type:'save',item:item('first')});const again=commit(storage,{type:'save',item:item('second')});assert.equal(again.duplicate,true);assert.equal(again.item.id,'first');assert.equal(again.state.items.length,1);});
test('only checked items enter the subtotal and request; quote-required services and questions remain distinct',()=>{
 const storage=memory();commit(storage,{type:'save',item:item('a')});commit(storage,{type:'save',item:item('fourteen',{title:'14-seat Furong request',amountKRW:null})});commit(storage,{type:'save',item:item('q',{kind:'question',title:'Question',details:'Are there many stairs?',amountKRW:null})});
 commit(storage,{type:'include',id:'a',included:false});const items=readState(storage).items,sum=totals(items);assert.equal(sum.amount,0);assert.equal(sum.priced,0);assert.equal(sum.quoted,1);assert.equal(sum.questions,1);assert.equal(sum.count,2);
 const text=requestText(items,'zh');assert.doesNotMatch(text,/9-seat airport transfer/);assert.match(text,/14-seat Furong request/);assert.match(text,/Are there many stairs/);assert.match(text,/尚未发送真实咨询/);
});
test('corrupt or inaccessible storage never gets replaced with a fake empty success',()=>{
 const storage=memory();storage.setItem(KEY,'broken');assert.throws(()=>readState(storage),/CORRUPT/);assert.throws(()=>commit(storage,{type:'save',item:item('a')}),/CORRUPT/);assert.equal(storage.getItem(KEY),'broken');assert.throws(()=>readState({getItem:()=>{throw Error('denied')}}),/STORAGE/);
});
test('missing product details can be saved accurately as a draft without inventing a quote',()=>{
 const storage=memory();commit(storage,{type:'save',item:item('draft',{amountKRW:null,missing:['Travel date','Pickup place']})});const saved=readState(storage);assert.equal(saved.items.length,1);assert.equal(totals(saved.items).incomplete,1);assert.equal(totals(saved.items).quoted,1);assert.match(requestText(saved.items,'en'),/Travel date, Pickup place/);
});
