import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCustomItem,normalizeBrief,reviewWarnings,transferTimingIssues} from '../src/selections/custom-trip.mjs';
import {readState,commit,requestText,totals} from '../src/selections/model.mjs';
import {draftKey,readDraft,writeDraft,clearDraft,activeDraft} from '../src/selections/drafts.mjs';
function memory(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
test('a simple wish without exact dates or budget is a valid unpriced custom brief',()=>{
 const storage=memory(),brief=makeCustomItem({wish:'想慢慢玩，看看芙蓉镇夜景'},'custom','zh');commit(storage,{type:'save',item:brief});const saved=readState(storage).items[0];
 assert.equal(saved.amountKRW,null);assert.deepEqual(saved.missing,['出行时间','人数构成']);assert.equal(totals([saved]).quoted,1);assert.match(requestText([saved],'zh'),/单项参考小计：?[: ]+待报价/);assert.doesNotMatch(requestText([saved],'zh'),/KRW 0/);
 assert.throws(()=>normalizeBrief({wish:'',destination:''}),/EMPTY_CUSTOM_BRIEF/);
});
test('a stated budget retains its currency and per-group basis without becoming a sale price',()=>{
 const brief=makeCustomItem({destination:'张家界',party:'3成人1位7岁儿童',budget:'全团人民币12000元，不含已订酒店',hotel:'self',services:['vehicle','tickets'],pace:'relaxed'},'custom','zh');
 assert.equal(brief.amountKRW,null);assert.equal(brief.customBrief.budget,'全团人民币12000元，不含已订酒店');assert.match(brief.details,/已有自行预订/);assert.match(brief.details,/车辆与接送, 门票/);assert.match(brief.details,/预算不等于已确认报价/);
 assert.throws(()=>normalizeBrief({destination:'张家界',services:['automatic-payment']}),/INVALID_CUSTOM_BRIEF/);
});
test('custom changes update one card and cancellation leaves the original saved brief intact',()=>{
 const storage=memory();commit(storage,{type:'save',item:makeCustomItem({destination:'张家界',wish:'只玩张家界'},'custom','ko')});
 const working=makeCustomItem({destination:'张家界、芙蓉镇',wish:'增加一晚'},'custom','ko');assert.equal(readState(storage).items[0].customBrief.wish,'只玩张家界');
 commit(storage,{type:'save',item:working,expectedItemRevision:1});assert.equal(readState(storage).items.length,1);assert.equal(readState(storage).items[0].customBrief.wish,'增加一晚');
});
test('quote-required items and questions never misleadingly show a zero-won subtotal',()=>{
 const custom={...makeCustomItem({destination:'장가계'},'custom','ko'),included:true};assert.match(requestText([custom],'ko'),/개별 항목 참고 소계: 별도 견적/);
 const question={...custom,id:'q',kind:'question',title:'Question',details:'A question'};assert.match(requestText([question],'en'),/subtotal: No priced items/);assert.doesNotMatch(requestText([question],'en'),/KRW 0/);
});
test('overlapping custom and individual services stay intact with a reconciliation notice',()=>{
 const vehicle={id:'v',kind:'vehicle',title:'Airport',revision:1,included:true,amountKRW:40000},custom={...makeCustomItem({destination:'张家界',relationship:'include'},'custom','zh',[vehicle]),included:true};
 assert.equal(totals([vehicle,custom]).amount,40000);assert.deepEqual(custom.customBrief.refs,[{id:'v',revision:1,title:'Airport'}]);assert.ok(reviewWarnings([vehicle,custom],'zh').some(x=>x.code==='CUSTOM_SCOPE'));
 assert.ok(reviewWarnings([{...vehicle,revision:2},custom],'zh').some(x=>x.code==='CUSTOM_CHANGED'));
 const separate={...makeCustomItem({destination:'长沙',relationship:'separate'},'other','zh',[vehicle]),included:true};assert.equal(reviewWarnings([vehicle,separate]).length,0);
 const unchecked={...vehicle,included:false};assert.deepEqual(reviewWarnings([unchecked,custom],'zh').map(x=>x.code),['CUSTOM_NOT_INCLUDED']);
 const solo=reviewWarnings([custom],'zh',[vehicle,custom]);assert.deepEqual(solo.map(x=>x.code),['CUSTOM_NOT_INCLUDED']);
});
test('package and day-tour overlap checks flag a possible overlap without inventing discounts',()=>{
 const selected=kind=>({kind,included:true,id:kind,amountKRW:40000});assert.ok(reviewWarnings([selected('recommendation'),selected('ticket')]).some(x=>x.code==='PACKAGE_SCOPE'));
 assert.ok(reviewWarnings([selected('daytour'),selected('vehicle')]).some(x=>x.code==='DAYTOUR_SCOPE'));assert.equal(totals([selected('daytour'),selected('vehicle')]).amount,80000);
});
test('question and custom working drafts survive reload, close/reopen, and do not alter saved selections',()=>{
 const storage=memory(),key=draftKey('custom'),draft={version:1,kind:'custom',id:'stable',baseItem:null,values:{wish:'Keep my draft'},path:'/zh/index.html',lang:'zh',open:true};
 writeDraft(storage,key,draft);assert.equal(activeDraft(storage,'/zh/index.html','zh').value.values.wish,'Keep my draft');assert.equal(readState(storage).items.length,0);
 writeDraft(storage,key,{...draft,open:false});assert.equal(activeDraft(storage,'/zh/index.html','zh'),null);assert.equal(readDraft(storage,key).id,'stable');
 assert.equal(activeDraft(storage,'/index.html','ko'),null);clearDraft(storage,key);assert.equal(readDraft(storage,key),null);
 const qkey=draftKey('question');writeDraft(storage,qkey,{...draft,kind:'question',values:{content:'A question draft'}});assert.equal(readDraft(storage,qkey).values.content,'A question draft');
});
test('draft write failures are detected and an existing corrupt draft remains untouched',()=>{
 const storage=memory(),key=draftKey('custom');storage.setItem(key,'broken');assert.throws(()=>readDraft(storage,key));assert.equal(storage.getItem(key),'broken');
 const silent={getItem:()=>null,setItem:()=>{}};assert.throws(()=>writeDraft(silent,key,{version:1}),/DRAFT_STORAGE/);
});
test('Furong drafts accurately flag the original lead-time, operating-hour and return-order rules',()=>{
 const issues=transferTimingIssues({date:'2026-11-06',earliest:'2026-11-08',time:'07:30',roundtrip:true,returnDate:'2026-11-06',returnTime:'07:00'},'zh');assert.equal(issues.length,3);
 assert.equal(transferTimingIssues({date:'2026-11-09',earliest:'2026-11-08',time:'08:00',roundtrip:true,returnDate:'2026-11-09',returnTime:'21:00'},'zh').length,0);
 assert.equal(transferTimingIssues({direction:'inbound',time:'21:30'},'ko').length,1);
});
