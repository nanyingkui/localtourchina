import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../assets/service-validation.js',import.meta.url),'utf8');
function setup(lang='en'){
 const ids=new Map(),selectors=new Map();
 const document={documentElement:{lang},body:{dataset:{}},getElementById:id=>ids.get(id)||null,querySelector:s=>selectors.get(s)?.[0]||(/^#[\w-]+$/.test(s)?ids.get(s.slice(1)):null)||null,querySelectorAll:s=>selectors.get(s)||[],addEventListener(){}};
 const context={window:{},document,Intl,Date,Set,Number,queueMicrotask(){},location:{pathname:'/vehicles.html'},sessionStorage:{setItem(){}}};
 vm.runInNewContext(code,context);
 const input=(id,value='',extra={})=>{const el={id,value:String(value),...extra};ids.set(id,el);return el;};
 const select=(s,...els)=>selectors.set(s,els);
 return {api:context.window.LTCValidation,input,select,ids,document};
}
const now=new Date('2026-10-10T15:59:59Z');
const keys=issues=>Array.from(issues,x=>x.key);
function vehicle(lang='ko') {const x=setup(lang);for(const [id,v]of Object.entries({vehicleDate:'2026-10-10',vehicleTime:'10:00',vehiclePickup:'Airport',vehicleDropoff:'Hotel',vehiclePeople:2,vehicleLuggage:2,vehicleHours:8}))x.input(id,v);return x;}
for(const lang of ['ko','zh-CN','en'])test(`vehicle numeric/date validation: ${lang}`,()=>{
 const x=vehicle(lang);assert.equal(x.api.collect('vehicle',now).length,0);
 for(const v of ['',0,-1,2.5]){x.ids.get('vehiclePeople').value=String(v);assert.ok(keys(x.api.collect('vehicle',now)).includes('positive'));}
 x.ids.get('vehiclePeople').value='99';assert.ok(keys(x.api.collect('vehicle',now)).includes('group'));
 x.ids.get('vehiclePeople').value='34';assert.equal(x.api.collect('vehicle',now).length,0);
 x.ids.get('vehicleDate').value='2020-01-01';assert.ok(keys(x.api.collect('vehicle',now)).includes('date'));
 x.ids.get('vehicleDate').value='2026-02-30';assert.ok(keys(x.api.collect('vehicle',now)).includes('date'));
});
test('China midnight boundary is independent of browser timezone',()=>{const x=vehicle();assert.equal(x.api.chinaToday(now),'2026-10-10');const midnight=new Date('2026-10-10T16:00:00Z');assert.equal(x.api.chinaToday(midnight),'2026-10-11');assert.ok(keys(x.api.collect('vehicle',midnight)).includes('date'));});
test('rental hours validate only the active service',()=>{const x=vehicle();x.ids.get('vehicleHours').value='99';x.select('#vehicleService input:checked',{value:'airport'});assert.equal(x.api.collect('vehicle',now).length,0);x.select('#vehicleService input:checked',{value:'rental'});assert.ok(keys(x.api.collect('vehicle',now)).includes('hours'));});
test('empty combo and every selected service are validated',()=>{const x=vehicle();for(const id of ['comboTicket','comboDay','comboGuide','comboVehicle'])x.input(id,'',{checked:false});assert.deepEqual(keys(x.api.collect('combo',now)),['choose']);x.ids.get('comboVehicle').checked=true;x.ids.get('vehiclePickup').value='';assert.ok(keys(x.api.collect('combo',now)).includes('required'));});
test('English requires group size and dates or an explicit undecided choice',()=>{const x=setup('en');x.select('section.inquiry',{});x.select('#dates',x.input('dates'));x.select('#people',x.input('people'));const undecided=x.input('datesUndecided','',{checked:false});x.select('#datesUndecided',undecided);assert.deepEqual(keys(x.api.collect('english',now)),['required','positive']);undecided.checked=true;x.ids.get('people').value='2';assert.equal(x.api.collect('english',now).length,0);x.ids.get('people').value='2.5';assert.deepEqual(keys(x.api.collect('english',now)),['positive']);});
test('guide rejects duplicate dates and impossible per-day hours',()=>{const x=setup('ko');const d=x.input('guideDate','2026-10-11');x.select('.guide-date',d,x.input('extraDate','2026-10-11'));for(const [id,v]of Object.entries({guideStartTime:'10:00',guideMeetingPlace:'Hotel',guideItinerary:'Forest',guidePeople:2,guideHours:99}))x.input(id,v);for(const id of ['guideStartTime','guideMeetingPlace','guideItinerary','guidePeople','guideHours'])x.select('#'+id,x.ids.get(id));assert.deepEqual(keys(x.api.collect('guide',now)),['duplicate','hours']);});
test('Sanya date and minimum party rules apply',()=>{const x=setup('ko');const date=x.input('dayDate','2026-10-10'),count=x.input('count',1,{max:'30'});x.select('#dayDate',date);x.select('#dayAgeRows .day-count',count);x.select('input[name="dayProduct"]:checked',{value:'sanya-monkey'});x.select('#dayMeeting',x.input('dayMeeting','Meeting point'));assert.deepEqual(keys(x.api.collect('daytour',now)),['tomorrow','twoPeople']);date.value='2026-10-11';count.value='2';assert.equal(x.api.collect('daytour',now).length,0);});
test('private request requires ordered dates and positive people/rooms',()=>{const x=setup('ko');for(const [id,v]of Object.entries({privateStart:'2026-10-11',privateEnd:'2026-10-11',privatePeople:0,privateRooms:0,privateSingles:0})){const el=x.input(id,v);x.select('#'+id,el);}assert.deepEqual(keys(x.api.collect('private',now)),['end','positive','positive']);});
test('configured copy/continue pages load the shared validator',()=>{for(const name of ['site-template.html','english-template.html'])assert.match(readFileSync(new URL('../src/'+name,import.meta.url),'utf8'),/assets\/service-validation\.js/);assert.match(readFileSync(new URL('../redesign/public/assets/redesign.js',import.meta.url),'utf8'),/LTCValidation\.validate/);});

test('English generic inquiry renders only one estimate notice and clears it after correction',()=>{
 const x=setup('en'),notices=[];
 const scope={dataset:{},querySelectorAll:()=>[],querySelector:()=>null,prepend(el){notices.push(el);x.ids.set(el.id,el);}};
 x.document.createElement=()=>({setAttribute(){}});
 x.select('section.inquiry',scope);
 x.select('#people',x.input('people',''));x.select('#dates',x.input('dates','December'));
 x.api.refresh();assert.equal(notices.length,1);assert.equal(notices[0].hidden,false);
 x.ids.get('people').value='2';x.api.refresh();assert.equal(notices.length,1);assert.equal(notices[0].hidden,true);
});
