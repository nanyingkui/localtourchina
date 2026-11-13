const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang==='en'?'en':'ko';
const t=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
const tabs=[...document.querySelectorAll('[data-plan]')];
const arrival=document.querySelector('[name=arrival]'),departure=document.querySelector('[name=departure]');
function setPlan(key,fromClick=false){
 const selected=tabs.find(b=>b.dataset.plan===key)||tabs.find(b=>b.dataset.plan.startsWith(key+'_'))||tabs[0];if(!selected)return;
 for(const b of tabs){const active=b===selected;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=!active;}
 if(fromClick&&arrival){const [a,d]=selected.dataset.plan.split('_');arrival.value=a;if(departure&&d)departure.value=d;arrival.dispatchEvent(new Event('change',{bubbles:true}));departure?.dispatchEvent(new Event('change',{bubbles:true}));}
}
for(const tab of tabs){tab.addEventListener('click',()=>setPlan(tab.dataset.plan,true));tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1):tabs[(tabs.indexOf(tab)+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length];next.focus();setPlan(next.dataset.plan,true);}});}
if(tabs.length){setPlan(new URLSearchParams(location.search).get('arrival')||arrival?.value||tabs[0].dataset.plan);const sync=()=>setPlan((arrival?.value||'early')+'_'+(departure?.value||'afternoon'));arrival?.addEventListener('change',sync);departure?.addEventListener('change',sync);}
// Add a task-led service introduction. Calculator elements remain in place.
const recordNode=document.querySelector('#catalog-current');
if(recordNode&&document.body.hasAttribute('data-store-legacy')){
 const record=JSON.parse(recordNode.textContent);
 if(record.pricing.policy==='existing_service_form'){
  document.body.classList.add('jd-service');
  const install=()=>{
   const panel=[...document.querySelectorAll('.service-panel')].find(x=>!x.hidden&&x.getClientRects().length)||document.querySelector('main');if(!panel)return false;
   if(document.querySelector('.jd-service-intro'))return true;
   const hero=[...panel.querySelectorAll('.rounded-service-hero,.module-head,.service-illustration-hero')].find(x=>x.getClientRects().length);
   const intro=document.createElement('header');intro.className='jd-service-intro';const copy=document.createElement('div');const back=document.createElement('a');back.href=(lang==='ko'?'':'/'+lang)+'/products.html#services';back.textContent='← '+t('개별 서비스','个别服务','Individual services');const h=document.createElement('h1');h.textContent=record.locales[lang].title;const p=document.createElement('p');p.textContent=record.discovery.summary[lang];copy.append(back,h,p);intro.append(copy);
   if(hero){hero.before(intro);hero.classList.add('jd-original-hero');const scope=hero.querySelector('.store-service-record');if(scope)intro.after(scope);}else panel.prepend(intro);
   for(const old of panel.querySelectorAll('h1'))if(!intro.contains(old)&&old.getClientRects().length){const h2=document.createElement('h2');for(const attr of old.attributes)h2.setAttribute(attr.name,attr.value);h2.classList.add('jd-service-subtitle');h2.append(...old.childNodes);old.replaceWith(h2);}
   return true;
  };
  if(!install()){let tries=0;const timer=setInterval(()=>{if(install()||++tries===30)clearInterval(timer);},100);}
 }
}
