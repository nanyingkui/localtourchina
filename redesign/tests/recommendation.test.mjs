import test from 'node:test';
import assert from 'node:assert/strict';
import {restoreRecommendation,prepareRecommendation,recommendationPrice,validateRecommendationDetails,recommendationUrl,validRecommendationDate} from '../src/recommendation.mjs';
import {inquiryText} from '../src/consultation.mjs';
import {submitInquiry} from '../src/production.mjs';
const now=new Date(2026,9,15,12);
const valid=()=>({...restoreRecommendation(),'people':'4',date:'2026-11-20',dateMode:'exact',contact:'TEST-RECOMMENDED-NO-CONTACT'});
test('a recommendation never turns an example party or old service configuration into customer choices',()=>{
 const draft=restoreRecommendation({people:'2',date:'2026-10-01',dateMode:'exact',services:['vehicle'],consent:true,contact:'keep-my-id',configuration:{inquiryText:'old service'}});
 assert.equal(draft.people,'');assert.equal(draft.date,'');assert.equal(draft.dateMode,'unknown');assert.equal(draft.contact,'keep-my-id');assert.equal(draft.configuration,null);assert.equal(draft.consent,false);assert.equal(draft.recommendation.requestPackage,false);
 assert.ok(validateRecommendationDetails(draft,now).people);
});
test('returning to the recommendation keeps actual details and preferences while clearing consent',()=>{
 const draft=valid();draft.recommendation.lessWalking=true;draft.notes='Use fewer steps';draft.consent=true;
 const restored=restoreRecommendation(draft,'regular45');
 assert.equal(restored.people,'4');assert.equal(restored.date,'2026-11-20');assert.equal(restored.notes,draft.notes);assert.equal(restored.contact,draft.contact);assert.equal(restored.recommendation.lessWalking,true);assert.equal(restored.recommendation.routeId,'regular45');assert.equal(restored.consent,false);
});
test('advice-only is the default, with a qualified package reference and a computed end date',()=>{
 const draft=prepareRecommendation(valid(),'ko');
 assert.deepEqual(draft.services,['help']);assert.equal(draft.mode,'help');assert.equal(draft.configuration.endDate,'2026-11-23');assert.equal(draft.configuration.referencePriceKRW,870000);assert.match(draft.configuration.inquiryText,/유료 서비스 선택 없음/);assert.match(draft.configuration.inquiryText,/항공권/);
 const two={...valid(),people:'2'};assert.equal(recommendationPrice(two),970000);assert.equal(recommendationPrice({...two,people:'3'}),null);
});
test('changed walking or children remove the numerical guide price instead of reusing an uncosted quote',()=>{
 for(const key of ['lessWalking','withChildren']){
  const draft=valid();draft.recommendation[key]=true;
  const prepared=prepareRecommendation(draft,'ko');assert.equal(prepared.configuration.referencePriceKRW,null);assert.match(prepared.configuration.inquiryText,/별도/);assert.doesNotMatch(prepared.configuration.inquiryText,/870,000|970,000/);
 }
});
test('a package quote needs an explicit request and still does not carry consent or booking confirmation',()=>{
 const draft=valid();draft.recommendation.requestPackage=true;draft.consent=true;
 const result=prepareRecommendation(draft,'zh');assert.deepEqual(result.services,['private']);assert.equal(result.consent,false);assert.match(result.configuration.inquiryText,/并非同意购买/);assert.equal(draft.consent,true);
});
test('all three languages preserve route context, undecided dates and all customer details',()=>{
 for(const lang of ['ko','zh','en']){
  const draft=valid();draft.dateMode='unknown';draft.date='';draft.notes='TEST MOBILITY REQUEST';
  const result=prepareRecommendation(draft,lang);assert.equal(result.configuration.endDate,'');assert.equal(result.configuration.sourcePath,recommendationUrl(lang,'regular34'));assert.deepEqual(validateRecommendationDetails(result,now),{});
  const message=inquiryText(result,'',lang,true);assert.ok(message.includes(draft.contact));assert.ok(message.includes(draft.notes));assert.ok(message.includes(result.configuration.productTitle));assert.ok(message.includes('4'));
 }
});
test('the existing production endpoint receives one complete recommended inquiry without another form',async()=>{
 const prepared={...prepareRecommendation(valid(),'ko'),consent:true};let calls=0,payload;
 const receipt=await submitInquiry(prepared,'ko',{url:'https://example.test',key:'public-test-key'},async(url,options)=>{calls++;payload=JSON.parse(options.body);assert.match(url,/create_public_inquiry$/);return{ok:true,json:async()=>[{reference:'LTC-20261015-TEST01',access_token:'11111111-2222-3333-4444-555555555555'}]};});
 assert.equal(calls,1);assert.equal(payload.p_service,'help');assert.equal(payload.p_contact,prepared.contact);assert.match(payload.p_inquiry_text,/2026-11-20/);assert.match(payload.p_inquiry_text,/4명/);assert.ok(payload.p_inquiry_text.includes(prepared.configuration.productTitle));assert.equal(receipt.productionSubmitted,true);
});
test('homepage party choice overrides an older draft and travels to consultation without extra entry',()=>{
 const previous=valid();
 const href=recommendationUrl('ko','regular45','details','6');
 const q=new URL(href,'https://localtourchina.com').searchParams;
 const carried=restoreRecommendation(previous,q.get('route'),q.get('party'));
 assert.equal(carried.people,'6');assert.equal(carried.contact,previous.contact);assert.equal(carried.recommendation.routeId,'regular45');
 assert.equal(recommendationPrice(carried),950000);
 assert.equal(restoreRecommendation(previous,'regular34','3').people,'3');
 assert.equal(recommendationPrice(restoreRecommendation(previous,'regular34','3')),null);
 for(const invalid of ['0','31','2.5','-1','<script>'])assert.ok(!recommendationUrl('ko','regular34','details',invalid).includes('&party='));
});

test('homepage date, duration and party are carried together; choosing unknown clears an old date',()=>{
 for(const lang of ['ko','zh','en']){
  const q=new URL(recommendationUrl(lang,'regular56','details','6','2026-11-20'),'https://localtourchina.com').searchParams;
  const restored=restoreRecommendation(valid(),q.get('route'),q.get('party'),q.get('departure'));
  assert.equal(restored.date,'2026-11-20');assert.equal(restored.dateMode,'exact');assert.equal(restored.people,'6');
  const prepared=prepareRecommendation(restored,lang);assert.equal(prepared.configuration.endDate,'2026-11-25');assert.equal(prepared.configuration.productId,'regular56');
 }
 assert.equal(restoreRecommendation(valid(),'regular34','4','unknown').dateMode,'unknown');
 assert.equal(restoreRecommendation(valid(),'regular34','4','unknown').date,'');
 for(const invalid of ['2026-02-30','2026-13-01','broken'])assert.equal(validRecommendationDate(invalid),'');
 assert.equal(recommendationPrice(restoreRecommendation(valid(),'regular34','4')),870000);
 assert.equal(recommendationPrice(restoreRecommendation(valid(),'regular45','4')),970000);
 assert.equal(recommendationPrice(restoreRecommendation(valid(),'regular56','4')),1130000);
});
