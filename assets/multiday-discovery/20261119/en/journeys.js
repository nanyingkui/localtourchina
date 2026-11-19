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
    const fit = {experience45:"For mountain views and time to pause on forest paths",regular34:"For a short break focused on the signature views",regular56:"For mountain scenery and an old village after dark"};
    $('#routes').innerHTML = Object.values(routes).sort((a,b)=>a.nights-b.nights).map(r => `<article class="route-card" data-route="${r.id}" id="${r.id}"><div class="card-top"><span class="duration">${r.duration}</span><span class="route-label">${r.id === 'experience45' ? "Two days in the forest park" : r.id === 'regular34' ? "Three days of signature views" : "Huangshizhai, rest & Furong" }</span></div><figure><img src="${routeImage(r)}" alt="${esc(r.alt)}" loading="eager" decoding="sync"><figcaption>${r.caption}</figcaption></figure><div class="card-content"><h2>${r.heading}</h2><p class="fit-line">${fit[r.id]}</p><p>${r.story}</p><div class="reason"><b>Why we divide the days this way</b><p>${r.reason}</p></div><div class="tradeoff">${r.tradeoff}</div><details><summary>${r.duration} Route and inclusions</summary><p class="outline-note">${r.condition}</p><ol class="day-list">${r.days.map((day,i) => `<li><b>Day ${i+1}</b><span>${day}</span></li>`).join('')}</ol><p class="outline-note"><b>Items to confirm in your quote</b><br>${r.included}</p><p class="small">${r.note}</p><p class="outline-note">Flights, travel insurance and personal spending are extra. Your final quote confirms the hotel, rooms, meal count and availability.</p></details>${catalog.glanceHTML(r.id)}${r.detail ? `<a class="detail-link" href="${r.detail}">${r.duration} See photos and experiences</a>` : ''}<a class="button primary" data-start="${r.id}" href="consultation.html?trip=${r.id}">${r.duration} Ask about itinerary and price</a></div></article>`).join('');
    function showSelection() {
      const r = route();
      document.querySelectorAll('[data-route]').forEach(card => card.dataset.selected=String(card.dataset.route===state.route));
      $('#selected-title').textContent = r ? `${r.duration} · ${r.title.replace("Zhangjiajie, ", '')}` : "It’s fine if you haven’t chosen a route yet";
      $('#selected-sub').textContent = r ? "Continue the inquiry you started" : "Start with your dates and group size";
      $('#continue').textContent = r ? "Continue my inquiry" : "Ask for a recommendation";
      $('#continue').href = r ? 'consultation.html' : 'consultation.html?trip=custom';
    }
    function setPriceRoute(id){document.querySelectorAll('[data-price-route]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.priceRoute===id)));document.querySelector('#quote [data-product-price]').dataset.productPrice=id;document.querySelector('#quote [data-product-scope]').dataset.productScope=id;const link=document.querySelector('#quote-consult');link.href='consultation.html?trip='+id;link.dataset.start=id;catalog.mount();}
    function showFilter() {
      if (!['all','3','4','5'].includes(state.filter)) state.filter='all';
      let count=0;
      document.querySelectorAll('[data-route]').forEach(card=>{const visible=state.filter==='all'||routes[card.dataset.route].nights===Number(state.filter);card.hidden=!visible;if(visible)count++;});
      document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===state.filter)));
      $('#filter-status').textContent=`Featured tours: ${count} · Browse every multi-day tour in the directory above.`;
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
    if(requested!==null){state.route=routes[requested]?requested:'';put();if(!routes[requested]&&requested!=='custom')$('#route-status').textContent="We couldn’t find that trip. Start with a recommendation or choose again.";}
    if(!routes[state.route])state.route='';
    const r=route();
    $('#chosen-route').innerHTML=r?`<div class="chosen-top"><img src="${routeImage(r)}" alt="${esc(r.alt)}" loading="eager" decoding="sync"><div><p>Interested in · ${r.duration}</p><h2>${r.title}</h2><a href="trips.html#choose">Compare with other trips</a></div></div>`:`<div class="chosen-top"><div><p>Route not decided yet</p><h2>Find a trip for our group</h2><a href="trips.html#choose">Compare three trips</a></div></div>`;
    $('#quote-context').hidden = !catalog.get(r?.id);
    const form=$('#consult-form');
    for(const field of form.elements)if(field.name&&field.name!=='concerns'&&Object.hasOwn(state.fields,field.name))field.value=state.fields[field.name];
    window.NotebookFamily.mount(form,state.fields);
    renderConcerns();
    const value=(name,fallback='')=>String(form.elements[name]?.value||'').trim()||fallback;
    function arrivalNote(){
      const arrival=value('arrival');let text;
      if(r?.id==='regular34')text=arrival==='early'?"With a morning arrival, we can check whether Tianmen fits on day one. The displayed base rate is for late arrival, so we’ll review the itinerary against your flight.":arrival==='late'?"With an afternoon arrival, we first check the last available Tianmen entry time. We’ll explain any changes to meals and sightseeing days.":"This plan starts with rest and ends with Huanglong Cave and the Grand Canyon before a late flight home. It can suit a late arrival when the return flight is also late.";
      else if(r?.id==='experience45')text="Rest on the first night; Huanglong Cave and the Grand Canyon on the last day. We adjust the final day for an early flight home.";
      else if(r?.id==='regular56')text="Rest at the hotel after Huangshizhai; Furong is on the afternoon and evening of day five. The final day assumes a late flight after Huanglong Cave and the Grand Canyon.";
      else text="If you haven’t bought flights, tell us your possible dates and how many days you have. We’ll check how much sightseeing time they allow.";
      $('#arrival-note').textContent=text;$('#base-condition').textContent=text;
    }
    function renderMoments(){const moments=chosenMoments();$('#expectations').hidden=!moments.length;$('#consult-moments').innerHTML=moments.map((text,i)=>`<li><span>${esc(text)}</span><button type="button" data-remove="${i}" aria-label="${esc(text)} remove selection">Remove</button></li>`).join('');$('#back-detail').hidden=!r?.detail;if(r?.detail)$('#back-detail').href=r.detail+'#days';document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{state.moments[state.route]=chosenMoments().filter((_,i)=>i!==Number(button.dataset.remove));put();renderMoments();}));}
    function syncPrice(){if(catalog.get(r?.id))$('#quote-context').innerHTML=catalog.inquiryHTML(r.id,state.fields)+window.NotebookFamily.priceNote(state.fields);}
    function saveFields(){for(const field of form.elements)if(field.name&&field.name!=='concerns')state.fields[field.name]=field.value;const n=catalog.partyFromText(state.fields.party);if(r&&n){state.pricingParties={...state.pricingParties,[r.id]:n};if(r.id==='experience45')state.pricing45Party=n;}put();arrivalNote();syncPrice();}
    function message(){
      const arrivalLabels={early:"Arrival before 13:00",late:"Arrival after 13:00",night:"Late-night arrival"};
      const lines=[r?`${r.title} ${r.duration} inquiry.`:"Please recommend a Zhangjiajie itinerary for our group.",`Dates: ${value('dates',"Not decided yet")}`,window.NotebookFamily.message(state.fields)];
      if(r&&r.id!=='regular34')lines.push('ID: '+(r.id==='regular56'?'56':'experience45'));
      if(value('arrival'))lines.push("Arrival in Zhangjiajie: "+arrivalLabels[value('arrival')]+" planned (China local time)");
      for(const [name,label] of [['departure',"Return flight"],['companions',"Travelling with"],['pace',"Walking pace"],['room',"Preferred rooms"],['budget',"Preferred budget (excluding flights)"]])if(value(name))lines.push(label+': '+value(name));
      if(r?.id==='regular34'&&['early','late'].includes(value('arrival')))lines.push("Please also check arrival-day sightseeing and any price change.");
      if(chosenMoments().length)lines.push("Moments we’d like:\n"+chosenMoments().map(x=>'• '+x).join('\n'));
      if(state.concerns.length)lines.push("Our questions:\n"+state.concerns.map(x=>'• '+x).join('\n'));
      if(catalog.get(r?.id)) lines.push(catalog.inquiryLines(r.id,state.fields));
      if(value('wishes'))lines.push("Extra requests: "+value('wishes'));
      lines.push("Please confirm the itinerary, hotel, inclusions, per-person price excluding flights, and group total.");
      return lines.map((line,i)=>(i===1||line.startsWith("Moments we’d like")||line.startsWith("Questions")||line.startsWith("Extra requests")||line.startsWith("Checked ")||line.startsWith("Base-rate conditions")||i===lines.length-1?'\n':'')+line).join('\n');
    }
    function fitMessage(){const field=$('#inquiry-message');field.style.height='auto';field.style.height=(field.scrollHeight+8)+'px';}
    function showReview(scroll=true){if(!form.reportValidity())return;saveFields();$('#inquiry-message').value=message();$('#copy-status').textContent='';$('#edit-step').hidden=true;$('#review-step').hidden=false;fitMessage();if(scroll){$('#review-heading').focus({preventScroll:true});$('#review-step').scrollIntoView({block:'start'});}}
    form.addEventListener('input',saveFields);form.addEventListener('change',saveFields);
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;history.pushState({journeyReview:true},'',location.pathname+location.search+'#review');showReview();});
    function edit(scroll=true){$('#review-step').hidden=true;$('#edit-step').hidden=false;if(scroll){form.elements.dates.focus({preventScroll:true});$('#top').scrollIntoView({block:'start'});}}
    function goEdit(){if(location.hash==='#review'&&history.state?.journeyReview){history.back();}else{history.replaceState(null,'',location.pathname+location.search);edit();}}
    $('#edit-message').addEventListener('click',goEdit);$('#edit-top').addEventListener('click',goEdit);
    window.addEventListener('popstate',()=>{if(location.hash==='#review')showReview();else edit();});
    async function copy(){try{await navigator.clipboard.writeText($('#inquiry-message').value);$('#copy-status').textContent="Copied. Paste it into WhatsApp and send it yourself.";return true;}catch{$('#inquiry-message').focus();$('#inquiry-message').select();$('#copy-status').textContent="The text is selected. Use your device’s copy command, then open WhatsApp.";return false;}finally{$('#chat-fallback').hidden=false;}}
    $('#copy-message').addEventListener('click',copy);
    $('#copy-open').addEventListener('click',async()=>{if(await copy())window.Notebook.openContact();});
    arrivalNote();renderMoments();syncPrice();if(location.hash==='#review')showReview(false);
    window.addEventListener('resize',()=>{if(!$('#review-step').hidden)fitMessage();});
    document.fonts.ready.then(()=>{if(!$('#review-step').hidden)fitMessage();});
  }
})();
