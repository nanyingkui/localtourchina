import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {renderComparison} from '../brand-upgrade/comparison.mjs';
import {enhanceInquiry} from '../brand-upgrade/inquiry.mjs';
import {renderEvidence,renderStandards,renderTeam,renderBooking} from '../brand-upgrade/evidence.mjs';

const root=path.resolve(import.meta.dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const catalog=JSON.parse(read('catalog-site/catalog.json'));
const ids=['34','45','56','56fh','45furong','experience45','trek34','trek45','trek56'];
const assetBase=read('index.html').match(/\/assets\/notebook\/[a-f0-9]+\//)[0];
const payload=html=>JSON.parse(html.match(/<script type="application\/json" data-trip-comparison-data>([\s\S]*?)<\/script>/)[1]);
const scripts=html=>[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(match=>match[0]);
const withoutEd=html=>html.replace(/<!-- ed-inquiry:([\w-]+):start -->[\s\S]*?<!-- ed-inquiry:\1:end -->/g,'');
const form=html=>html.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
const decodeAttr=value=>value.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

for(const lang of ['ko','zh','en']){
 const prefix=lang==='ko'?'':lang+'/';
 test(`${lang} homepage connects real travel identity, full inventory and explicit inquiry`,()=>{
  const html=read(prefix+'index.html');
  assert.match(html,/<main class="ed-home">/);
  assert.match(html,/<h1>[\s\S]*?(?:장가계|张家界|Zhangjiajie)[\s\S]*?<\/h1>/);
  const primary=html.match(/<a\b[^>]*class="primary ed-primary"[^>]*>/)?.[0];
  assert.ok(primary?.includes(`href="/${prefix}consultation.html?trip=custom"`));
  assert.ok(html.includes(`href="/${prefix}trips.html#all-trips"`));
  assert.ok(html.includes('id="all-trips"'));
  for(const id of ['service-standards','people','real-stories','before-booking'])assert.equal([...html.matchAll(new RegExp(`id="${id}"`,'g'))].length,1,id+' appears once');
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.doesNotMatch(main,/ratingValue|reviewCount|aggregateRating|countdown|data-fake/i,'no manufactured popularity or scarcity');
  assert.doesNotMatch(html,/남영규|南英奎|Nan Yingkui|Namyongyu/i,'homepage routes questions through the brand');
  assert.doesNotMatch(html,/s9mISSLq3T8|3Wweqoj_VnU|QLHuR3bpktc/,'withdrawn route guides stay off the homepage');
  assert.ok(main.includes('https://www.youtube.com/@Lctch/videos'));
  assert.ok(main.includes('https://cafe.naver.com/lotocha'));
 });

 test(`${lang} comparison preserves nine public products, local routes and catalogue pricing`,()=>{
  const snapshot=JSON.stringify(catalog);
  const rendered=renderComparison(lang,{catalog,assetBase});
  const data=payload(rendered);
  assert.deepEqual(data.records.map(record=>record.id).sort(),[...ids].sort());
  assert.equal(JSON.stringify(catalog),snapshot,'rendering cannot rewrite the reviewed catalogue');
  for(const record of data.records){
   assert.ok(record.href.startsWith('/'+prefix),record.id+' keeps its language');
   assert.ok(fs.existsSync(path.join(root,record.href.slice(1))),record.id+' detail exists');
   assert.ok(fs.existsSync(path.join(root,record.image.replace(/^\//,''))),record.id+' photo exists');
   assert.doesNotMatch(read(record.href.slice(1)),/http-equiv=["']refresh/i,'detail avoids a legacy redirect');
   for(const privateField of ['customer','email','phone','passport','payment','cost','profit','pricing'])assert.ok(!Object.hasOwn(record,privateField),'comparison metadata does not contain '+privateField);
  }
  assert.equal(data.records.find(record=>record.id==='experience45').href,`/${prefix}zhangjiajie.html`);
  assert.equal(data.records.find(record=>record.id==='34').href,`/${prefix}zhangjiajie-4days.html`);
  assert.equal(data.records.find(record=>record.id==='56').href,`/${prefix}zhangjiajie-6days.html`);
  assert.equal((rendered.match(/<li\b/g)||[]).length,9);
  const current=read(prefix+'trips.html');
  assert.deepEqual(payload(current).records,data.records,'the shipped page uses the current presentation records');
 });

 for(const name of ['consultation.html','service-consultation.html'])test(`${prefix+name} retains the original form and full handoff scripts`,()=>{
  const current=read(prefix+name);
  const before=withoutEd(current);
  const enhanced=enhanceInquiry(before,lang);
  assert.equal(enhanceInquiry(enhanced,lang),enhanced,'enhancement is idempotent');
  assert.equal(form(enhanced),form(before),'input names, requirements and detailed selections stay untouched');
  assert.deepEqual(scripts(enhanced),scripts(before),'contact boundary, validation and message scripts stay untouched');
  assert.equal((enhanced.match(/id="ed-inquiry-expect-title"/g)||[]).length,1);
  assert.equal((enhanced.match(/id="ed-inquiry-pending-title"/g)||[]).length,1);
  const expected={ko:'https://pf.kakao.com/_hvrmn/chat',zh:'/zh/travel-safety.html?channel=wechat',en:'https://wa.me/821055722601'}[lang];
  assert.ok(enhanced.includes(`data-contact href="${expected}"`));
  assert.match(enhanced,/data-contact|contact-gate\.js/);
  if(name==='consultation.html'){
   assert.match(form(enhanced),/name="dates"/);
   assert.match(form(enhanced),/name="room"/);
   assert.match(form(enhanced),/name="arrival"/);
   assert.match(form(enhanced),/name="departure"/);
   // The existing family-rule runtime still owns required child counts, ages,
   // bed needs and real vehicle capacity. Presentation cannot replace it.
   assert.match(enhanced,/family-rule\.js/);
  }
  const words={ko:'아직 보내지 않은 문의입니다',zh:'这份咨询还没有发送',en:'This inquiry has not been sent yet'};
  assert.ok(enhanced.includes(words[lang]));
 });

 test(`${lang} trust sections retain original cases and clear service boundaries`,()=>{
  const evidence=renderEvidence(lang,{assetBase});
  const source=JSON.parse(read('src/reviews.json'));
  const sourceLinks=[...evidence.matchAll(/href="([^"]+)"/g)].map(match=>decodeAttr(match[1]));
  assert.deepEqual([...evidence.matchAll(/data-review-id="([^"]+)"/g)].map(match=>match[1]),['128','245','212']);
  for(const id of ['128','245','212']){
   const review=source.find(review=>review.id===id);
   assert.equal(review.kind,'review');
   assert.equal(review.classification,'guest_travel_story');
   assert.ok(sourceLinks.includes(review.sourceUrl),'the original published case is linked');
  }
  assert.doesNotMatch(evidence,/aggregateRating|ratingValue|reviewCount|★|★★★★★/);
  const booking=renderBooking(lang);
  assert.match(booking,/<details class="ed-confirmation-details">/);
  assert.doesNotMatch(booking,/(?:₩|\$)\s*[\d,]+/,'the illustrative checklist does not invent a quote');
  assert.ok(booking.includes(`/${prefix}consultation.html?trip=custom`));
  assert.ok(renderTeam(lang,{assetBase}).includes(`/${prefix}${lang==='ko'?'korean-guide':'local-guide'}.html`));
  assert.equal((renderStandards(lang).match(/<li>/g)||[]).length,4);
 });
}

test('reviewed product export is intact and exactly hash-verified',()=>{
 const manifest=JSON.parse(read('catalog-site/export-manifest.json'));
 assert.equal(crypto.createHash('sha256').update(read('catalog-site/catalog.json')).digest('hex'),manifest.sha256);
 assert.deepEqual(JSON.parse(read('customer-catalog.json')),catalog,'runtime public data and reviewed source remain identical');
});

test('the actual brand builder produces identical files on repeat without changing protected inputs',()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'ltc-brand-idempotence-'));
 const copy=relative=>{
  const target=path.join(fixture,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(path.join(root,relative),target);
 };
 const manifest=JSON.parse(read('public-release-manifest.json'));
 const inputs=[...manifest.filter(file=>file.endsWith('.html')),
  'public-release-manifest.json','catalog-site/catalog.json','src/reviews.json',
  'redesign/notebook/ko/multiday-directory.html.inc','scripts/build-brand-upgrade.mjs',
  ...fs.readdirSync(path.join(root,'redesign/brand-upgrade')).map(file=>'redesign/brand-upgrade/'+file)];
 const digest=()=>{
  const hashes={};
  const visit=relative=>{
   for(const item of fs.readdirSync(path.join(fixture,relative),{withFileTypes:true})){
    const file=path.join(relative,item.name);
    if(item.isDirectory())visit(file);
    else hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(fixture,file))).digest('hex');
   }
  };
  visit('');return hashes;
 };
 try{
  inputs.forEach(copy);
  const before=digest();
  const build=()=>{
   const result=spawnSync(process.execPath,['scripts/build-brand-upgrade.mjs'],{cwd:fixture,encoding:'utf8'});
   assert.equal(result.status,0,result.stderr);
  };
  build();const first=digest();build();assert.deepEqual(digest(),first,'a second build must not append wrappers, content, classes or assets');
  const protectedInputs=inputs.filter(file=>/^(?:admin(?:\/|\.)|app\/|travel-planner\/)|(?:^|\/)(?:account|login|status|inquiry-status|configure|legacy-flow)\.html$/.test(file));
  protectedInputs.push('catalog-site/catalog.json','src/reviews.json');
  for(const file of protectedInputs)assert.equal(first[file],before[file],file+' stays byte-for-byte unchanged');
 }finally{fs.rmSync(fixture,{recursive:true,force:true});}
});

// Exercise the shipped browser controller with real SSR metadata. These nodes
// model only platform operations, not the filter/selection implementation.
function controller(search=''){
 const data=payload(renderComparison('en',{catalog,assetBase}));
 class Node{
  constructor(){this.listeners={};this.dataset={};this.attributes={};this.hidden=false;this.disabled=false;this.textContent='';this.innerHTML='';this.classList={toggle(){}};}
  addEventListener(name,handler){this.listeners[name]=handler;}
  setAttribute(name,value){this.attributes[name]=value;}
  dispatchEvent(){}
  focus(){this.focused=true;}
  scrollIntoView(){this.scrolled=true;}
  trigger(name){this.listeners[name]?.({target:this});}
 }
 const cards=data.records.map(record=>Object.assign(new Node(),{dataset:{tripTags:record.tags.join(' ')}}));
 const checks=data.records.map((record,index)=>Object.assign(new Node(),{value:record.id,checked:false,closest:()=>cards[index]}));
 const buttons=['all','core','forest','town','trek'].map(key=>Object.assign(new Node(),{dataset:{tripFilter:key}}));
 const selectors=['[data-trip-filter-status]','[data-compare-selected-status]','[data-compare-open]','[data-compare-clear]','[data-compare-feedback]','[data-compare-table-section]','[data-compare-table]','#trip-compare-table-title','[data-compare-empty]','[data-trip-filter-reset]','[data-compare-close]'];
 const nodes=new Map(selectors.map(selector=>[selector,new Node()]));
 nodes.get('[data-compare-table-section]').hidden=true;
 nodes.set('[data-trip-comparison-data]',{textContent:JSON.stringify(data)});
 const section=Object.assign(new Node(),{
  querySelector:selector=>nodes.get(selector),
  querySelectorAll:selector=>({'[data-compare-trip]':cards,'[data-compare-select]':checks,'[data-trip-filter]':buttons})[selector]||[],
 });
 const location={href:'https://localtourchina.com/trips.html'+search+'#all-trips',search};
 const listeners={};
 const sandbox={document:{querySelectorAll:()=>[section]},location,URL,URLSearchParams,CustomEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}},history:{state:null,replaceState(_state,_title,url){location.href=String(url);location.search=new URL(url).search;}},window:{addEventListener(type,handler){listeners[type]=handler;},matchMedia(){return {matches:true};}},Set,Map,JSON,String};
 vm.runInNewContext(read('redesign/brand-upgrade/comparison.js'),sandbox);
 return {data,cards,checks,buttons,nodes,section,location,listeners};
}

test('comparison starts with all nine trips and honours only a known preference',()=>{
 for(const search of ['', '?style=unknown']){
  const c=controller(search);
  assert.equal(c.cards.filter(card=>!card.hidden).length,9);
  assert.equal(c.section.dataset.activeTripFilter,'all');
 }
 const c=controller('?style=town&reference=keep');
 assert.deepEqual(c.cards.map(card=>!card.hidden),c.data.records.map(record=>record.tags.includes('town')));
 c.buttons.find(button=>button.dataset.tripFilter==='forest').trigger('click');
 assert.equal(new URL(c.location.href).searchParams.get('reference'),'keep');
 assert.equal(new URL(c.location.href).searchParams.get('style'),'forest');
 assert.equal(new URL(c.location.href).hash,'#all-trips');
 c.nodes.get('[data-trip-filter-reset]').trigger('click');
 assert.equal(c.cards.filter(card=>!card.hidden).length,9);
 assert.equal(new URL(c.location.href).searchParams.has('style'),false);
});

test('comparison requires two selections, rejects the fourth, and clears completely',()=>{
 const c=controller();const open=c.nodes.get('[data-compare-open]');
 assert.equal(open.disabled,true);
 for(let i=0;i<4;i++){c.checks[i].checked=true;c.checks[i].trigger('change');}
 assert.equal(c.checks.filter(check=>check.checked).length,3);
 assert.equal(c.checks[3].checked,false);
 assert.equal(open.disabled,false);
 assert.ok(c.nodes.get('[data-compare-feedback]').textContent);
 open.trigger('click');
 assert.equal(c.nodes.get('[data-compare-table-section]').hidden,false);
 const table=c.nodes.get('[data-compare-table]').innerHTML;
 assert.equal((table.match(/<a href=/g)||[]).length,3);
 assert.ok(c.nodes.get('#trip-compare-table-title').focused);
 c.nodes.get('[data-compare-clear]').trigger('click');
 assert.equal(c.checks.filter(check=>check.checked).length,0);
 assert.equal(c.nodes.get('[data-compare-table-section]').hidden,true);
 assert.equal(open.disabled,true);
 assert.equal(c.nodes.get('[data-compare-clear]').disabled,true);
});
