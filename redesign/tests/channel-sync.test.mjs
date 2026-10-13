import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicMessages,nextCursor,STATES} from '../server/crm-channel-sync/channel-sync-policy.mjs';
const m={id:'m1',chatType:'userChat',chatId:'c1',personType:'user',createdAt:'2026-10-14T00:00:00Z'};
test('exclude internal messages, groups, and other conversations',()=>assert.deepEqual(publicMessages('c1',[m,{...m,private:true},{...m,isPrivate:true},{...m,chatId:'c2'},{...m,chatType:'group'}]),[m]));
test('include operator replies but reject invalid timestamps',()=>{assert.equal(publicMessages('c1',[{...m,personType:'manager'}]).length,1);assert.throws(()=>publicMessages('c1',[{...m,createdAt:'bad'}]));});
test('never treat missing pagination cursor as completion',()=>{assert.throws(()=>nextCursor({}));assert.throws(()=>nextCursor({hasNext:true,nextCursor:null}));assert.equal(nextCursor({hasNext:false}),null);assert.equal(nextCursor({hasNext:true,nextCursor:'abc'}),'abc');});
test('scan queued, paused and closed chats as well as open',()=>assert.deepEqual(STATES,['opened','queued','snoozed','closed','initial','missed']));
