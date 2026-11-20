(() => {
 'use strict';
 // Only public product identifiers and interface actions are recorded. A click
 // or copied draft never means that a chat was received or a booking was made.
 const allowed=new Set(['regular34','experience45','regular56','custom','34','45','56','56fh','45furong','trek34','trek45','trek56']);
 const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang.startsWith('en')?'en':'ko';
 const product=()=>{const id=new URLSearchParams(location.search).get('trip');return allowed.has(id)?id:'unspecified';};
 function event(name,extra={}){if(typeof window.gtag==='function')window.gtag('event',name,{page_language:lang,product_id:product(),...extra});}
 function revealAnchor(hash=location.hash){
  if(!hash||hash.length<2)return;let target;try{target=document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return;}
  const details=target?.closest('details');if(details)details.open=true;
 }
 revealAnchor();window.addEventListener('hashchange',()=>revealAnchor());
 const homeAction=document.querySelector('[data-home-handoff]'),heroAction=document.querySelector('.ed-hero .ed-primary');
 if(homeAction&&heroAction&&'IntersectionObserver' in window)new IntersectionObserver(entries=>{homeAction.hidden=entries[0].isIntersecting;},{threshold:0}).observe(heroAction);
 document.addEventListener('click',e=>{
  const anchor=e.target.closest('a');
  if(anchor){
   const href=anchor.getAttribute('href')||'';if(href.startsWith('#'))revealAnchor(href);
   const id=anchor.dataset.edProduct||anchor.dataset.compareDetail;
   if(allowed.has(id))event('ltc_product_detail',{product_id:id});
   if(/consultation\.html/.test(href))event('ltc_inquiry_entry',{entrypoint:anchor.closest('.ed-hero')?'hero':anchor.closest('.ed-closing')?'closing':'page'});
   if(anchor.hasAttribute('data-contact'))event('ltc_direct_contact_intent');
  }
  const button=e.target.closest('button');
  if(button&&['copy-open','service-copy-open'].includes(button.id))event('ltc_chat_handoff_intent');
  else if(button&&['copy-message','service-copy'].includes(button.id))event('ltc_copy_draft_intent');
 });
 for(const form of document.querySelectorAll('#consult-form,#service-inquiry-form'))form.addEventListener('submit',()=>{if(form.checkValidity())event('ltc_inquiry_draft_review');});
})();
