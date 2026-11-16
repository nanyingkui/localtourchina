(()=>{
const S=window.Services,requested=new URLSearchParams(location.search).get('service'),id=S.records[requested]?requested:'airport';let state=S.read(id);
const form=document.querySelector('#service-inquiry-form'),edit=document.querySelector('#service-edit'),review=document.querySelector('#service-review'),messageBox=document.querySelector('#service-message');
document.querySelector('#service-chosen').innerHTML=`<h2>${S.title(state)}</h2><dl>${S.rows(state).map(([a,b])=>`<div><dt>${S.esc(a)}</dt><dd>${S.esc(b)}</dd></div>`).join('')}</dl>${S.priceHTML(state)}<a href="${S.records[id].page}#service-config" class="text-link">날짜·인원·요금 조건 수정하기 ↗</a>`;
for(const el of form.elements)if(el.name)el.value=state.notes[el.name]||'';
function save(){for(const el of form.elements)if(el.name)state.notes[el.name]=el.value;S.save(state);}
function text(){return `${S.title(state)} 문의드려요.\n\n`+S.rows(state).map(([a,b])=>a+': '+b).join('\n')+'\n\n'+[['flight','항공편·만날 시각'],['hotel','숙소·만날 장소'],['luggage','짐·특별히 확인할 것'],['wishes','추가 요청']].filter(([k])=>state.notes[k]?.trim()).map(([k,label])=>label+': '+state.notes[k].trim()).join('\n')+'\n\n'+S.priceLines(state)+'\n\n예약 가능 여부와 최종 총액, 포함·별도 항목 및 취소 조건을 한국어로 안내해 주세요.';}
function show(){save();messageBox.value=text();edit.hidden=true;review.hidden=false;messageBox.style.height='auto';messageBox.style.height=messageBox.scrollHeight+8+'px';review.scrollIntoView({block:'start'});}
form.addEventListener('input',save);form.addEventListener('submit',e=>{e.preventDefault();show();history.replaceState(null,'',location.pathname+location.search+'#review');});
document.querySelector('#service-edit-button').onclick=()=>{review.hidden=true;edit.hidden=false;history.replaceState(null,'',location.pathname+location.search);edit.scrollIntoView({block:'start'});};
document.querySelector('#service-copy-open').onclick=async()=>{const status=document.querySelector('#service-copy-status');try{await navigator.clipboard.writeText(messageBox.value);status.textContent='복사했어요. 카카오톡 채팅창에 붙여넣고 보내주세요.';window.Notebook.openContact();}catch{messageBox.focus();messageBox.select();status.textContent='내용을 선택했어요. 기기의 복사 기능으로 복사한 뒤 아래에서 카카오톡을 열어주세요.';}document.querySelector('#service-chat-fallback').hidden=false;};
if(location.hash==='#review')show();window.addEventListener('resize',()=>{if(!review.hidden){messageBox.style.height='auto';messageBox.style.height=messageBox.scrollHeight+8+'px';}});document.fonts.ready.then(()=>{if(!review.hidden){messageBox.style.height='auto';messageBox.style.height=messageBox.scrollHeight+8+'px';}});
})();
