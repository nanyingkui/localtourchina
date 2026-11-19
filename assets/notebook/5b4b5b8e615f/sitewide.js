/* Small shared enhancements. Existing calculators and submission owners stay in place. */
(()=>{
 const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang.startsWith('en')?'en':'ko';
 const pick=(ko,zh,en)=>({ko,zh,en})[lang];
 const familyNote=pick('기본요금 인원은 만 15세 이상입니다. 만 14세 이하 어린이는 상담에서 인원·나이·침대 조건을 입력하고 비용을 별도로 확인합니다. 차량 좌석은 어린이를 포함한 실제 인원으로 확인합니다.','基础报价人数指 15 岁及以上；14 岁及以下请在咨询时另填人数、年龄和床位需求，补充儿童费用。车辆座位按含儿童的实际人数确认。','Base-price party counts include ages 15+ only. Enter children aged 14 and under separately during consultation; their costs depend on age and bed needs. Vehicle seats include every traveller.');
 // Only multi-day party pricing uses this threshold. Ticket-specific age eligibility is untouched.
 function priceNotes(){document.querySelectorAll('.current-price45,.dated34').forEach(box=>{if(box.querySelector('[data-family-pricing-note]'))return;const p=document.createElement('p');p.className='nb-price-note';p.dataset.familyPricingNote='';p.textContent=familyNote;box.append(p);const group=box.querySelector('.party-pills');if(group)group.setAttribute('aria-label',pick('만 15세 이상 기본요금 인원','基础报价人数：15 岁及以上','Base-price party: ages 15+'));});}
 priceNotes();document.addEventListener('productprice:changed',priceNotes);document.addEventListener('click',e=>{if(e.target.closest('[data-home-party],[data-price-party],[data-product-party],[data-price-route]'))queueMicrotask(priceNotes);});
 document.querySelectorAll('form[data-dated34] input[name=party]').forEach(input=>{const label=input.closest('label');label.childNodes.forEach(n=>{if(n.nodeType===3)n.textContent=pick('만 15세 이상 인원','15 岁及以上人数','Travellers aged 15+');});});
 // Local navigation should stay within the preview and current locale; external communities remain external.
 document.querySelectorAll('a[href^="https://localtourchina.com/"]').forEach(a=>{const url=new URL(a.href);a.href=url.pathname+url.search+url.hash;});
 // Existing originals remain archived. Only reviewed versions are displayed in the website.
 const base=document.querySelector('link[data-notebook-white]')?.href.replace('white-notebook.css','');
 const held=/\/photos\/hosted-tours\/|guide-reception-|airport-transfer-(?:desktop|night)-|meili-xiangxi-|local-market-mobile-|night-market-jpg-|cafe-212-002|cafe-146-001|cafe-70-009|cafe-109-006/;
 const replacement=src=>/tianmen-cliff-/.test(src)?'cliff-privacy.png':/canyon-jpg-/.test(src)?'glasswalk-privacy.png':/vehicles\/9-seat\/interior-|vehicle-nine-interior\.webp/.test(src)?'vehicle-inside-drawn.jpg':/hotels\/mercure\/twin-/.test(src)?'room-clean.png':null;
 function reviewImages(scope=document){for(const img of scope.querySelectorAll('img')){
  const src=img.getAttribute('src')||'';if(!src)continue;
  const revised=replacement(src);if(revised&&base){img.removeAttribute('srcset');img.closest('picture')?.querySelectorAll('source').forEach(x=>x.remove());img.src=base+'photos/'+revised;}
  if(held.test(src)){const block=img.closest('figure')||img.closest('picture')||img.closest('button')||img;block.hidden=true;block.setAttribute('data-photo-held','');}
  if(/i\.ytimg\.com|yt3\./.test(src)){img.hidden=true;img.parentElement?.setAttribute('data-image-error','true');}
 }}
 reviewImages();const observer=new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length||r.type==='attributes'))reviewImages();});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
 // Paper feedback follows a real press. Scrolling/cancel/context menus always release it.
 let pressed,holdTimer,downX,downY;
 function releasePress(){clearTimeout(holdTimer);pressed?.classList.remove('nb-pressing','nb-holding');pressed=null;}
 document.addEventListener('pointerdown',e=>{if(e.button!==0)return;const target=e.target.closest('button.trip-cover,.nb-guest-memory,.gallery-slide>button,.media-rail .photo,.primary,.store-button');if(!target||target.disabled)return;releasePress();pressed=target;downX=e.clientX;downY=e.clientY;target.classList.add('nb-pressing');holdTimer=setTimeout(()=>{if(pressed===target)target.classList.add('nb-holding');},350);},{passive:true});
 document.addEventListener('pointermove',e=>{if(pressed&&Math.hypot(e.clientX-downX,e.clientY-downY)>8)releasePress();},{passive:true});
 for(const name of ['pointerup','pointercancel','contextmenu','scroll','visibilitychange'])document.addEventListener(name,releasePress,{capture:true,passive:true});window.addEventListener('blur',releasePress);
 // Touch keeps native scrolling. Mouse users can drag genuine horizontal photo rails.
 const rails=new WeakSet();let drag,suppressClickUntil=0;
 const resize=new ResizeObserver(entries=>entries.forEach(({target})=>target.classList.toggle('nb-drag-ready',target.scrollWidth>target.clientWidth+4)));
 function mountRails(){document.querySelectorAll('.gallery-track,.media-rail').forEach(rail=>{if(rails.has(rail))return;rails.add(rail);resize.observe(rail);rail.addEventListener('dragstart',e=>e.preventDefault());rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||rail.scrollWidth<=rail.clientWidth+4)return;drag={rail,id:e.pointerId,x:e.clientX,y:e.clientY,start:rail.scrollLeft,active:false};});});}
 document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;if(!drag.active&&Math.abs(e.clientY-drag.y)>Math.abs(dx)+8){drag=null;return;}if(!drag.active&&Math.abs(dx)>8){drag.active=true;drag.rail.classList.add('nb-dragging');drag.rail.setPointerCapture(e.pointerId);releasePress();}if(drag.active){e.preventDefault();drag.rail.scrollLeft=drag.start-dx;}},{passive:false});
 function endDrag(){if(!drag)return;if(drag.active){suppressClickUntil=performance.now()+250;drag.rail.classList.remove('nb-dragging');if(drag.rail.hasPointerCapture(drag.id))drag.rail.releasePointerCapture(drag.id);}drag=null;}
 document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);window.addEventListener('blur',endDrag);
 document.addEventListener('click',e=>{if(performance.now()<suppressClickUntil&&e.target.closest('.gallery-track,.media-rail')){e.preventDefault();e.stopImmediatePropagation();}},true);
 mountRails();new MutationObserver(mountRails).observe(document.body,{subtree:true,childList:true});
})();
