(()=>{
const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang.startsWith('en')?'en':'ko';
const pick=(ko,zh,en)=>({ko,zh,en})[lang],data=window.NotebookData,currency={ko:'KRW',zh:'CNY',en:'USD'}[lang];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=(n,fx=data.fx)=>new Intl.NumberFormat(lang==='zh'?'zh-CN':lang==='en'?'en-US':'ko-KR',{style:'currency',currency,maximumFractionDigits:lang==='ko'?0:2,minimumFractionDigits:lang==='ko'?0:2}).format(Number(n)*(lang==='ko'?1:fx?.rates?.[currency]));
const transportMoney=q=>new Intl.NumberFormat(lang==='zh'?'zh-CN':lang==='en'?'en-US':'ko-KR',{style:'currency',currency,maximumFractionDigits:0}).format(q.prices?.[currency]?.total??(currency==='KRW'?q.totalKRW:Math.ceil(q.totalKRW*data.fx.rates[currency])));
const api=(path,options={})=>fetch((['localhost','127.0.0.1'].includes(location.hostname)?'':'https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/ltc-runtime')+path,{...options,cache:'no-store'});
const channel={ko:'kakao',zh:'wechat',en:'whatsapp'}[lang],target={ko:'https://pf.kakao.com/_hvrmn/chat',zh:'',en:'https://wa.me/821055722601'}[lang];
const safety=()=>{if(window.ltcOpenContactSafety)window.ltcOpenContactSafety(channel,target);else location.href=(lang==='ko'?'':'/'+lang)+'/travel-safety.html?channel='+channel;};
window.Notebook={lang,pick,esc,data,currency,money,transportMoney,api,channel,target,openContact:safety,partyFromText:text=>{const m=String(text||'').trim().match(/^(?:(?:성인|成人|adults?|people|guests?)\s*)?([2-6])\s*(?:명|人|位|adults?|people|guests?)?$/i);return m?Number(m[1]):null;},translate:s=>window.NotebookTranslations?.[s]??s};
const params=new URLSearchParams(location.search);
if(params.get('view')==='full'){document.body.classList.add('full-view');document.addEventListener('DOMContentLoaded',async()=>{const images=[...document.querySelectorAll('img[src]')].filter(img=>img.getAttribute('src'));try{await Promise.all(images.map(img=>{img.loading='eager';img.decoding='sync';return img.decode();}));await document.fonts.ready;document.body.dataset.fullImagesReady='true';}catch{document.body.dataset.fullImagesReady='error';}});}
document.querySelectorAll('a[href="https://pf.kakao.com/_hvrmn/chat"]').forEach(a=>{a.href=target||(lang==='ko'?'':'/'+lang)+'/travel-safety.html?channel='+channel;});
const nav=document.createElement('nav');nav.className='notebook-languages';nav.setAttribute('aria-label',pick('언어 선택','切换语言','Choose language'));
const file=location.pathname.split('/').pop()||'index.html';
const links=[['ko','한국어','/'],['zh','中文','/zh/'],['en','English','/en/']];
nav.innerHTML=links.map(([l,label,base])=>`<a lang="${l==='zh'?'zh-CN':l}" ${l===lang?'aria-current="page"':''} data-language-base="${base}" href="${base+file+location.search+location.hash}">${label}</a>`).join('');
nav.addEventListener('click',event=>{const a=event.target.closest('a[data-language-base]');if(a)a.href=a.dataset.languageBase+file+location.search+location.hash;});
const header=document.querySelector('body>header,main>header');if(header){const bar=document.createElement('div');bar.className='notebook-tools';bar.append(nav);const slot=document.createElement('span');slot.dataset.selectionSlot='';bar.append(slot);header.insertAdjacentElement('afterend',bar);}
if(lang!=='ko'){
 const annotate=()=>document.querySelectorAll('.current-price45,.price-glance,.inquiry-rate45,.service-price').forEach(el=>{if(el.querySelector('.notebook-fx-note'))return;const p=document.createElement('small');p.className='notebook-fx-note';p.textContent=pick('','人民币换算日期：','USD conversion date: ')+data.fx.date;el.append(p);});
 document.addEventListener('DOMContentLoaded',annotate);new MutationObserver(annotate).observe(document.body,{childList:true,subtree:true});
}
})();
