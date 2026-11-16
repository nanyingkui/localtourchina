(()=>{
const S=window.Services,requested=new URLSearchParams(location.search).get('service'),id=S.records[requested]?requested:'airport';let state=S.read(id);
const form=document.querySelector('#service-inquiry-form'),edit=document.querySelector('#service-edit'),review=document.querySelector('#service-review'),messageBox=document.querySelector('#service-message');
document.querySelector('#service-chosen').innerHTML=`<h2>${S.title(state)}</h2><dl>${S.rows(state).map(([a,b])=>`<div><dt>${S.esc(a)}</dt><dd>${S.esc(b)}</dd></div>`).join('')}</dl>${S.priceHTML(state)}<a href="${S.records[id].page}#service-config" class="text-link">修改日期、人数与费用条件 ↗</a>`;
for(const el of form.elements)if(el.name)el.value=state.notes[el.name]||'';
function save(){for(const el of form.elements)if(el.name)state.notes[el.name]=el.value;S.save(state);}
function text(){return `${S.title(state)} 想咨询一下。\n\n`+S.rows(state).map(([a,b])=>a+': '+b).join('\n')+'\n\n'+[['flight',"航班·会合时间"],['hotel',"酒店·会合地点"],['luggage',"行李·特别需要确认的事"],['wishes',"其他要求"]].filter(([k])=>state.notes[k]?.trim()).map(([k,label])=>label+': '+state.notes[k].trim()).join('\n')+'\n\n'+S.priceLines(state)+"\n\n请说明能否预订、最终总价、包含与另计项目，以及取消条件。";}
function show(){save();messageBox.value=text();edit.hidden=true;review.hidden=false;messageBox.style.height='auto';messageBox.style.height=messageBox.scrollHeight+8+'px';review.scrollIntoView({block:'start'});}
form.addEventListener('input',save);form.addEventListener('submit',e=>{e.preventDefault();show();history.replaceState(null,'',location.pathname+location.search+'#review');});
document.querySelector('#service-edit-button').onclick=()=>{review.hidden=true;edit.hidden=false;history.replaceState(null,'',location.pathname+location.search);edit.scrollIntoView({block:'start'});};
document.querySelector('#service-copy-open').onclick=async()=>{const status=document.querySelector('#service-copy-status');try{await navigator.clipboard.writeText(messageBox.value);status.textContent="已复制，请粘贴到微信聊天窗口并发送。";window.Notebook.openContact();}catch{messageBox.focus();messageBox.select();status.textContent="内容已选中。请使用设备的复制功能，然后在下方打开微信。";}document.querySelector('#service-chat-fallback').hidden=false;};
if(location.hash==='#review')show();window.addEventListener('resize',()=>{if(!review.hidden){messageBox.style.height='auto';messageBox.style.height=messageBox.scrollHeight+8+'px';}});document.fonts.ready.then(()=>{if(!review.hidden){messageBox.style.height='auto';messageBox.style.height=messageBox.scrollHeight+8+'px';}});
})();
