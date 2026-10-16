/* AMap is loaded only after an explicit map expansion and configured commercial access. */
(()=>{
 const views=new Map();let sdkPromise;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function query(m){const direct=String(m.address||'').trim();if(direct&&!/[→↔]/.test(direct))return direct;try{const u=new URL(m.map);if(['uri.amap.com','www.amap.com','amap.com'].includes(u.hostname))return u.searchParams.get('keyword')||'';}catch{}return '';}
 const search=q=>'https://uri.amap.com/search?'+new URLSearchParams({keyword:q,city:'张家界',view:'map'});
 async function sdk(){
  if(sdkPromise)return sdkPromise;
  sdkPromise=(async()=>{
   const r=await fetch('map-config.json',{cache:'no-store'});if(!r.ok)throw Error('config');const c=await r.json();
   if(!c.enabled||!c.commercialUseConfirmed||!c.key||!c.serviceHost)return null;
   const proxy=new URL(c.serviceHost,location.origin);if(proxy.origin!==location.origin||!proxy.pathname.endsWith('/_AMapService'))throw Error('config');
   window._AMapSecurityConfig={serviceHost:proxy.href};
   if(window.AMap?.Map)return window.AMap;
   return await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://webapi.amap.com/maps?'+new URLSearchParams({v:'2.0',key:c.key,plugin:'AMap.Geocoder'});s.async=true;const timer=setTimeout(()=>{s.remove();reject(Error('timeout'));},15000);s.onload=()=>{clearTimeout(timer);window.AMap?.Map?resolve(window.AMap):reject(Error('sdk'));};s.onerror=()=>{clearTimeout(timer);s.remove();reject(Error('network'));};document.head.append(s);});
  })();return sdkPromise;
 }
 function dispose(){for(const v of views.values()){v.disposed=true;v.map?.destroy();}views.clear();}
 function select(v,id,fromMarker=false){v.selected=id;v.host.querySelectorAll('[data-map-select]').forEach(b=>{const yes=b.dataset.mapSelect===id;b.setAttribute('aria-pressed',String(yes));});const m=v.items.find(x=>x.id===id);if(!m)return;v.status.textContent=m.title+' · '+(query(m)||'중국어 주소를 추가해 주세요.');const pos=v.positions.get(id);if(pos&&v.map)v.map.setZoomAndCenter(15,pos);if(fromMarker){const card=Array.from(document.querySelectorAll('[data-moduleid]')).find(el=>el.dataset.moduleid===id);card?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});card?.querySelector('button')?.focus({preventScroll:true});}}
 async function open(v){
  if(v.loaded||v.disposed)return;v.loaded=true;v.status.textContent='지도를 불러오는 중…';
  try{const A=await sdk();if(v.disposed)return;if(!A){v.status.textContent='페이지 안 지도는 준비 중이에요. 아래에서 중국어 주소를 복사하거나 가오더 지도로 위치를 확인하세요.';return;}
   v.canvas.hidden=false;v.map=new A.Map(v.canvas,{zoom:11,center:[110.48,29.27],viewMode:'2D',resizeEnable:true});
   const geocoder=new A.Geocoder({city:'张家界'}),cache=new Map();let matches=0;
   for(const m of v.items){if(v.disposed)return;const q=query(m);if(!q)continue;
    if(!cache.has(q))cache.set(q,new Promise(resolve=>{const timer=setTimeout(()=>resolve(null),6500);geocoder.getLocation(q,(status,res)=>{clearTimeout(timer);resolve(status==='complete'&&res.geocodes?.length===1?res.geocodes[0].location:null);});}));
    const pos=await cache.get(q);if(v.disposed)return;if(!pos)continue;v.positions.set(m.id,pos);const index=v.items.indexOf(m)+1;const marker=new A.Marker({position:pos,title:m.title,label:{content:escape(index+'. '+m.title),direction:'top'}});marker.on('click',()=>select(v,m.id,true));v.map.add(marker);matches++;
   }
   if(v.disposed)return;if(matches)v.map.setFitView();v.status.textContent=matches?`${matches}개 항목의 주소 검색 위치 · 실제 입구·매표소·집합 장소는 별도로 확인하세요.`:'위치를 찾지 못했어요. 아래 주소·외부 지도 링크로 확인하세요.';if(v.selected)select(v,v.selected);
  }catch{if(v.disposed)return;v.canvas.hidden=true;v.map?.destroy();v.map=null;v.status.textContent='지도를 불러오지 못했어요. 일정은 저장되어 있어요. 아래 외부 지도와 주소 복사를 이용하세요.';}
 }
 function render(host,items,title){
  const list=items.filter(m=>query(m));
  host.innerHTML=`<details class="day-map"><summary><span>지도에서 하루 동선 보기 <small>${escape(title)} · ${list.length}개 위치</small></span><span aria-hidden="true">＋</span></summary><div class="day-map-body"><p class="day-map-status" role="status"></p><div class="day-map-canvas" hidden aria-label="${escape(title)} 가오더 지도"></div><p class="day-map-note">장소의 순서를 확인하는 지도입니다. 번호는 방문 순서이며 실제 이동 경로가 아니에요. 산길·셔틀·케이블카와 입구·교환처는 현장 안내를 확인하세요.</p><ol class="day-map-list">${items.map(m=>{const q=query(m);return `<li><button type="button" data-map-select="${escape(m.id)}" aria-pressed="false"><span>${escape(m.time||'시간 미정')}</span><b>${escape(m.title)}</b></button><p>${escape(q||'정확한 중국어 주소를 입력해 주세요.')}</p>${m.entrance?`<small>입구·집합: ${escape(m.entrance)}</small>`:''}${q?`<div class="day-map-actions"><a href="${escape(search(q))}" target="_blank" rel="noopener noreferrer">가오더 지도에서 열기 ↗</a><button type="button" data-map-copy="${escape(m.id)}">중국어 주소 복사</button></div>`:''}</li>`}).join('')}</ol></div></details>`;
  const v={host,items,map:null,positions:new Map(),canvas:host.querySelector('.day-map-canvas'),status:host.querySelector('.day-map-status'),loaded:false,disposed:false};views.set(host,v);host.querySelector('details').addEventListener('toggle',e=>{if(e.target.open){open(v);v.map?.resize();}});
  host.querySelectorAll('[data-map-select]').forEach(b=>b.onclick=()=>select(v,b.dataset.mapSelect));
  host.querySelectorAll('[data-map-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(query(items.find(m=>m.id===b.dataset.mapCopy)));v.status.textContent='중국어 주소를 복사했어요.';}catch{v.status.textContent='자동 복사가 안 되었어요. 아래 중국어 주소를 길게 눌러 복사하세요.';}});
 }
 function locate(id){for(const v of views.values()){if(!v.items.some(m=>m.id===id))continue;const details=v.host.querySelector('details');details.open=true;select(v,id);v.host.scrollIntoView({block:'start',behavior:'auto'});details.querySelector('summary').focus({preventScroll:true});return;}}
 window.LTCDayMap={render,dispose,locate};
})();
