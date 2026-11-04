/* Presentation only: no network, storage, navigation, booking or authentication changes. */
(()=>{
 if(typeof document==='undefined')return;
 document.documentElement.classList.add('ltc-visual');
 const start=()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const menuSelector='button.menu-button[aria-expanded="true"],button.rounded-page-menu[aria-expanded="true"],button.mobile-nav-toggle[aria-expanded="true"],button.redesign-menu[aria-expanded="true"]';
  document.addEventListener('keydown',event=>{
   if(event.key!=='Escape'||document.querySelector('dialog[open]'))return;
   const toggle=document.querySelector(menuSelector);if(!toggle)return;
   event.preventDefault();toggle.click();toggle.focus();
  });
  document.addEventListener('click',event=>{
   const toggle=document.querySelector(menuSelector);if(!toggle)return;
   const header=toggle.closest('header,.rounded-page-header');
   if(header&&!header.contains(event.target))toggle.click();
  });
  document.addEventListener('toggle',event=>{
   const details=event.target;if(!(details instanceof HTMLDetailsElement)||!details.open||reduced.matches)return;
   details.classList.add('ltc-just-opened');setTimeout(()=>details.classList.remove('ltc-just-opened'),220);
  },true);
  const lang=document.documentElement.lang;
  const closeText=lang.startsWith('zh')?'关闭':lang.startsWith('en')?'Close':'닫기';
  const decorate=dialog=>{
   if([...dialog.querySelectorAll('button')].some(b=>['닫기','关闭','Close','×','✕'].includes(b.textContent.trim())))return;
   if(dialog.querySelector('button[aria-label*=닫기],button[aria-label*=关闭],button[aria-label*=Close],.dialog-close,.rounded-close,[id*="Close"],[id*="close"],.ltc-dismiss'))return;
   // Native requestClose honors cancel guards and restores focus. Never submit a form.
   const close=document.createElement('button');close.type='button';close.className='ltc-dismiss';close.textContent=closeText;close.setAttribute('aria-label',closeText);
   close.addEventListener('click',()=>{if(typeof dialog.requestClose==='function')dialog.requestClose();else{const cancel=new Event('cancel',{cancelable:true});if(dialog.dispatchEvent(cancel))dialog.close();}});
   dialog.prepend(close);
  };
  document.querySelectorAll('dialog').forEach(decorate);
  // React and the handbook can create dialogs after initial loading.
  const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(!(node instanceof Element))continue;if(node.matches('dialog'))decorate(node);node.querySelectorAll('dialog').forEach(decorate);}});
  observer.observe(document.body,{childList:true,subtree:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
