import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterCases,isPublicCase,safeNaverUrl,outcomeGroup} from '../public/assets/travel-help-model.mjs';
const seed=JSON.parse(fs.readFileSync(new URL('../content/travel-help-reviewed.json',import.meta.url),'utf8'));
const rows=seed.map(r=>({...r,status:'published',verified_at:'2026-11-04T00:00:00Z'}));
test('public cases require published Korean summaries with directly read Naver originals',()=>{
 assert.equal(rows.length,77);assert.ok(rows.every(isPublicCase));
 for(const patch of [{status:'needs_review'},{verified_at:null},{kind:'checklist'},{source_url:'https://blog.naver.com.evil.example/post'},{data:{...rows[0].data,original_read:false}},{data:{...rows[0].data,module:'travel_research'}}])assert.equal(!!isPublicCase({...rows[0],...patch}),false);
 assert.equal(safeNaverUrl('javascript:alert(1)'),null);assert.equal(safeNaverUrl('https://fake@blog.naver.com/path'),null);
});
test('region, category, outcome and Korean keyword searches work together',()=>{
 const a=filterCases(rows,{region:'zhangjiajie',category:'tickets',query:'재입장'});assert.ok(a.some(r=>r.data.source_id==='S153'));assert.ok(a.every(r=>r.data.regions.includes('zhangjiajie')&&r.data.categories.includes('tickets')));
 assert.ok(filterCases(rows,{region:'hainan',query:'단수'}).length===0);
 assert.ok(filterCases(rows,{region:'hainan',query:'알리페이'}).some(r=>r.data.source_id==='S203'));
 const unknown=filterCases(rows,{outcome:'unknown'});assert.ok(unknown.some(r=>r.data.source_id==='S192'));assert.ok(unknown.every(r=>outcomeGroup(r.data.outcome)==='unknown'));
});
test('publication dates stay separate from travel dates and refunds are not invented',()=>{
 const by=id=>rows.find(r=>r.data.source_id===id);
 assert.match(by('S203').data.event_display,/2024/);assert.match(by('S203').data.published_display,/2025/);
 assert.match(by('S167').data.event_display,/2024/);assert.match(by('S167').data.published_display,/2026/);
 assert.match(by('S149').data.caution,/입증한 사례는 아니/);assert.equal(by('S149').data.outcome,'이용 경험');
 assert.match(by('S192').data.result,/쓰지 않았/);assert.match(by('S197').data.result,/환급 입금은 기록하지 않았/);
 assert.equal(by('S124').data.place,'시안 병마용·진시황릉');
});
test('public content contains only curated Korean fields, no raw research or private contact material',()=>{
 for(const r of rows){assert.equal(r.data.language,'ko');assert.ok(!r.data.issue&&!r.data.source&&!r.data.raw);assert.ok(r.data.phrase&&r.data.phrase_ko);assert.ok(r.data.steps.length>=2)}
 const js=fs.readFileSync(new URL('../public/assets/travel-help.mjs',import.meta.url),'utf8');assert.match(js,/status:'eq.published'/);assert.match(js,/cache:'no-store'/);assert.doesNotMatch(js,/localStorage|service_role|naver-problem:/);
});
import {validateKnowledge,travelCasePatch} from '../public/assets/admin-hub.mjs';
test('research drafts cannot be accidentally published from the existing editor',()=>{
 assert.throws(()=>validateKnowledge({title:'draft',summary:'',status:'published',verified:true},{kind:'guide',data:{module:'travel_research'}}),/研究底稿不能直接发布/);
});
test('the existing versioned admin editor can edit every case field without losing source metadata',()=>{
 const original=rows[0],d=original.data,input=Object.fromEntries(['result','caution','phrase','phrase_ko','published_display','event_display','source_context'].map(k=>['case_'+k,d[k]]));input.case_steps=d.steps.join('\n');input.case_outcome=d.outcome;
 const next=travelCasePatch(input,original);assert.equal(next.source_id,d.source_id);assert.deepEqual(next.steps,d.steps);assert.equal(next.original_read,true);
 assert.throws(()=>travelCasePatch({...input,case_result:''},original),/不能为空/);
});
import vm from 'node:vm';
test('an unavailable public API shows retry guidance without stale or draft content',async()=>{
 const fields=new Map(),node=()=>({value:'',textContent:'',innerHTML:'',hidden:false,addEventListener(){},setAttribute(){}});
 const document={getElementById(id){if(!fields.has(id))fields.set(id,node());return fields.get(id)},querySelectorAll(){return []}};
 const code=fs.readFileSync(new URL('../public/assets/travel-help.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
 vm.runInNewContext(code,{document,window:{LOCALTOUR_SUPABASE:{url:'https://example.invalid',key:'public-fixture'}},location:{search:'',pathname:'/travel-help.html',origin:'https://example.invalid'},URL,URLSearchParams,AbortSignal,setTimeout,clearTimeout,fetch:async()=>({ok:false}),categoryNames:{},regionNames:{}});
 await new Promise(setImmediate);assert.equal(fields.get('help-retry').hidden,false);assert.match(fields.get('help-status').textContent,/불러오지 못/);assert.match(fields.get('help-items').innerHTML,/연결 상태/);assert.equal(fields.get('help-more').hidden,true);
});
