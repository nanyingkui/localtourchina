(async()=>{
const root='/assets/my-selections/20261113journey/';
const [{KEY,readState,commit},{canonicalItem,mergeSelection},{captureProduct}]=await Promise.all([import(root+'model.mjs'),import('/catalog-config.mjs'),import(root+'bridge.mjs')]);
if(document.querySelector('[data-catalog-form]'))await import('/tour-config.mjs');
const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang==='en'?'en':'ko';
let serviceTouched=new URLSearchParams(location.search).has('attraction')||new URLSearchParams(location.search).has('service');for(const type of ['input','change'])document.addEventListener(type,event=>{if(event.isTrusted&&!event.target.closest('[data-ms-ui], [data-store-header]'))serviceTouched=true;});
let catalog;const getCatalog=()=>catalog?Promise.resolve(catalog):fetch('/customer-catalog.json').then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(data=>catalog=data);
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-choice]');if(!button)return;
 event.preventDefault();button.disabled=true;
 const feedback=button.closest('article,li,section')?.querySelector('[data-choice-feedback]')||document.querySelector('#choice-status');
 try{
  const records=await getCatalog(),record=records[button.dataset.productId];if(!record)throw Error('Missing product');
  const form=document.querySelector('[data-catalog-form]'),current=document.querySelector('#catalog-current'),onDetail=current&&JSON.parse(current.textContent).id===record.id;
  const conditions=onDetail&&form?form.catalogConditions?.()||Object.fromEntries(new FormData(form)):{};
  if(onDetail&&form&&form.calculateQuote&&conditions.mode&&conditions.party)await form.calculateQuote();
  const quote=onDetail&&form?form._catalogQuote||null:null;
  let item=canonicalItem(record,lang,conditions,quote),configured=!!(onDetail&&form);
  if(onDetail&&record.pricing.policy==='existing_service_form'){
   const service=captureProduct(lang);if(service){item={...service,id:'product:'+record.id,productId:record.id,title:record.locales[lang].title,sourcePath:record.paths[lang]};configured=serviceTouched||new URLSearchParams(location.search).has('msEdit')||!service.missing?.length;}
  }
  item.catalogRevision=record.revision;
  const save=()=>{const current=readState(localStorage),existing=current.items.find(x=>x.id===item.id);item=mergeSelection(record,lang,item,existing,configured);if(existing&&!configured)return;commit(localStorage,{type:'save',item,...(existing?{expectedItemRevision:existing.revision}:{})},current.revision);};
  if(navigator.locks)await navigator.locks.request('ltc-selections-write-v1',save);else save();
  await import(root+'ui.mjs');
  window.dispatchEvent(new StorageEvent('storage',{key:KEY}));
  if(new URLSearchParams(location.search).has('msEdit')){const url=new URL(location.href);url.searchParams.delete('msEdit');history.replaceState(history.state,'',url);}
  document.dispatchEvent(new CustomEvent('catalog:saved',{detail:{productId:record.id,inquire:button.hasAttribute('data-inquire')}}));
  if(feedback)feedback.textContent=lang==='ko'?'선택한 조건을 저장했습니다.':lang==='zh'?'已保存当前选择条件。':'Your conditions are saved.';
 }catch(error){if(feedback)feedback.textContent=lang==='ko'?'저장하지 못했습니다. 입력은 그대로입니다. 다시 시도해 주세요.':lang==='zh'?'保存失败，输入仍保留，请重试。':'Could not save. Your inputs are retained. Please retry.';console.error('Save selection',error);}
 finally{button.disabled=false;}
});
document.querySelectorAll('button[data-choice]').forEach(button=>button.disabled=false);
})();
