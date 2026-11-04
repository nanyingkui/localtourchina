import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPackage,packageParty,arrivalVersion} from '../src/package-request.mjs';
import {recommendedRoute,restoreRecommendation,prepareRecommendation,validateRecommendationDetails} from '../src/recommendation.mjs';
import {inquiryText} from '../src/consultation.mjs';
const now=new Date(2026,10,4,12);
const fixture=(route='regular34',people='3',time='12:59')=>{const d=restoreRecommendation({},route,people,'2026-12-10');d.contact='LOCAL-TEST';d.recommendation.arrivalTime=time;return d;};
test('13:00 boundary changes the actual four-day scope and prevents reuse of the early price',()=>{
 for(const time of ['00:00','12:59']){const d=fixture('regular34','3',time),a=assessPackage(d,recommendedRoute('regular34'),'zh');assert.equal(arrivalVersion(d),'early');assert.equal(a.price,970000);assert.match(a.itinerary[2],/黄龙洞.*大峡谷/);assert.doesNotMatch(a.itinerary.join('\n'),/晚到版/);}
 for(const time of ['13:00','13:01','23:59']){const d=fixture('regular34','3',time),a=assessPackage(d,recommendedRoute('regular34'),'zh');assert.equal(a.version,'late');assert.equal(a.price,null);assert.match(a.itinerary[0],/休息.*次日/);assert.match(a.itinerary[2],/森林公园/);assert.ok(a.pending.some(x=>/延长/.test(x)));}
 const a=assessPackage(fixture('regular34','3',''),recommendedRoute('regular34'),'zh');assert.equal(a.version,'unknown');assert.equal(a.price,null);assert.match(a.arrivalLabel,/暂按/);
});
test('adults are derived from the total; child ages go to both structured and readable handoff without adult price',()=>{
 for(const lang of ['ko','zh','en']){
  const d=fixture();d.recommendation.childrenCount='2';d.recommendation.childrenAges=['0','7'];
  assert.deepEqual(packageParty(d),{total:3,adults:1,children:2,ages:['0','7'],valid:true});
  assert.deepEqual(validateRecommendationDetails(d,now,lang),{});
  const ready=prepareRecommendation(d,lang),c=ready.configuration,text=inquiryText(ready,'TEST',lang,true);
  assert.deepEqual(ready.services,['private']);assert.equal(c.adults,1);assert.equal(c.children,2);assert.deepEqual(c.childrenAges,['0','7']);assert.equal(c.arrivalTime,'12:59');assert.equal(c.referencePriceKRW,null);assert.ok(text.includes('0, 7'));assert.ok(text.includes('12:59'));assert.doesNotMatch(text,/970,000|870,000/);assert.equal(ready.consent,false);
 }
});
test('invalid child totals and missing or out-of-range ages cannot pass the review boundary',()=>{
 for(const count of ['','-1','1.5','4','30','NaN']){const d=fixture();d.recommendation.childrenCount=count;assert.ok(validateRecommendationDetails(d,now).childrenCount);}
 for(const age of ['','-1','18','1.5']){const d=fixture();d.recommendation.childrenCount='1';d.recommendation.childrenAges=[age];assert.ok(validateRecommendationDetails(d,now).childrenAges);}
 const d=fixture('regular56','30');d.recommendation.childrenCount='29';d.recommendation.childrenAges=Array(29).fill('7');assert.deepEqual(validateRecommendationDetails(d,now),{});
});
test('unknown arrival is allowed; malformed times are not silently treated as confirmed schedules',()=>{
 assert.deepEqual(validateRecommendationDetails(fixture('regular34','3',''),now),{});
 for(const time of ['24:00','12:60','9:00','bad'])assert.ok(validateRecommendationDetails(fixture('regular34','3',time),now).arrivalTime);
});
test('five-day Furong remains a requoted option; six-day Furong remains in the package route',()=>{
 for(const lang of ['ko','zh','en']){
  const five=fixture('regular45'),six=fixture('regular56');
  const a=assessPackage(five,recommendedRoute('regular45'),lang),b=assessPackage(six,recommendedRoute('regular56'),lang);
  assert.equal(a.price,1130000);assert.equal(b.price,1360000);assert.equal(a.itinerary.length,5);assert.equal(b.itinerary.length,6);
  assert.equal(prepareRecommendation(five,lang).configuration.itinerary[3],a.itinerary[3]);
 }
 const a=assessPackage(fixture('regular45'),recommendedRoute('regular45'),'zh');assert.match(a.itinerary[3],/可选.*重新报价/);assert.ok(a.pending.some(x=>/基础参考价之外/.test(x)));
 const b=assessPackage(fixture('regular56'),recommendedRoute('regular56'),'zh');assert.match(b.itinerary[4],/上午自由.*芙蓉镇/);
});
test('legacy child requests need a count rather than silently becoming adult-only quotes',()=>{
 const old=fixture();delete old.recommendation.childrenCount;old.recommendation.withChildren=true;old.recommendation.requestPackage=false;
 const restored=restoreRecommendation(old,'regular34','3');assert.equal(restored.recommendation.childrenCount,'');assert.ok(validateRecommendationDetails(restored,now).childrenCount);assert.equal(restored.recommendation.requestPackage,true);
});
