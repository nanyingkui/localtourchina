import test from 'node:test';import assert from 'node:assert/strict';
import {findTrip,getTripPrice,catalogInquiry,catalogTerms} from '../src/trip-catalog.mjs';
import {prepareRecommendation,restoreRecommendation} from '../src/recommendation.mjs';
test('owner-confirmed classic inclusions and sole-use room survive every-language handoff',()=>{
 for(const route of ['regular34','regular45','regular56'])for(const lang of ['ko','zh','en']){
  const trip=findTrip(route),text=catalogInquiry(trip,3,lang),terms=catalogTerms(trip,lang);
  assert.ok(text.includes(terms.hotels));assert.ok(text.includes(terms.meals));assert.ok(text.includes(terms.inclusionNote));
  assert.match(text,/13:00/);assert.match(text,/80/);assert.doesNotMatch(text,/Homeinn|如家精选|홈 인 플러스/);
  const draft=restoreRecommendation({},route,'3');draft.recommendation.arrivalTime='12:00';const prepared=prepareRecommendation(draft,lang);
  assert.equal(prepared.configuration.people,'3');assert.equal(prepared.configuration.referencePriceKRW,getTripPrice(trip,2));
  assert.ok(prepared.configuration.inquiryText.includes(terms.included));
 }
});
test('five-day Furong is an explicitly requoted option; six-day route reserves its morning and cave-canyon day',()=>{
 const five=findTrip('regular45'),six=findTrip('regular56');
 assert.match(five.copy.zh.itinerary[3],/芙蓉镇.*需核价/);
 assert.match(five.copy.zh.itinerary[4],/晚到.*6天5晚/);
 assert.match(six.copy.zh.itinerary[1],/上午市区.*下午天门山/);
 assert.match(six.copy.zh.itinerary[3],/黄龙洞.*大峡谷/);
 assert.match(six.copy.zh.itinerary[4],/上午自由.*下午.*芙蓉镇/);
 assert.equal(getTripPrice(five,3),1130000);assert.equal(getTripPrice(six,3),1360000);
 const trek=findTrip('trek34');assert.equal(getTripPrice(trek,3),null);assert.doesNotMatch(catalogTerms(trek,'en').hotels,/sole.use/);
});
