(() => {
  const {routes, concerns, answers, read, save, escape: esc} = window.Journey;
  const catalog = window.ProductCatalog;
  let state = read();
  const page = document.body.dataset.page;
  const query = new URLSearchParams(location.search);
  if (query.get('view') === 'full') document.body.classList.add('full-view');
  const $ = selector => document.querySelector(selector);
  const route = () => routes[state.route];
  const routeImage = r => r.imageFile || (r.image==='stream'?'/assets/notebook/bfeacd45dd7d/photos/golden-whip-owner-real.webp':'/assets/notebook/bfeacd45dd7d/photos/'+r.image+(r.image==='cliff'?'-privacy.png':'.webp'));
  const chosenMoments = () => Array.isArray(state.moments?.[state.route]) ? state.moments[state.route] : [];
  const put = () => save(state);
  const CHAT = 'https://pf.kakao.com/_hvrmn/chat';
  function updateAnswers() {
    const replies = answers(page === 'selection' ? '' : state.route);
    document.querySelectorAll('[data-answer]').forEach(el => {
      const index = Number(el.dataset.answer);
      el.textContent = replies[index];
      el.hidden = !state.concerns.includes(concerns[index]);
    });
  }
  function renderConcerns() {
    $('#concern-options').innerHTML = concerns.map((text, index) => `<div class="concern-item"><label class="check-option"><input type="checkbox" name="concerns" value="${index}" aria-controls="answer-${index}" ${state.concerns.includes(text) ? 'checked' : ''}><span>${esc(text)}</span></label><p class="concern-answer" id="answer-${index}" data-answer="${index}" hidden></p></div>`).join('');
    $('#concern-options').addEventListener('change', () => { state.concerns = [...document.querySelectorAll('input[name="concerns"]:checked')].map(x => concerns[Number(x.value)]); put(); updateAnswers(); });
    updateAnswers();
  }
  if (page === 'selection') {
    const fit = {experience45:'산 위의 풍경도, 숲길에서 쉬는 시간도 원하는 분',regular34:'휴가는 짧고, 대표 풍경을 먼저 보고 싶은 분',regular56:'산과 함께 오래된 마을의 밤도 보고 싶은 분'};
    $('#routes').innerHTML = Object.values(routes).sort((a,b)=>a.nights-b.nights).map(r => `<article class="route-card" data-route="${r.id}" id="${r.id}"><div class="card-top"><span class="duration">${r.duration}</span><span class="route-label">${r.id === 'experience45' ? '삼림공원에 이틀' : r.id === 'regular34' ? '대표 풍경에 세 날' : '황석채·휴식·부용진' }</span></div><figure><img src="${routeImage(r)}" alt="${esc(r.alt)}" loading="eager" decoding="sync"><figcaption>${r.caption}</figcaption></figure><div class="card-content"><h2>${r.heading}</h2><p class="fit-line">${fit[r.id]}</p><p>${r.story}</p><div class="reason"><b>이렇게 시간을 나눴어요</b><p>${r.reason}</p></div><div class="tradeoff">${r.tradeoff}</div><details><summary>${r.duration} 흐름과 포함 항목</summary><p class="outline-note">${r.condition}</p><ol class="day-list">${r.days.map((day,i) => `<li><b>${i+1}일차</b><span>${day}</span></li>`).join('')}</ol><p class="outline-note"><b>견적에 담을 항목</b><br>${r.included}</p><p class="small">${r.note}</p><p class="outline-note">항공권·여행자보험·개인 경비 별도. 호텔·객실·식사 횟수와 예약 가능 여부는 최종 견적에서 확인합니다.</p></details>${catalog.glanceHTML(r.id)}${r.detail ? `<a class="detail-link" href="${r.detail}">${r.duration} 사진·경험 자세히 보기</a>` : ''}<a class="button primary" data-start="${r.id}" href="consultation.html?trip=${r.id}">${r.duration} 일정·견적 문의</a></div></article>`).join('');
    function showSelection() {
      const r = route();
      document.querySelectorAll('[data-route]').forEach(card => card.dataset.selected=String(card.dataset.route===state.route));
      $('#selected-title').textContent = r ? `${r.duration} · ${r.title.replace('장가계, ', '')}` : '아직 코스를 못 골랐어도 괜찮아요';
      $('#selected-sub').textContent = r ? '작성 중인 문의를 이어갈 수 있어요' : '한국어로 날짜·인원부터 물어보세요';
      $('#continue').textContent = r ? '문의 이어가기' : '추천부터 문의';
      $('#continue').href = r ? 'consultation.html' : 'consultation.html?trip=custom';
    }
    function setPriceRoute(id){document.querySelectorAll('[data-price-route]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.priceRoute===id)));document.querySelector('#quote [data-product-price]').dataset.productPrice=id;document.querySelector('#quote [data-product-scope]').dataset.productScope=id;const link=document.querySelector('#quote-consult');link.href='consultation.html?trip='+id;link.dataset.start=id;catalog.mount();}
    function showFilter() {
      if (!['all','3','4','5'].includes(state.filter)) state.filter='all';
      let count=0;
      document.querySelectorAll('[data-route]').forEach(card=>{const visible=state.filter==='all'||routes[card.dataset.route].nights===Number(state.filter);card.hidden=!visible;if(visible)count++;});
      document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===state.filter)));
      $('#filter-status').textContent=`${count}가지 여행 · 사진과 함께 조금 더 살펴보세요.`;
      if(state.filter!=='all')setPriceRoute(Object.values(routes).find(r=>r.nights===Number(state.filter)).id);
    }
    document.querySelectorAll('[data-start]').forEach(link=>link.addEventListener('click',()=>{state.route=link.dataset.start;put();}));
    document.querySelectorAll('[data-jump]').forEach(link=>link.addEventListener('click',()=>{state.filter='all';put();showFilter();}));
    document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.filter=button.dataset.filter;put();showFilter();}));
    $('#undecided').addEventListener('click',()=>{state.route='';put();location.href='consultation.html?trip=custom';});
    renderConcerns();showSelection();showFilter();catalog.mount();
    document.querySelectorAll('[data-price-route]').forEach(b=>b.addEventListener('click',()=>setPriceRoute(b.dataset.priceRoute)));
    document.addEventListener('productprice:changed',()=>{state=read();showSelection();});
    window.addEventListener('pageshow',event=>{if(event.persisted){state=read();showSelection();showFilter();document.querySelectorAll('input[name="concerns"]').forEach(x=>x.checked=state.concerns.includes(concerns[Number(x.value)]));updateAnswers();catalog.mount();}});
  }
  if (page === 'consultation') {
    const requested=query.get('trip');
    if(requested!==null){state.route=routes[requested]?requested:'';put();if(!routes[requested]&&requested!=='custom')$('#route-status').textContent='선택한 코스를 찾지 못했어요. 추천 상담으로 시작하거나 여행을 다시 골라주세요.';}
    if(!routes[state.route])state.route='';
    const r=route();
    $('#chosen-route').innerHTML=r?`<div class="chosen-top"><img src="${routeImage(r)}" alt="${esc(r.alt)}" loading="eager" decoding="sync"><div><p>관심 여행 · ${r.duration}</p><h2>${r.title}</h2><a href="trips.html#choose">다른 코스와 비교하기</a></div></div>`:`<div class="chosen-top"><div><p>코스가 아직 미정이에요</p><h2>우리 일행에게 맞는 여행 찾기</h2><a href="trips.html#choose">세 가지 여행 비교하기</a></div></div>`;
    $('#quote-context').hidden = !catalog.get(r?.id);
    const form=$('#consult-form');
    for(const field of form.elements)if(field.name&&field.name!=='concerns'&&Object.hasOwn(state.fields,field.name))field.value=state.fields[field.name];
    window.NotebookFamily.mount(form,state.fields);
    renderConcerns();
    const value=(name,fallback='')=>String(form.elements[name]?.value||'').trim()||fallback;
    function arrivalNote(){
      const arrival=value('arrival');let text;
      if(r?.id==='regular34')text=arrival==='early'?'오전 도착이면 첫날 천문산을 넣는 구성을 확인할 수 있어요. 지금 표시된 기본요금은 늦은 도착형이므로 항공편으로 다시 맞춥니다.':arrival==='late'?'오후 도착은 당일 천문산 입장 가능 시간부터 확인해요. 현재 기본 일정과 달라지는 식사·관광일을 함께 안내합니다.':'첫날은 휴식, 마지막 날은 황룡동·대협곡 관광 후 늦은 귀국편 기준입니다. 늦게 도착해도 늦은 귀국편이면 이 순서로 준비할 수 있어요.';
      else if(r?.id==='experience45')text='첫날 밤은 휴식, 마지막 날은 황룡동·대협곡을 기준으로 해요. 귀국편이 이르면 마지막 날 구성을 조정합니다.';
      else if(r?.id==='regular56')text='황석채 뒤 오후는 호텔 휴식, 부용진은 다섯째 날 오후·야경입니다. 마지막 날 황룡동·대협곡 뒤 늦게 귀국하는 기준으로 확인해요.';
      else text='항공권을 사기 전이라면 가능한 날짜와 휴가 일수부터 알려주세요. 실제 관광할 수 있는 시간을 함께 확인해요.';
      $('#arrival-note').textContent=text;$('#base-condition').textContent=text;
    }
    function renderMoments(){const moments=chosenMoments();$('#expectations').hidden=!moments.length;$('#consult-moments').innerHTML=moments.map((text,i)=>`<li><span>${esc(text)}</span><button type="button" data-remove="${i}" aria-label="${esc(text)} 선택 해제">빼기</button></li>`).join('');$('#back-detail').hidden=!r?.detail;if(r?.detail)$('#back-detail').href=r.detail+'#days';document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{state.moments[state.route]=chosenMoments().filter((_,i)=>i!==Number(button.dataset.remove));put();renderMoments();}));}
    function syncPrice(){if(catalog.get(r?.id))$('#quote-context').innerHTML=catalog.inquiryHTML(r.id,state.fields)+window.NotebookFamily.priceNote(state.fields);}
    function saveFields(){for(const field of form.elements)if(field.name&&field.name!=='concerns')state.fields[field.name]=field.value;const n=catalog.partyFromText(state.fields.party);if(r&&n){state.pricingParties={...state.pricingParties,[r.id]:n};if(r.id==='experience45')state.pricing45Party=n;}put();arrivalNote();syncPrice();}
    function message(){
      const arrivalLabels={early:'13:00 전 도착',late:'13:00 이후 도착',night:'늦은 밤 도착'};
      const lines=[r?`${r.title} ${r.duration} 문의드려요.`:'우리 일행에게 맞는 장가계 코스를 추천받고 싶어요.',`날짜: ${value('dates','아직 미정')}`,window.NotebookFamily.message(state.fields)];
      if(r&&r.id!=='regular34')lines.push('ID: '+(r.id==='regular56'?'56':'experience45'));
      if(value('arrival'))lines.push('장가계 도착: '+arrivalLabels[value('arrival')]+' 예정 (중국 현지 시간)');
      for(const [name,label] of [['departure','귀국편'],['companions','동행인'],['pace','걷는 속도'],['room','희망 객실'],['budget','희망 예산 (항공권 제외)']])if(value(name))lines.push(label+': '+value(name));
      if(r?.id==='regular34'&&['early','late'].includes(value('arrival')))lines.push('도착일 관광 배치와 변경 금액도 함께 확인해 주세요.');
      if(chosenMoments().length)lines.push('꼭 갖고 싶은 시간:\n'+chosenMoments().map(x=>'• '+x).join('\n'));
      if(state.concerns.length)lines.push('궁금한 점:\n'+state.concerns.map(x=>'• '+x).join('\n'));
      if(catalog.get(r?.id)) lines.push(catalog.inquiryLines(r.id,state.fields));
      if(value('wishes'))lines.push('추가 요청: '+value('wishes'));
      lines.push('일정·호텔·포함 항목과 항공권을 제외한 1인 금액 및 일행 총액을 안내해 주세요.');
      return lines.map((line,i)=>(i===1||line.startsWith('꼭 갖고')||line.startsWith('궁금한')||line.startsWith('추가 요청')||line.startsWith('확인한 ')||line.startsWith('기본요금 적용')||i===lines.length-1?'\n':'')+line).join('\n');
    }
    function fitMessage(){const field=$('#inquiry-message');field.style.height='auto';field.style.height=(field.scrollHeight+8)+'px';}
    function showReview(scroll=true){if(!form.reportValidity())return;saveFields();$('#inquiry-message').value=message();$('#copy-status').textContent='';$('#edit-step').hidden=true;$('#review-step').hidden=false;fitMessage();if(scroll){$('#review-heading').focus({preventScroll:true});$('#review-step').scrollIntoView({block:'start'});}}
    form.addEventListener('input',saveFields);form.addEventListener('change',saveFields);
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;history.pushState({journeyReview:true},'',location.pathname+location.search+'#review');showReview();});
    function edit(scroll=true){$('#review-step').hidden=true;$('#edit-step').hidden=false;if(scroll){form.elements.dates.focus({preventScroll:true});$('#top').scrollIntoView({block:'start'});}}
    function goEdit(){if(location.hash==='#review'&&history.state?.journeyReview){history.back();}else{history.replaceState(null,'',location.pathname+location.search);edit();}}
    $('#edit-message').addEventListener('click',goEdit);$('#edit-top').addEventListener('click',goEdit);
    window.addEventListener('popstate',()=>{if(location.hash==='#review')showReview();else edit();});
    async function copy(){try{await navigator.clipboard.writeText($('#inquiry-message').value);$('#copy-status').textContent='복사했어요. 카카오톡에서 붙여넣고 보내주세요.';return true;}catch{$('#inquiry-message').focus();$('#inquiry-message').select();$('#copy-status').textContent='복사할 내용을 선택했어요. 기기의 복사 기능으로 복사한 뒤 카카오톡을 열어주세요.';return false;}finally{$('#chat-fallback').hidden=false;}}
    $('#copy-message').addEventListener('click',copy);
    $('#copy-open').addEventListener('click',async()=>{if(await copy())window.Notebook.openContact();});
    arrivalNote();renderMoments();syncPrice();if(location.hash==='#review')showReview(false);
    window.addEventListener('resize',()=>{if(!$('#review-step').hidden)fitMessage();});
    document.fonts.ready.then(()=>{if(!$('#review-step').hidden)fitMessage();});
  }
})();
