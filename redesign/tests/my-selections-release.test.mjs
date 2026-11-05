import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {CUSTOMER_CHAT_URL,copyInquiryAndOpenChat} from '../src/chat-handoff.mjs';
import {channelBrief} from '../src/selections/channel-brief.mjs';
const root=new URL('../',import.meta.url);
test('Kakao copies selected requirements before opening the exact existing channel, without sending',async()=>{
 const actions=[];assert.deepEqual(await copyInquiryAndOpenChat('request',{write:async text=>actions.push(['copy',text]),navigate:url=>actions.push(['open',url])}),{copied:true,opened:true});
 assert.deepEqual(actions,[['copy','request'],['open','https://pf.kakao.com/_hvrmn/chat']]);assert.equal(CUSTOMER_CHAT_URL,'https://pf.kakao.com/_hvrmn/chat');
});
test('failed or timed-out copy never silently discards the request by navigating away',async()=>{
 let opened=false;const navigate=()=>{opened=true;};
 for(const write of [async()=>{throw Error('denied');},()=>new Promise(()=>{})])assert.deepEqual(await copyInquiryAndOpenChat('request',{write,navigate,timeoutMs:5}),{copied:false,opened:false});assert.equal(opened,false);
});
test('production channel text includes only checked choices, quote requirements and wishes without a fake receipt or test notice',()=>{
 const product={id:'a',kind:'manual',included:true,title:'14인승 문의',summary:'왕복',amountKRW:null,missing:['이용 날짜'],details:'차량 가능 여부 확인'};
 for(const lang of ['ko','zh','en']){const brief=channelBrief([product,{...product,id:'b',included:false,title:'Excluded'}],lang);assert.match(brief,/14인승/);assert.doesNotMatch(brief,/Excluded|LTC-TEST-|KRW 0|웹사이트 테스트|网页测试|Test data only|미리보기 저장/);}
});
test('built public pages load one content-versioned selection layer; admin, receipts and app do not',async()=>{
 for(const locale of ['','zh/','en/']){
  const html=await fs.readFile(new URL('dist/client/'+locale+'index.html',root),'utf8');
  assert.equal((html.match(/data-ltc-selections src=/g)||[]).length,1);
  const base=html.match(/src="(\/assets\/my-selections\/[a-f0-9]{12})\/start.js"/)[1];
  for(const file of ['start.js','ui.mjs','bridge.mjs','model.mjs','custom-trip.mjs','drafts.mjs','channel-brief.mjs','furong-transfer.mjs','chat-handoff.mjs','style.css'])await fs.access(new URL('dist/client'+base+'/'+file,root));
  const ui=await fs.readFile(new URL('dist/client'+base+'/ui.mjs',root),'utf8');assert.doesNotMatch(ui,/__test\/|ms-preview|testClient|LOCAL_PREVIEW|本地预览|测试需求/);
  const model=await fs.readFile(new URL('dist/client'+base+'/model.mjs',root),'utf8');assert.match(model,/KEY='ltc-selections-v1'/);assert.doesNotMatch(model,/fetch\(|supabase|create_public_inquiry/);
 }
 for(const file of ['admin.html','inquiry-status.html','app/index.html'])assert.doesNotMatch(await fs.readFile(new URL('dist/client/'+file,root),'utf8'),/data-ltc-selections/);
});
