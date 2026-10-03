import test from 'node:test';
import assert from 'node:assert/strict';
await import('../assets/winter-flights.js');
const {departureEpoch,isExpired,getPrefill,partition}=globalThis.LTCFlights;
const f={id:'example',origin:'ICN',tripDays:6,localNights:4,outbound:{departTime:'2026-12-22 19:15:00',arriveTime:'2026-12-22 22:20:00',segments:[{flightNo:'KE163'}]},return:{departTime:'2026-12-26 23:40:00',arriveTime:'2026-12-27 03:40:00',segments:[{flightNo:'KE164'}]}};
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
  const dest=item.destination||'DYG';assert.equal(item.outbound.segments.at(-1).arriveAirport,dest);assert.equal(item.return.segments[0].departAirport,dest);
  for(const [name,startOffset,endOffset] of [['outbound','+09:00','+08:00'],['return','+08:00','+09:00']]){
   const leg=item[name];const elapsed=(Date.parse(leg.arriveTime.replace(' ','T')+endOffset)-Date.parse(leg.departTime.replace(' ','T')+startOffset))/60000;
   assert.equal(leg.duration,elapsed);assert.ok(elapsed>0&&elapsed<=360);assert.ok(leg.segments.length<=2);
  }
  const days=(Date.parse(item.return.arriveTime.slice(0,10))-Date.parse(item.outbound.departTime.slice(0,10)))/86400000+1;
  assert.equal(item.tripDays,days);assert.ok(days>=3&&days<=6);
  const nights=item.gatewayPlan?(Date.parse(item.gatewayPlan.zjjDepartureDate)-Date.parse(item.gatewayPlan.zjjArrivalDate))/86400000:(Date.parse(item.return.departTime.slice(0,10))-Date.parse(item.outbound.arriveTime.slice(0,10)))/86400000;assert.equal(item.localNights,nights);assert.ok(nights>=2);
  const url=new URL(item.bookingUrl);assert.equal(url.protocol,'https:');assert.ok(url.hostname.endsWith('.trip.com'));
  assert.ok([item.origin,...(['ICN','GMP'].includes(item.origin)?['SEL']:[])].includes(url.searchParams.get('dcity')));
  assert.deepEqual(url.searchParams.get('topflightno').split(','),[...item.outbound.segments,...item.return.segments].map(s=>s.flightNo));assert.equal(url.searchParams.get('acity'),dest);assert.equal(url.searchParams.get('triptype'),'RT');
  assert.equal(url.searchParams.get('ddate'),item.outbound.departTime.slice(0,10));assert.equal(url.searchParams.get('rdate'),item.return.departTime.slice(0,10));
 }
 assert.equal(Object.values(data.coverage.matchedItinerariesByAirport).reduce((a,b)=>a+b,0),data.itineraries.length);
});

test('minimum stay excludes one-night trips even with next-day Korea arrival',()=>{const short={...f,localNights:1,tripDays:3};assert.equal(partition([short],{},0).active.length,0);assert.equal(getPrefill([short],short.id,0),null);const minimum={...f,localNights:2,tripDays:3};assert.equal(partition([minimum],{},0).active.length,1);assert.ok(getPrefill([minimum],minimum.id,0));});

test('gateway airport times never prefill a Zhangjiajie airport pickup',()=>{const gateway={...f,destination:'CSX'};assert.equal(getPrefill([gateway],gateway.id,0),null);assert.equal(partition([gateway],{destination:'DYG'},0).active.length,0);assert.equal(partition([gateway],{destination:'CSX'},0).active.length,1);});
test('gateway railway plans reserve the arrival night and the return buffer day',async()=>{const {readFile}=await import('node:fs/promises');const data=JSON.parse(await readFile(new URL('../src/winter-flights.json',import.meta.url),'utf8'));for(const f of data.itineraries.filter(f=>f.gatewayPlan)){const g=f.gatewayPlan;assert.equal(Date.parse(g.zjjArrivalDate)-Date.parse(f.outbound.arriveTime.slice(0,10)),86400000);assert.equal(Date.parse(f.return.departTime.slice(0,10))-Date.parse(g.zjjDepartureDate),86400000);assert.ok(f.localNights>=2);assert.equal(g.railStatus,'estimated-not-booked');}});
