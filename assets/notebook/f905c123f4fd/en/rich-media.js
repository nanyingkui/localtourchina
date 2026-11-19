(()=>{
const buttons=[...document.querySelectorAll('[data-media-photo]')];if(!buttons.length)return;
const dialog=document.createElement('dialog');dialog.className='brand-photo-dialog rich-media-dialog';dialog.setAttribute('aria-labelledby','media-photo-title');
const close=document.createElement('button');close.type='button';close.textContent="Close ×";close.setAttribute('aria-label',"Close photo");
const image=document.createElement('img'),copy=document.createElement('div'),title=document.createElement('h2'),credit=document.createElement('p'),source=document.createElement('a');title.id='media-photo-title';source.textContent="View the original photo record ↗";source.target='_blank';source.rel='noopener';copy.append(title,credit,source);dialog.append(close,image,copy);document.body.append(dialog);
let trigger;close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('media-photo-open');trigger?.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
buttons.forEach(button=>button.addEventListener('click',()=>{trigger=button;const img=button.querySelector('img');image.src=img.src;image.alt=img.alt;title.textContent=img.alt;credit.textContent=button.dataset.credit||'';source.hidden=!button.dataset.source;source.href=button.dataset.source||'#';document.body.classList.add('media-photo-open');dialog.showModal();}));
// Native horizontal scrolling also works with a keyboard; no hidden cloned slides.
document.querySelectorAll('.media-rail').forEach(rail=>rail.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key)||e.target!==rail)return;e.preventDefault();rail.scrollBy({left:(e.key==='ArrowRight'?1:-1)*rail.clientWidth*.9,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}));
})();
