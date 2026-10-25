const cfg=window.LOCALTOUR_SUPABASE;let records=[];
const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang.startsWith('en')?'en':'ko';
const words={
 ko:{checked:'확인',open:'원문에서 자세히 보기 ↗',none:'조건에 맞는 자료가 없어요. 다른 검색어를 입력해 주세요.',pending:'확인을 마친 자료부터 순서대로 공개할 예정입니다. 기존 여행정보도 함께 살펴보세요.',count:'확인된 자료',unit:'개',loading:'자료를 불러오는 중…',error:'자료를 불러오지 못했어요. 잠시 후 다시 시도하거나 기존 여행정보를 확인해 주세요.',names:{video:'YouTube',cafe:'Naver Cafe',guide:'여행 정보',food:'맛집과 생활',route:'참고 일정',place:'장소'}},
 zh:{checked:'核实',open:'查看原文 ↗',none:'没有匹配资料，请换个关键词。',pending:'核实后的资料将陆续公开，请先参考原有旅行信息。',count:'已核实资料',unit:'条',loading:'正在读取资料…',error:'暂时无法读取，请重试或查看原有旅行信息。',names:{video:'YouTube',cafe:'Naver Cafe',guide:'旅行信息',food:'美食与生活',route:'参考行程',place:'地点'}},
 en:{checked:'Reviewed',open:'Read the original ↗',none:'No matching information. Try another search.',pending:'Reviewed information will appear here. You can also browse the existing travel information.',count:'Reviewed items',unit:'',loading:'Loading information…',error:'Information is unavailable. Please retry or browse the existing travel information.',names:{video:'YouTube',cafe:'Naver Cafe',guide:'Travel information',food:'Food and local life',route:'Sample itinerary',place:'Place'}}
}[lang];
const q=id=>document.getElementById(id);
function render(){
 const search=q('librarySearch').value.trim().toLowerCase(),kind=q('libraryKind').value;
 const rows=records.filter(r=>(!kind||r.kind===kind)&&[r.title,r.summary,...(r.tags||[])].join(' ').toLowerCase().includes(search));
 const host=q('libraryItems');host.replaceChildren();
 for(const r of rows){
  const article=document.createElement('article'),small=document.createElement('small'),h=document.createElement('h2'),p=document.createElement('p');
  small.textContent=(words.names[r.kind]||'')+' · '+words.checked+' '+String(r.verified_at).slice(0,10);h.textContent=r.title;p.textContent=r.summary;article.append(small,h,p);
  if(r.source_url){try{const u=new URL(r.source_url);if(u.protocol==='https:'&&!u.username&&!u.password){const link=document.createElement('a');link.className='source';link.href=u.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=words.open;article.append(link)}}catch{}}
  host.append(article);
 }
 if(!rows.length){const p=document.createElement('p');p.className='empty';p.textContent=records.length?words.none:words.pending;host.append(p)}
 q('libraryStatus').textContent=words.count+' '+rows.length+words.unit;
}
async function load(){
 q('libraryStatus').textContent=words.loading;
 try{const all=[];for(let offset=0;;offset+=200){const r=await fetch(cfg.url+'/rest/v1/knowledge_items?select=id,kind,title,summary,source_url,tags,verified_at&status=eq.published&order=updated_at.desc,id.asc&limit=200&offset='+offset,{headers:{apikey:cfg.key}});if(!r.ok)throw Error('unavailable');const batch=await r.json();all.push(...batch);if(batch.length<200)break}records=all;render()}
 catch{q('libraryStatus').textContent=words.error}
}
q('librarySearch').addEventListener('input',render);q('libraryKind').addEventListener('change',render);q('libraryReload').addEventListener('click',load);load();
