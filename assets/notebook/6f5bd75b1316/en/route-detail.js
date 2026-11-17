(() => {
  const {read,save}=window.Journey,id=document.body.dataset.product;
  let state=read();
  if(new URLSearchParams(location.search).get('view')==='full')document.body.classList.add('full-view');
  const inputs=[...document.querySelectorAll('input[name=moments]')];
  function update(){state.moments={...state.moments,[id]:inputs.filter(i=>i.checked).map(i=>i.value)};save(state);const selected=state.moments[id];document.querySelector('#chosen').hidden=!selected.length;document.querySelector('#chosen-list').replaceChildren(...selected.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));document.querySelector('#selection-count').textContent=selected.length?`Moments to look forward to ${selected.length} saved`:"With the moments you want to remember";inputs.forEach(i=>i.closest('label').querySelector('small').textContent=i.checked?"Saved for your inquiry · tap again to remove":"Save for my inquiry");}
  inputs.forEach(i=>{i.checked=(state.moments[id]||[]).includes(i.value);i.addEventListener('change',update);});
  document.querySelectorAll('[data-consult]').forEach(a=>a.addEventListener('click',()=>{const latest=read();save({...latest,route:id,moments:{...latest.moments,[id]:inputs.filter(i=>i.checked).map(i=>i.value)}});}));
  document.addEventListener('productprice:changed',()=>{state=read();});
  window.addEventListener('pageshow',()=>{state=read();inputs.forEach(i=>i.checked=(state.moments[id]||[]).includes(i.value));update();window.ProductCatalog.mount();});
  const dialog=document.querySelector('#lightbox');
  document.querySelectorAll('[data-scene-photo]').forEach(button=>button.addEventListener('click',()=>{const image=button.querySelector('img');document.querySelector('#large-photo').src=image.src;document.querySelector('#large-photo').alt=image.alt;document.querySelector('#photo-title').textContent=image.alt;document.querySelector('#photo-source').textContent=button.dataset.credit;const link=document.querySelector('#photo-link');link.hidden=!button.dataset.source;link.href=button.dataset.source||'#';dialog.showModal();}));
  document.querySelector('#close-photo').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  update();window.ProductCatalog.mount();
})();
