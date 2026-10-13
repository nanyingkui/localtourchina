/* Apply the approved storefront presentation to existing service controls. */
(()=>{
 const start=()=>{
  if(document.getElementById('root'))return;
  document.body.classList.add('rounded-page');if(location.pathname.endsWith('multi-booking.html'))document.body.classList.add('rounded-booking-flow');
  const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang.startsWith('en')?'en':'ko';
  const prefix=lang==='ko'?'/':'/'+lang+'/';const home=prefix;
  const t={ko:{links:['홈','선택 내역','패키지 · 참고가','맞춤여행','여행 정보'],menu:'메뉴',support:'카카오톡 상담',details:'예약 전 이용 안내'},zh:{links:['首页','已选清单','参考套餐','定制旅行','旅行信息'],menu:'菜单',support:'联系咨询',details:'预订前使用指南'},en:{links:['Home','Selected items','Packages','Tailor-made','Travel guide'],menu:'Menu',support:'Contact us',details:'Before you book'}}[lang];
  const header=document.querySelector('.brand-header,.topbar,.site-header');
  if(header){
   header.classList.add('rounded-page-header');
   let nav=header.querySelector('.service-nav,.nav');if(!nav){nav=document.createElement('nav');nav.className='service-nav';header.append(nav);}nav.id='main-navigation';nav.replaceChildren();
   const routes=[home,prefix+'multi-booking.html#my-trip-selections',home+'#prepared-trips',prefix+'multi-booking.html?planner=1',prefix+'travel-info.html'];
   t.links.forEach((label,i)=>{const a=document.createElement('a');a.href=routes[i];a.textContent=label;nav.append(a)});
   header.querySelectorAll('.brand-my-trip,.journal-home-link').forEach(x=>x.remove());
   let contact=header.querySelector('.rounded-page-contact');if(!contact){contact=document.createElement('a');contact.className='rounded-page-contact';contact.href='https://pf.kakao.com/_hvrmn/chat';contact.textContent=t.support;header.append(contact);}
   const logo=header.querySelector('.brand-home');if(logo){logo.href=home;const img=logo.querySelector('img');if(img)img.src='/assets/home-20261013/mascot-clean.webp';}
   let toggle=header.querySelector('.mobile-nav-toggle,.redesign-menu');if(!toggle){toggle=document.createElement('button');toggle.className='rounded-page-menu';toggle.type='button';toggle.textContent=t.menu;toggle.setAttribute('aria-controls',nav.id);toggle.setAttribute('aria-expanded','false');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('menu-open',open)});header.append(toggle);}
   const existingToggle=header.querySelector('.mobile-nav-toggle,.redesign-menu');if(existingToggle)existingToggle.setAttribute('aria-controls',nav.id);
  }
  const rail=document.querySelector('.brand-service-rail');
  if(rail){const icons=['mountain','ticket','transfer','guide','experience','help'];rail.querySelectorAll('a').forEach((a,i)=>{a.querySelector('svg')?.remove();const img=document.createElement('img');img.src='/assets/home-20261013/icons/'+icons[i]+'-v2.svg';if(i===5)img.src='/assets/home-20261013/icons/help.svg';img.alt='';img.width=48;img.height=48;a.prepend(img)});}
  const flow=document.querySelector('.journal-flow-guide');if(flow){const anchor=rail||header;if(anchor)anchor.after(flow);}
  document.querySelectorAll('.seo-service-overview').forEach(section=>{
   const panel=section.closest('.service-panel');const hero=panel?.querySelector('.module-head,.service-illustration-hero');
   const details=document.createElement('details');details.className='rounded-service-details';const summary=document.createElement('summary');summary.textContent=t.details;details.append(summary);section.before(details);details.append(section);
   if(hero){const strip=hero.nextElementSibling?.classList.contains('service-media-strip')?hero.nextElementSibling:hero;strip.after(details);}
  });
  document.querySelectorAll('.brand-heading-icon').forEach(x=>x.remove());
  const phases=()=>{if(!flow)return;const editing=[...document.querySelectorAll('.service-panel')].some(x=>!x.hidden&&x.id!=='service-combo');const reviewing=location.hash==='#my-trip-selections';const step=reviewing?2:editing?1:0;[...flow.children].forEach((x,i)=>{x.classList.toggle('is-current',i===step);if(i===step)x.setAttribute('aria-current','step');else x.removeAttribute('aria-current');});};phases();const observer=new MutationObserver(phases);document.querySelectorAll('.service-panel').forEach(x=>observer.observe(x,{attributes:true,attributeFilter:['hidden']}));window.addEventListener('hashchange',phases);
  const combo=document.querySelector('#service-combo');if(combo&&document.body.classList.contains('rounded-booking-flow')){const area=document.getElementById('comboInquiry');const field=area?.closest('.field');if(field){const details=document.createElement('details');details.className='rounded-quote-details';const summary=document.createElement('summary');summary.textContent={ko:'전체 상담 내용 확인',zh:'查看完整咨询内容',en:'View the full inquiry text'}[lang];details.append(summary);field.before(details);details.append(field);}}
  const config={ticket:['ticket',true],vehicle:['transfer',false],guide:['guide',false],private:['hero-desktop',true],daytour:['village',true],onlineguide:['guide',false]};
  for(const [id,[asset,photo]]of Object.entries(config)){
   const hero=document.querySelector('#service-'+id+' .module-head,#service-'+id+' .service-illustration-hero');if(!hero)continue;
   hero.classList.add('rounded-service-hero');
   const copy=document.createElement('div');copy.className='rounded-hero-copy';const source=hero.querySelector('.service-illustration-copy')||hero;for(const node of [...source.children])if(node.matches('h1,p,a'))copy.append(node);hero.querySelectorAll('.service-illustration-copy,.brand').forEach(x=>x.remove());hero.prepend(copy);
   const picture=document.createElement('figure');picture.className='rounded-service-visual';
   const img=document.createElement('img');img.src='/assets/home-20261013/'+asset+'.webp';img.alt='';img.width=1448;img.height=1086;img.decoding='async';picture.append(img);
   const caption=document.createElement('figcaption');caption.textContent=photo?{ko:'현지 사진을 바탕으로 AI 보정한 이미지',zh:'基于当地实拍，经 AI 调色与构图调整',en:'AI adjustments based on local photography'}[lang]:{ko:'서비스 설명을 위한 AI 콘셉트 이미지',zh:'用于服务说明的 AI 概念图',en:'AI concept image illustrating the service'}[lang];picture.append(caption);
   hero.querySelectorAll('.service-illustration,figure').forEach(x=>x.remove());hero.append(picture);
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
