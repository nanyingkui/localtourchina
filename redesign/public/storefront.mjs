import {contactChannel} from '/assets/my-selections/20261113journey/contact-channels.mjs';
const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang==='en'?'en':'ko';
const w=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko,channel=contactChannel(lang);
const header=document.querySelector('[data-store-header]');
function closeMenus(focus=false){for(const button of header.querySelectorAll('[data-menu]')){if(button.getAttribute('aria-expanded')==='true'&&focus)button.focus();button.setAttribute('aria-expanded','false');document.getElementById(button.dataset.menu).hidden=true;}}
for(const button of header.querySelectorAll('[data-menu]'))button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';closeMenus();if(!open){button.setAttribute('aria-expanded','true');document.getElementById(button.dataset.menu).hidden=false;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus(true);});
document.addEventListener('click',e=>{if(!header.contains(e.target)||e.target.closest('.ms-entry'))closeMenus();});
document.addEventListener('catalog:saved',()=>closeMenus());
header.querySelectorAll('[data-menu-close]').forEach(button=>button.addEventListener('click',()=>closeMenus(true)));
header.addEventListener('focusout',event=>{if(event.relatedTarget&&!header.contains(event.relatedTarget))closeMenus();});
const narrowMenu=matchMedia('(max-width:900px)');
const fitMenu=()=>header.querySelectorAll('.menu-group').forEach(group=>{group.open=!narrowMenu.matches;});
fitMenu();narrowMenu.addEventListener('change',fitMenu);
let contactDialog;
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-contact]');if(!target)return;
 if(!contactDialog){
  contactDialog=document.createElement('dialog');contactDialog.className='store-contact-dialog';contactDialog.setAttribute('aria-labelledby','contact-heading');
  contactDialog.innerHTML=`<button type="button" data-close>${w('닫기','关闭','Close')} ×</button><h2 id="contact-heading">${w('카카오톡으로 상담하기','微信咨询','Talk to us on WhatsApp')}</h2><p>${w('담아 둔 상품이 있다면 내 선택에서 조건을 함께 보내세요.','如果已有心仪产品，可从“我的选择”一起发送产品和条件。','If you have saved products, share their conditions from My selections.')}</p><p>${channel.id?'微信：<strong>'+channel.id+'</strong>':''}</p><p><a class="store-button secondary" href="#my-trip-selections">${w('내 선택 확인','查看我的选择','Review my selections')}</a></p><p data-contact-action></p><p role="status"></p>`;
  document.body.append(contactDialog);
  contactDialog.querySelector('[data-close]').addEventListener('click',()=>contactDialog.close());
  contactDialog.addEventListener('click',event=>{if(event.target===contactDialog)contactDialog.close();});
  contactDialog.querySelector('a').addEventListener('click',()=>contactDialog.close());
  if(channel.url){const a=document.createElement('a');a.href=channel.url;a.target='_blank';a.rel='noopener noreferrer';a.className='store-button primary';a.textContent=w('카카오톡 열기','打开客服','Open WhatsApp');contactDialog.querySelector('[data-contact-action]').append(a);}
  else{const b=document.createElement('button');b.type='button';b.className='store-button primary';b.textContent='复制微信号';b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(channel.id);contactDialog.querySelector('[role=status]').textContent='已复制微信号 nanyingkui。';}catch{contactDialog.querySelector('[role=status]').textContent='请手动复制微信号：nanyingkui';}});contactDialog.querySelector('[data-contact-action]').append(b);}
 }
 contactDialog.showModal();contactDialog.addEventListener('close',()=>target.focus(),{once:true});
});
const search=document.querySelector('#catalog-search');
if(search){
 const rows=[...document.querySelectorAll('[data-product-card]')],groups=[...document.querySelectorAll('.store-catalog-group')],status=document.querySelector('#catalog-search-status'),empty=document.querySelector('#catalog-empty'),options=document.querySelector('#catalog-options');
 const prefix=lang==='ko'?'':'/'+lang;
 const optionList=[
  {aliases:'천문산 天门山 tianmen',type:'입장권 티켓 门票 ticket tickets admission',href:prefix+'/tickets.html?attraction=tianmen',title:w('천문산 입장권','天门山门票','Tianmen Mountain tickets')},
  {aliases:'국가삼림공원 森林公园 forest',type:'입장권 티켓 门票 ticket tickets admission',href:prefix+'/tickets.html?attraction=forest',title:w('국가삼림공원 입장권','森林公园门票','Forest Park tickets')},
  {aliases:'대협곡 大峡谷 canyon 玻璃桥 유리다리',type:'입장권 티켓 门票 ticket tickets admission',href:prefix+'/tickets.html?attraction=canyon',title:w('대협곡 입장권','大峡谷门票','Grand Canyon tickets')},
  {aliases:'공항 机场 airport',type:'픽업 샌딩 接机 送机 接送 transfer pickup pick-up',href:prefix+'/vehicles.html?service=airport',title:w('공항 픽업·샌딩','机场接送','Airport pickup & drop-off')},
  {aliases:'부용진 芙蓉镇 furong',type:'차량 이동 픽업 接送 车 transfer shuttle',href:'/?view=furong'+(lang==='ko'?'':'&lang='+lang),title:w('부용진 이동 서비스','芙蓉镇接送','Furong transfer')}
 ];
 const categoryButtons=[...document.querySelectorAll('[data-category]')];
 let category=['packages','nearby','sanya','services'].includes(location.hash.slice(1))?location.hash.slice(1):'all';
 function filter(){
  for(const b of categoryButtons)b.setAttribute('aria-pressed',String(b.dataset.category===category));
  const query=search.value.trim().toLowerCase(),terms=query.split(/\s+/).filter(Boolean);let count=0;
  for(const row of rows){row.hidden=!(category==='all'||row.closest('.store-catalog-group')?.id===category)||!terms.every(term=>row.dataset.search.toLowerCase().includes(term));if(!row.hidden)count++;}
  for(const group of groups)group.hidden=![...group.querySelectorAll('[data-product-card]')].some(x=>!x.hidden);
  options.replaceChildren();let optionCount=0;
  if(query)for(const option of optionList){const matches=terms.every(term=>(option.aliases+' '+option.type).toLowerCase().includes(term));const specific=option.aliases.toLowerCase().split(' ').some(term=>query.includes(term))&&option.type.toLowerCase().split(' ').some(term=>query.includes(term));if(!matches||!specific)continue;optionCount++;const a=document.createElement('a');a.href=option.href;a.className='catalog-option';a.textContent=option.title+' →';const sub=document.createElement('span');sub.textContent=w('해당 옵션 바로 선택','直接选择该服务选项','Open this service option');a.append(sub);options.append(a);}
  empty.hidden=count+optionCount>0;
  status.textContent=optionCount?w(`${count}개 상품 · 바로가기 ${optionCount}개`,`找到 ${count} 个产品 · ${optionCount} 个服务选项`,`${count} products · ${optionCount} direct options`):w(`${count}개 상품을 볼 수 있어요`,`${count} 个项目`,`${count} options to explore`);
  const url=new URL(location.href);if(query)url.searchParams.set('q',search.value);else url.searchParams.delete('q');history.replaceState(history.state,'',url);
 }
 search.value=new URLSearchParams(location.search).get('q')||'';search.addEventListener('input',filter);document.querySelector('[data-clear-search]').addEventListener('click',()=>{search.value='';filter();search.focus();});filter();
 for(const b of categoryButtons)b.addEventListener('click',()=>{category=b.dataset.category;const url=new URL(location.href);url.hash=category==='all'?'all-catalog':category;history.replaceState(history.state,'',url);filter();});
 window.addEventListener('hashchange',()=>{category=['packages','nearby','sanya','services'].includes(location.hash.slice(1))?location.hash.slice(1):'all';filter();});
}
// Existing ticket and transfer calculators own their inputs and pricing.
const params=new URLSearchParams(location.search),attraction=params.get('attraction');
if(['tianmen','forest','canyon'].includes(attraction)){
 let attempts=0;const choose=()=>{if(params.has('msEdit'))return;const input=document.querySelector('#attractions input[value="'+attraction+'"]');if(input){if(!input.checked)input.click();document.querySelector('#attractions')?.scrollIntoView({block:'center'});return;}if(++attempts<30)setTimeout(choose,100);};choose();
}
if(params.get('service')==='airport'){
 const input=document.querySelector('#vehicleService input[value=airport]');if(input&&!input.checked)input.click();
}
async function settleService(){
 const node=document.querySelector('#catalog-current');if(!node||!document.body.hasAttribute('data-store-legacy'))return;
 const record=JSON.parse(node.textContent);if(record.pricing.policy!=='existing_service_form')return;
 const scope=[...document.querySelectorAll('.service-panel')].find(x=>!x.hidden&&x.getClientRects().length)||document.querySelector('main');if(!scope)return;
 const hero=[...scope.querySelectorAll('.rounded-service-hero,.module-head,.service-illustration-hero')].find(x=>x.getClientRects().length);
 if(!scope.querySelector('.store-service-record')||!scope.querySelector('.store-service-record').getClientRects().length){
  document.querySelectorAll('.store-service-record').forEach(x=>x.remove());
  const panel=document.createElement('section');panel.className='store-service-record store-record';panel.dataset.recordId=record.id;
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=w('서비스 범위·포함·별도 비용','服务范围、包含与不包含','Service scope, inclusions & exclusions');details.append(summary);const content=document.createElement('div');content.innerHTML=record.locales[lang].sections;details.append(content);panel.append(details);
  const actions=document.createElement('div');actions.className='store-quote-actions';const add=document.createElement('button');add.type='button';add.className='store-button secondary';add.dataset.choice=record.paths[lang];add.dataset.productId=record.id;add.dataset.title=record.locales[lang].title;add.textContent=w('내 선택에 담기','加入我的选择','Add to my selections');actions.append(add);panel.append(actions);const status=document.createElement('p');status.setAttribute('role','status');status.dataset.choiceFeedback='';panel.append(status);
  const intro=scope.querySelector('.jd-service-intro');
  if(intro)intro.after(panel);else if(hero)hero.after(panel);else{const title=[...scope.querySelectorAll('h1')].find(x=>x.getClientRects().length);if(title)title.after(panel);else scope.prepend(panel);}
 }
 // A light service record must not remain inside a legacy image hero:
 // those heroes apply white text to every descendant heading and paragraph.
 const serviceRecord=scope.querySelector('.store-service-record');
 if(serviceRecord&&!serviceRecord.querySelector('details')){
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=w('서비스 범위·포함·별도 비용','服务范围、包含与不包含','Service scope, inclusions & exclusions');details.append(summary);
  const content=document.createElement('div');for(const child of [...serviceRecord.children])if(!child.matches('.store-quote-actions,[data-choice-feedback]'))content.append(child);details.append(content);serviceRecord.prepend(details);
 }
 if(hero&&serviceRecord&&hero.contains(serviceRecord))hero.after(serviceRecord);
 const intro=scope.querySelector('.jd-service-intro');if(intro&&serviceRecord)intro.after(serviceRecord);
 if(!params.has('msEdit')&&!params.has('attraction')&&!params.has('service')){try{const [{readState},{restoreProduct,activeProduct}]=await Promise.all([import('/assets/my-selections/20261113journey/model.mjs'),import('/assets/my-selections/20261113journey/bridge.mjs')]);const saved=readState(localStorage).items.find(x=>x.id==='product:'+record.id);if(saved?.fields?.length&&saved.kind===activeProduct()?.kind)await restoreProduct(saved);}catch{}}
 document.querySelectorAll('a[href^="https://pf.kakao.com/"]').forEach(a=>{if(lang==='en'){a.href=channel.url;a.textContent='Contact on WhatsApp';}else if(lang==='zh'){const b=document.createElement('button');b.type='button';b.className=a.className;b.dataset.contact='';b.textContent='微信咨询';a.replaceWith(b);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(settleService),{once:true});else requestAnimationFrame(settleService);
const headerContact=document.querySelector('.store-tools [data-contact]');if(headerContact){headerContact.setAttribute('aria-label',w('카카오톡 상담','微信咨询','Contact on WhatsApp'));headerContact.textContent=channel.name;}
function singleSkip(){document.querySelectorAll('a[href="#main"]:not(.store-skip)').forEach(a=>{if(/본문으로|跳至|跳到|Skip to/.test(a.textContent))a.remove();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',singleSkip,{once:true});else singleSkip();
// React transfer flow mounts after the static shell. Keep its existing calculator,
// but ensure late-mounted contact links follow the selected language too.
const legacyRoot=document.querySelector('[data-store-legacy] #root');
if(legacyRoot){const sync=()=>{legacyRoot.querySelectorAll('a[href^="https://pf.kakao.com/"]').forEach(a=>{if(lang==='en'){a.href=channel.url;a.textContent='Contact on WhatsApp';}else if(lang==='zh'){const b=document.createElement('button');b.type='button';b.className=a.className;b.dataset.contact='';b.textContent='微信咨询';a.replaceWith(b);}});const main=legacyRoot.querySelector('main');if(main&&!main.id)main.id='main';singleSkip();};new MutationObserver(sync).observe(legacyRoot,{childList:true,subtree:true});sync();}
