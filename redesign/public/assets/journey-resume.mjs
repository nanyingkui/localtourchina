export function mountJourneyResume(){
 const query=new URLSearchParams(location.search),task=query.get('journeyTask');
 const allowed=['entry','transport','transfer','hotel','itinerary','guide','connection','payment','protection'];
 if(!allowed.includes(task)||location.pathname.endsWith('multi-booking.html'))return;
 const pageLang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang==='en'?'en':'ko';const lang=['ko','zh','en'].includes(query.get('journeyLang'))?query.get('journeyLang'):pageLang;
 const words={ko:['내 여행 일정으로 돌아가기','이 항목 준비 완료','자동 저장됨 · 이 브라우저에서 이어서 진행할 수 있어요.','저장하지 못했어요. 브라우저 저장 공간을 확인하세요.'],zh:['返回我的行程','此项目已准备完成','已自动保存，可在此浏览器中继续。','保存失败，请检查浏览器存储空间。'],en:['Return to my trip','Mark this item complete','Saved automatically. Continue in this browser.','Could not save. Check browser storage.']}[lang];
 const key='ltc-journey-plan-v1:'+lang,draftKey='ltc-journey-task-draft-v1:'+lang+':'+task+':'+location.pathname;
 let draft={};try{draft=JSON.parse(localStorage.getItem(draftKey)||'{}')}catch{}
 const bar=document.createElement('section');bar.className='journey-return-bar';
 const back=document.createElement('a');back.textContent=words[0];back.href=(lang==='ko'?'':'/'+lang)+'/multi-booking.html?planner=1&journeyTask='+task;
 const done=document.createElement('button');done.type='button';done.textContent=words[1];
 const status=document.createElement('span');status.setAttribute('role','status');bar.append(back,done,status);(document.querySelector('main')||document.body).prepend(bar);
 const record=(complete=false)=>{try{const plan=JSON.parse(localStorage.getItem(key)||'{}');plan.tasks ||= {};plan.records ||= {};plan.records[task]={...plan.records[task],progress:complete||plan.tasks[task]==='ready'?'complete':'started',updatedAt:new Date().toISOString(),sourcePath:location.pathname+location.search};if(complete)plan.tasks[task]='ready';else if(!plan.tasks[task])plan.tasks[task]='help';localStorage.setItem(key,JSON.stringify(plan));localStorage.setItem(draftKey,JSON.stringify(draft));status.textContent=words[2];return true;}catch{status.textContent=words[3];return false;}};
 const fieldKey=node=>node.id||(node.name?node.name+(['radio','checkbox'].includes(node.type)?':'+node.value:''):'');
 const eligible=node=>node.matches?.('input,select,textarea')&&!node.readOnly&&!['password','file','hidden','submit','button'].includes(node.type)&&Boolean(fieldKey(node));
 const restored=new WeakSet();let restoring=false;
 const restore=()=>{restoring=true;document.querySelectorAll('input,select,textarea').forEach(node=>{if(!eligible(node)||restored.has(node))return;restored.add(node);const saved=draft[fieldKey(node)];if(!saved)return;node.value=saved.value;if(['checkbox','radio'].includes(node.type))node.checked=saved.checked;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));});restoring=false;};
 const saveField=event=>{if(restoring||!eligible(event.target))return;const node=event.target;draft[fieldKey(node)]={value:node.value,checked:node.checked};record();};
 document.addEventListener('input',saveField);document.addEventListener('change',saveField);
 document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link||link===back)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname.endsWith('.html')){url.searchParams.set('journeyTask',task);url.searchParams.set('journeyLang',lang);link.href=url.href;}if(link.origin!==location.origin)record();});
 done.addEventListener('click',()=>{if(record(true))location.href=back.href;});
 restore();new MutationObserver(restore).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pagehide',()=>record());
}
