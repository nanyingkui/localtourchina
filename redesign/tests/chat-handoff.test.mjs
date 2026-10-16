import test from 'node:test';import assert from 'node:assert/strict';
import {copyInquiryAndOpenChat,CUSTOMER_CHAT_URL} from '../src/chat-handoff.mjs';
test('copies the complete inquiry before navigation, without sending a chat message',async()=>{
 const events=[],text='상담번호: TEST\n'+('선택 항목\n'.repeat(2000));
 const result=await copyInquiryAndOpenChat(text,{write:async value=>{events.push('copy');assert.equal(value,text);},navigate:url=>{events.push('navigate');assert.equal(url,CUSTOMER_CHAT_URL);}});
 assert.deepEqual(events,['copy','navigate']);assert.deepEqual(result,{copied:true,opened:true});
});
test('clipboard rejection does not navigate or claim success',async()=>{let navigated=false;const result=await copyInquiryAndOpenChat('TEST',{navigate:()=>{navigated=true;},write:async()=>{throw Error('denied');}});assert.deepEqual(result,{copied:false,opened:false});assert.equal(navigated,false);});
test('blocked navigation preserves the successful copy for the fallback',async()=>{assert.deepEqual(await copyInquiryAndOpenChat('TEST',{navigate:()=>{throw Error('blocked');},write:async()=>{}}),{copied:true,opened:false});});
test('unanswered clipboard permission times out and permits manual copying',async()=>{assert.deepEqual(await copyInquiryAndOpenChat('TEST',{timeoutMs:5,write:()=>new Promise(()=>{}),navigate:()=>{throw Error('must not navigate');}}),{copied:false,opened:false});});
test('empty content does not navigate or copy',async()=>{assert.deepEqual(await copyInquiryAndOpenChat('',{navigate:()=>{throw Error('must not navigate');},write:async()=>{throw Error('must not copy');}}),{copied:false,opened:false});});
