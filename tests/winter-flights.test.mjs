import test from 'node:test';
import assert from 'node:assert/strict';
await import('../assets/winter-flights.js');
const {departureEpoch,isExpired,getPrefill,partition}=globalThis.LTCFlights;
const f={id:'example',origin:'ICN',tripDays:6,outbound:{departTime:'2026-12-22 19:15:00',arriveTime:'2026-12-22 22:20:00',segments:[{flightNo:'KE163'}]},return:{departTime:'2026-12-26 23:40:00',arriveTime:'2026-12-27 03:40:00',segments:[{flightNo:'KE164'}]}};
test('expiry uses Korean departure instant, regardless of visitor timezone',()=>{assert.equal(departureEpoch(f),Date.parse('2026-12-22T10:15:00Z'));assert.equal(isExpired(f,departureEpoch(f)-1),false);assert.equal(isExpired(f,departureEpoch(f)),true);assert.equal(isExpired(f,Date.parse('2026-12-23T00:00:00Z')),true);});
test('expired and unknown links cannot populate a new itinerary',()=>{assert.equal(getPrefill([f],f.id,departureEpoch(f)),null);assert.equal(getPrefill([f],'constructor',0),null);assert.equal(getPrefill([f],'unknown',0),null);});
test('overnight Korea arrival does not change Zhangjiajie departure date',()=>{assert.deepEqual(getPrefill([f],f.id,0),{start:'2026-12-22',arrival:'22:20',arrivalNo:'KE163',end:'2026-12-26',departure:'23:40',departureNo:'KE164'});});
test('expiry reclassifies records without losing filters or historical data',()=>{assert.deepEqual(partition([f],{airport:'CJJ'},0),{active:[],expired:[]});assert.equal(partition([f],{month:'12',days:'6',direct:true},0).active.length,1);assert.equal(partition([f],{month:'12'},departureEpoch(f)).expired.length,1);assert.equal(partition([f],{},departureEpoch(f)).active.length,0);});
test('connecting arrival flight number is the segment that lands in Zhangjiajie',()=>{const c=structuredClone(f);c.outbound.segments=[{flightNo:'FIRST'},{flightNo:'SECOND'}];assert.equal(getPrefill([c],c.id,0).arrivalNo,'SECOND');assert.equal(partition([c],{direct:true},0).active.length,0);});

test('published corpus has unique valid round trips and matching Trip.com search links',async()=>{
 const {readFile}=await import('node:fs/promises');
 const data=JSON.parse(await readFile(new URL('../src/winter-flights.json',import.meta.url),'utf8'));
 const ids=new Set(),journeys=new Set();
 for(const item of data.itineraries){
  assert.ok(!ids.has(item.id),`duplicate id: ${item.id}`);ids.add(item.id);
  const key=JSON.stringify([item.outbound.segments,item.return.segments]);assert.ok(!journeys.has(key),`duplicate journey: ${item.id}`);journeys.add(key);
  const first=item.outbound.segments[0],last=item.return.segments.at(-1);
  assert.equal(first.departAirport,item.origin);assert.equal(last.arriveAirport,item.origin);
  assert.equal(item.outbound.segments.at(-1).arriveAirport,'DYG');assert.equal(item.return.segments[0].departAirport,'DYG');
  for(const [name,startOffset,endOffset] of [['outbound','+09:00','+08:00'],['return','+08:00','+09:00']]){
   const leg=item[name];const elapsed=(Date.parse(leg.arriveTime.replace(' ','T')+endOffset)-Date.parse(leg.departTime.replace(' ','T')+startOffset))/60000;
   assert.equal(leg.duration,elapsed);assert.ok(elapsed>0&&elapsed<=360);assert.ok(leg.segments.length<=2);
  }
  const days=(Date.parse(item.return.arriveTime.slice(0,10))-Date.parse(item.outbound.departTime.slice(0,10)))/86400000+1;
  assert.equal(item.tripDays,days);assert.ok(days>=2&&days<=6);
  const url=new URL(item.bookingUrl);assert.equal(url.protocol,'https:');assert.ok(url.hostname.endsWith('.trip.com'));
  assert.ok([item.origin,...(['ICN','GMP'].includes(item.origin)?['SEL']:[])].includes(url.searchParams.get('dcity')));
  assert.deepEqual(url.searchParams.get('topflightno').split(','),[...item.outbound.segments,...item.return.segments].map(s=>s.flightNo));assert.equal(url.searchParams.get('acity'),'DYG');assert.equal(url.searchParams.get('triptype'),'RT');
  assert.equal(url.searchParams.get('ddate'),item.outbound.departTime.slice(0,10));assert.equal(url.searchParams.get('rdate'),item.return.departTime.slice(0,10));
 }
 assert.equal(Object.values(data.coverage.matchedItinerariesByAirport).reduce((a,b)=>a+b,0),data.itineraries.length);
});
