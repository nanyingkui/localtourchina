import test from 'node:test';
import assert from 'node:assert/strict';
import {initialDraft,validateDraft,savePreview,inquiryText,STORAGE_KEY} from '../src/consultation.mjs';
const now=new Date(2026,9,8,12);
const valid=()=>({...initialDraft(),contact:'kakao-id',consent:true});
function storage(){const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}}
test('undecided dates and optional nickname accepted',()=>assert.deepEqual(validateDraft(valid(),now),{}));
test('service, contact, consent and party size required',()=>{const e=validateDraft({...valid(),services:[],contact:' ',consent:false,people:'0'},now);assert.deepEqual(Object.keys(e).sort(),['consent','contact','people','services'])});
test('dates in past and impossible dates rejected',()=>{for(const date of ['2026-10-07','2026-02-30','2026-13-01'])assert.ok(validateDraft({...valid(),dateMode:'exact',date},now).date);assert.deepEqual(validateDraft({...valid(),dateMode:'exact',date:'2026-10-08'},now),{});});
test('future months accepted; invalid and earlier month rejected',()=>{for(const month of ['2026-09','2026-13','2026-00'])assert.ok(validateDraft({...valid(),dateMode:'month',month},now).month);assert.deepEqual(validateDraft({...valid(),dateMode:'month',month:'2026-11'},now),{})});
test('save persists record, produces unique preview number and never production submission',()=>{const store=storage();const a=savePreview(valid(),store,now),b=savePreview(valid(),store,now);assert.notEqual(a.reference,b.reference);assert.match(a.reference,/^PREVIEW-20261008-/);assert.equal(a.productionSubmitted,false);assert.equal(JSON.parse(store.getItem(STORAGE_KEY)).length,2);assert.match(inquiryText(a,a.reference),/날짜 미정/);assert.match(inquiryText(a,a.reference),/실제 상담은 이 메시지를 전송한 뒤 시작/)});
test('storage failures propagated and form input retained',()=>{const d=valid();const copy=structuredClone(d);assert.throws(()=>savePreview(d,{getItem:()=>null,setItem:()=>{throw Error('blocked')}},now));assert.deepEqual(d,copy)});
test('invalid entries cannot generate preview number',()=>assert.throws(()=>savePreview(initialDraft(),storage(),now),e=>e.message==='validation'));
