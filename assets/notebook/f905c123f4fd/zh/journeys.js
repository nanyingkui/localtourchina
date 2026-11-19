(() => {
  const {routes, concerns, answers, read, save, escape: esc} = window.Journey;
  const catalog = window.ProductCatalog;
  let state = read();
  const page = document.body.dataset.page;
  const query = new URLSearchParams(location.search);
  if (query.get('view') === 'full') document.body.classList.add('full-view');
  const $ = selector => document.querySelector(selector);
  const route = () => routes[state.route];
  const routeImage = r => r.imageFile || (r.image==='stream'?'/assets/notebook/f905c123f4fd/photos/golden-whip-owner-real.webp':'/assets/notebook/f905c123f4fd/photos/'+r.image+(r.image==='cliff'?'-privacy.png':'.webp'));
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
    const fit = {experience45:"既想看山顶风景，也想在林间休息的人",regular34:"假期较短，想先看代表风景的人",regular56:"除了山，也想看古镇夜色的人"};
    $('#routes').innerHTML = Object.values(routes).sort((a,b)=>a.nights-b.nights).map(r => `<article class="route-card" data-route="${r.id}" id="${r.id}"><div class="card-top"><span class="duration">${r.duration}</span><span class="route-label">${r.id === 'experience45' ? "森林公园安排两天" : r.id === 'regular34' ? "用三天看代表风景" : "黄石寨·休息·芙蓉镇" }</span></div><figure><img src="${routeImage(r)}" alt="${esc(r.alt)}" loading="eager" decoding="sync"><figcaption>${r.caption}</figcaption></figure><div class="card-content"><h2>${r.heading}</h2><p class="fit-line">${fit[r.id]}</p><p>${r.story}</p><div class="reason"><b>时间为什么这样分配</b><p>${r.reason}</p></div><div class="tradeoff">${r.tradeoff}</div><details><summary>${r.duration} 行程顺序与包含项目</summary><p class="outline-note">${r.condition}</p><ol class="day-list">${r.days.map((day,i) => `<li><b>${i+1}天</b><span>${day}</span></li>`).join('')}</ol><p class="outline-note"><b>报价包含项目</b><br>${r.included}</p><p class="small">${r.note}</p><p class="outline-note">机票、旅行保险及个人消费另计。酒店、客房、餐次及能否预订，请在最终报价中确认。</p></details>${catalog.glanceHTML(r.id)}${r.detail ? `<a class="detail-link" href="${r.detail}">${r.duration} 查看照片与体验详情</a>` : ''}<a class="button primary" data-start="${r.id}" href="consultation.html?trip=${r.id}">${r.duration} 咨询行程与报价</a></div></article>`).join('');
    function showSelection() {
      const r = route();
      document.querySelectorAll('[data-route]').forEach(card => card.dataset.selected=String(card.dataset.route===state.route));
      $('#selected-title').textContent = r ? `${r.duration} · ${r.title.replace("张家界， ", '')}` : "还没选定行程，也没关系";
      $('#selected-sub').textContent = r ? "可以继续填写刚才的咨询" : "先从日期和人数开始咨询";
      $('#continue').textContent = r ? "继续咨询" : "先咨询推荐";
      $('#continue').href = r ? 'consultation.html' : 'consultation.html?trip=custom';
    }
    function setPriceRoute(id){document.querySelectorAll('[data-price-route]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.priceRoute===id)));document.querySelector('#quote [data-product-price]').dataset.productPrice=id;document.querySelector('#quote [data-product-scope]').dataset.productScope=id;const link=document.querySelector('#quote-consult');link.href='consultation.html?trip='+id;link.dataset.start=id;catalog.mount();}
    function showFilter() {
      if (!['all','3','4','5'].includes(state.filter)) state.filter='all';
      let count=0;
      document.querySelectorAll('[data-route]').forEach(card=>{const visible=state.filter==='all'||routes[card.dataset.route].nights===Number(state.filter);card.hidden=!visible;if(visible)count++;});
      document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===state.filter)));
      $('#filter-status').textContent=`对比线路 ${count}条 · 全部多日游可在上方目录查看。`;
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
    if(requested!==null){state.route=routes[requested]?requested:'';put();if(!routes[requested]&&requested!=='custom')$('#route-status').textContent="未找到已选行程。可以先咨询推荐，或重新选择旅行。";}
    if(!routes[state.route])state.route='';
    const r=route();
    $('#chosen-route').innerHTML=r?`<div class="chosen-top"><img src="${routeImage(r)}" alt="${esc(r.alt)}" loading="eager" decoding="sync"><div><p>感兴趣的旅行 · ${r.duration}</p><h2>${r.title}</h2><a href="trips.html#all-trips">与其他行程比较</a></div></div>`:`<div class="chosen-top"><div><p>行程尚未确定</p><h2>找一条适合大家的旅行</h2><a href="trips.html#all-trips">比较9条多日游</a></div></div>`;
    $('#quote-context').hidden = !catalog.get(r?.id);
    const form=$('#consult-form');
    for(const field of form.elements)if(field.name&&field.name!=='concerns'&&Object.hasOwn(state.fields,field.name))field.value=state.fields[field.name];
    window.NotebookFamily.mount(form,state.fields);
    renderConcerns();
    const value=(name,fallback='')=>String(form.elements[name]?.value||'').trim()||fallback;
    function arrivalNote(){
      const arrival=value('arrival');let text;
      if(r?.id==='regular34')text=arrival==='early'?"上午抵达，可以考虑第一天安排天门山。当前基础价格按晚到行程计算，需根据航班重新调整。":arrival==='late'?"下午抵达，先确认当天是否赶得上天门山入园时间，并一起说明与当前基础行程不同的餐次和游览日期。":"本行程按首日休息、末日游览黄龙洞和大峡谷后晚班返程安排。即使深夜抵达，只要返程也是晚班，就可以按这个顺序准备。";
      else if(r?.id==='experience45')text="首晚休息，最后一天以黄龙洞和大峡谷为基础。返程航班较早时，会调整最后一天。";
      else if(r?.id==='regular56')text="黄石寨后的下午回酒店休息，第五天下午到芙蓉镇看夜景。按最后一天游览黄龙洞、大峡谷后晚班返程核算。";
      else text="还没买机票的话，先告诉我们可出行日期和假期天数，一起确认真正能用于游览的时间。";
      $('#arrival-note').textContent=text;$('#base-condition').textContent=text;
    }
    function renderMoments(){const moments=chosenMoments();$('#expectations').hidden=!moments.length;$('#consult-moments').innerHTML=moments.map((text,i)=>`<li><span>${esc(text)}</span><button type="button" data-remove="${i}" aria-label="${esc(text)} 取消选择">移除</button></li>`).join('');$('#back-detail').hidden=!r?.detail;if(r?.detail)$('#back-detail').href=r.detail+'#days';document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{state.moments[state.route]=chosenMoments().filter((_,i)=>i!==Number(button.dataset.remove));put();renderMoments();}));}
    function syncPrice(){if(catalog.get(r?.id))$('#quote-context').innerHTML=catalog.inquiryHTML(r.id,state.fields)+window.NotebookFamily.priceNote(state.fields);}
    function saveFields(){for(const field of form.elements)if(field.name&&field.name!=='concerns')state.fields[field.name]=field.value;const n=catalog.partyFromText(state.fields.party);if(r&&n){state.pricingParties={...state.pricingParties,[r.id]:n};if(r.id==='experience45')state.pricing45Party=n;}put();arrivalNote();syncPrice();}
    function message(){
      const arrivalLabels={early:"13:00前抵达",late:"13:00后抵达",night:"深夜抵达"};
      const lines=[r?`${r.title} ${r.duration} 想咨询一下。`:"想请你们推荐适合我们同行人的张家界行程。",`日期： ${value('dates',"尚未确定")}`,window.NotebookFamily.message(state.fields)];
      if(r&&r.id!=='regular34')lines.push('ID: '+(r.id==='regular56'?'56':'experience45'));
      if(value('arrival'))lines.push("抵达张家界： "+arrivalLabels[value('arrival')]+" 预计（中国当地时间）");
      for(const [name,label] of [['departure',"返程航班"],['companions',"同行人"],['pace',"步行节奏"],['room',"希望的客房安排"],['budget',"计划预算（不含机票）"]])if(value(name))lines.push(label+': '+value(name));
      if(r?.id==='regular34'&&['early','late'].includes(value('arrival')))lines.push("请一并确认抵达当天的游览安排及费用变化。");
      if(chosenMoments().length)lines.push("特别想留出的体验：\n"+chosenMoments().map(x=>'• '+x).join('\n'));
      if(state.concerns.length)lines.push("想了解的问题：\n"+state.concerns.map(x=>'• '+x).join('\n'));
      if(catalog.get(r?.id)) lines.push(catalog.inquiryLines(r.id,state.fields));
      if(value('wishes'))lines.push("其他要求： "+value('wishes'));
      lines.push("请说明行程、酒店、包含项目，以及不含机票的人均费用和同行总价。");
      return lines.map((line,i)=>(i===1||line.startsWith("特别想要")||line.startsWith("想了解")||line.startsWith("其他要求")||line.startsWith("已确认的 ")||line.startsWith("基础价格适用")||i===lines.length-1?'\n':'')+line).join('\n');
    }
    function fitMessage(){const field=$('#inquiry-message');field.style.height='auto';field.style.height=(field.scrollHeight+8)+'px';}
    function showReview(scroll=true){if(!form.reportValidity())return;saveFields();$('#inquiry-message').value=message();$('#copy-status').textContent='';$('#edit-step').hidden=true;$('#review-step').hidden=false;fitMessage();if(scroll){$('#review-heading').focus({preventScroll:true});$('#review-step').scrollIntoView({block:'start'});}}
    form.addEventListener('input',saveFields);form.addEventListener('change',saveFields);
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;history.pushState({journeyReview:true},'',location.pathname+location.search+'#review');showReview();});
    function edit(scroll=true){$('#review-step').hidden=true;$('#edit-step').hidden=false;if(scroll){form.elements.dates.focus({preventScroll:true});$('#top').scrollIntoView({block:'start'});}}
    function goEdit(){if(location.hash==='#review'&&history.state?.journeyReview){history.back();}else{history.replaceState(null,'',location.pathname+location.search);edit();}}
    $('#edit-message').addEventListener('click',goEdit);$('#edit-top').addEventListener('click',goEdit);
    window.addEventListener('popstate',()=>{if(location.hash==='#review')showReview();else edit();});
    async function copy(){try{await navigator.clipboard.writeText($('#inquiry-message').value);$('#copy-status').textContent="已复制，请在微信中粘贴并发送。";return true;}catch{$('#inquiry-message').focus();$('#inquiry-message').select();$('#copy-status').textContent="已选中咨询内容。请使用设备的复制功能，再打开微信。";return false;}finally{$('#chat-fallback').hidden=false;}}
    $('#copy-message').addEventListener('click',copy);
    $('#copy-open').addEventListener('click',async()=>{if(await copy())window.Notebook.openContact();});
    arrivalNote();renderMoments();syncPrice();if(location.hash==='#review')showReview(false);
    window.addEventListener('resize',()=>{if(!$('#review-step').hidden)fitMessage();});
    document.fonts.ready.then(()=>{if(!$('#review-step').hidden)fitMessage();});
  }
})();
