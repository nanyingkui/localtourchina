/* One validation contract for copying a configured request and continuing it. */
(() => {
  if (window.LTCValidation) return;
  const lang = document.documentElement.lang.startsWith('zh') ? 'zh' : document.documentElement.lang === 'en' ? 'en' : 'ko';
  const words = {
    ko: {required:'필수 정보를 입력하거나 선택해 주세요.',date:'중국 현지 날짜 기준 오늘 이후의 날짜를 선택해 주세요.',tomorrow:'이 상품은 당일 예약이 불가합니다. 중국 현지 날짜 기준 내일 이후를 선택해 주세요.',integer:'0 이상의 정수를 입력해 주세요.',positive:'1 이상의 정수를 입력해 주세요.',hours:'하루 이용 시간은 1~24시간의 정수로 입력해 주세요. 여러 날은 날짜를 추가하거나 별도 상담해 주세요.',people:'여행 인원을 1명 이상 입력해 주세요.',twoPeople:'이 상품은 2명 이상 선택해 주세요.',group:'온라인 계산 범위를 넘는 단체입니다. 인원을 줄이지 말고 아래 단체 상담으로 문의해 주세요.',end:'출발 날짜는 도착 날짜보다 뒤여야 합니다.',forest:'두 번째 방문은 첫 방문의 다음 날부터 3일 후까지 가능합니다.',duplicate:'중복되지 않는 이용 날짜를 선택해 주세요.',summary:'필수 정보를 확인해 주세요. 표시된 항목을 수정한 뒤 다시 눌러 주세요.',estimate:'입력 내용을 확인해야 예상 금액을 안내할 수 있습니다.',consult:'단체·여러 날 별도 상담',unknown:'날짜 미정',choose:'서비스를 하나 이상 선택해 주세요.'},
    zh: {required:'请填写或选择此必填项。',date:'请选择中国当地今天或之后的日期。',tomorrow:'此产品不接受当天预订。请选择中国当地明天或之后的日期。',integer:'请输入不小于0的整数。',positive:'请输入不小于1的整数。',hours:'每天服务时间请输入1至24的整数。多天服务请添加日期或单独咨询。',people:'请至少填写1位旅客。',twoPeople:'此产品请至少选择2位旅客。',group:'人数超出在线计算范围。请保留实际人数，通过下方团体咨询确认报价。',end:'离开日期必须晚于抵达日期。',forest:'第二次入园应在首次入园后1至3天内。',duplicate:'请选择不重复的服务日期。',summary:'请检查必填信息，修改标出的项目后再试。',estimate:'请先核对输入信息，再查看预计金额。',consult:'团体或多天服务咨询',unknown:'日期未定',choose:'请至少选择一项服务。'},
    en: {required:'Complete or select this required field.',date:'Choose today or a later date in China local time.',tomorrow:'Same-day booking is unavailable. Choose tomorrow or later in China local time.',integer:'Enter a whole number of zero or more.',positive:'Enter a whole number of one or more.',hours:'Enter 1–24 whole hours per day. Add dates or request a custom quote for several days.',people:'Enter at least one traveller.',twoPeople:'Select at least two travellers for this product.',group:'This group exceeds the online calculator range. Keep the actual group size and request a custom quote below.',end:'Departure must be after arrival.',forest:'The second visit must be 1–3 days after the first.',duplicate:'Choose a different date for each service day.',summary:'Check the required details, correct the marked fields and try again.',estimate:'Check the entered details before relying on an estimate.',consult:'Request a group or multi-day quote',unknown:'Dates undecided',choose:'Choose at least one service.'}
  }[lang];
  const $ = s => document.querySelector(s), all = s => [...document.querySelectorAll(s)];
  const value = id => document.getElementById(id)?.value?.trim() || '';
  const chinaToday = (now = new Date()) => {
    const p = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    return ['year','month','day'].map(k => p.find(x => x.type === k).value).join('-');
  };
  const addDays = (date,n) => {const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
  const validDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date+'T00:00:00Z')) && new Date(date+'T00:00:00Z').toISOString().slice(0,10) === date;
  const scopeFor = service => document.getElementById('service-'+service) || (lang==='en' ? $('section.inquiry') : null);
  const selectedServices = () => [['comboTicket','ticket'],['comboDay','daytour'],['comboGuide','guide'],['comboVehicle','vehicle']].filter(([id])=>document.getElementById(id)?.checked).map(([,service])=>service);
  function collect(service, now = new Date()) {
    const issues=[],today=chinaToday(now);
    const flag=(el,key)=>{if(el&&!issues.some(x=>x.el===el))issues.push({el,message:words[key],key});};
    const required=el=>{if(el&&!el.value.trim())flag(el,'required');};
    const number=(el,{min=0,max=null,hours=false}={})=>{if(!el)return;const n=Number(el.value);if(el.value.trim()===''||!Number.isInteger(n)||n<min)flag(el,hours?'hours':min?'positive':'integer');else if(max!==null&&n>max)flag(el,hours?'hours':'group');};
    const date=(el,min=today)=>{if(!el)return;if(!validDate(el.value)||el.value<min)flag(el,min>today?'tomorrow':'date');};
    const radio=name=>{const el=$(`input[name="${name}"]`);if(el&&!$(`input[name="${name}"]:checked`))flag(el,'required');};
    if(lang==='en' && !document.getElementById('service-'+service) && $('section.inquiry')) {
      if(!$('#datesUndecided')?.checked)required($('#dates'));
      number($('#people'),{min:1});
      return issues;
    }
    if(service==='combo') {
      const selected=selectedServices();if(!selected.length)flag($('#comboTicket'),'choose');
      selected.forEach(key=>issues.push(...collect(key,now)));return issues;
    }
    if(service==='ticket') {
      const ids=all('#attractions input:checked').map(el=>el.value);if(!ids.length)flag($('#attractions input'),'choose');
      ids.forEach(id=>{
        const root=document.getElementById('config-'+id);if(!root)return;
        const counts=[...root.querySelectorAll('.age-count:not(:disabled)')];counts.forEach(el=>number(el,{max:Number(el.max)||30}));
        if(!counts.some(el=>Number(el.value)>0))flag(counts[0],'people');
        if(id==='forest') {
          for(const n of [1,2]) {
            const d=root.querySelector('.date'+n),t=root.querySelector('.time'+n),gate=$(`input[name="forest-gate-${n}"]:checked`),route=$(`input[name="forest-route-${n}"]:checked`);
            if(n===2&&!d.value&&!t.value&&!gate&&!route)continue;
            date(d);required(t);radio('forest-gate-'+n);
            if(gate===root.querySelector(`input[name="forest-gate-${n}"]`))radio('forest-route-'+n);
          }
          const d1=root.querySelector('.date1'),d2=root.querySelector('.date2');
          if(validDate(d1.value)&&validDate(d2.value)&&(d2.value<addDays(d1.value,1)||d2.value>addDays(d1.value,3)))flag(d2,'forest');
        } else if(id==='tianmen') {radio('tianmen-route');date($('#tianmenDate'));required($('#tianmenTime'));}
        else {radio('canyon-package');date($('#canyonDate'));}
      });
    }
    if(service==='daytour') {
      const sanya=!!$('input[name="dayProduct"]:checked')?.value.startsWith('sanya-');
      date($('#dayDate'),sanya?addDays(today,1):today);
      const counts=all('#dayAgeRows .day-count');counts.forEach(el=>number(el,{max:Number(el.max)||30}));
      if(counts.reduce((n,el)=>n+Number(el.value||0),0)<(sanya?2:1))flag(counts[0],sanya?'twoPeople':'people');
      if(sanya)required($('#dayMeeting'));else {required($('#dayPickupPlace'));required($('#dayDropoffPlace'));}
    }
    if(service==='guide') {
      const dates=all('.guide-date'),seen=new Set();dates.forEach(el=>{date(el);if(seen.has(el.value))flag(el,'duplicate');seen.add(el.value);});
      required($('#guideStartTime'));required($('#guideMeetingPlace'));
      if(!$('#guideSights input:checked')&&!value('guideItinerary'))flag($('#guideItinerary'),'required');
      number($('#guidePeople'),{min:1,max:99});number($('#guideHours'),{min:1,max:24,hours:true});
    }
    if(service==='vehicle') {
      date($('#vehicleDate'));['vehicleTime','vehiclePickup','vehicleDropoff'].forEach(id=>required(document.getElementById(id)));
      number($('#vehiclePeople'),{min:1,max:34});number($('#vehicleLuggage'),{max:40});
      if($('#vehicleService input:checked')?.value==='rental')number($('#vehicleHours'),{min:1,max:24,hours:true});
    }
    if(service==='private') {
      date($('#privateStart'));date($('#privateEnd'));
      if(value('privateStart')&&value('privateEnd')&&value('privateEnd')<=value('privateStart'))flag($('#privateEnd'),'end');
      number($('#privatePeople'),{min:1,max:30});number($('#privateRooms'),{min:1,max:15});number($('#privateSingles'),{max:15});
    }
    return issues;
  }
  const attempted=new Set();
  function clear(scope) {
    scope?.querySelectorAll('[data-ltc-error]').forEach(el=>el.remove());
    scope?.querySelectorAll('[data-ltc-invalid]').forEach(el=>{el.removeAttribute('aria-invalid');const ids=(el.getAttribute('aria-describedby')||'').split(' ').filter(id=>!id.startsWith('ltc-field-error-'));if(ids.length)el.setAttribute('aria-describedby',ids.join(' '));else el.removeAttribute('aria-describedby');el.removeAttribute('data-ltc-invalid');});
  }
  function present(service,issues,focus=false) {
    const scopes=service==='combo'?['combo',...selectedServices()]:[service];scopes.forEach(key=>clear(scopeFor(key)));
    if(!issues.length)return;
    issues.forEach(({el,message},i)=>{
      const error=document.createElement('p');error.className='field-error';error.dataset.ltcError='true';error.id='ltc-field-error-'+service+'-'+i;error.textContent=message;
      el.setAttribute('aria-invalid','true');el.dataset.ltcInvalid='true';el.setAttribute('aria-describedby',[el.getAttribute('aria-describedby'),error.id].filter(Boolean).join(' '));
      (el.closest('.field,.age-row,.combo-service,label')||el).insertAdjacentElement('afterend',error);
    });
    const scope=scopeFor(service),summary=document.createElement('div');summary.dataset.ltcError='true';summary.className='field-error ltc-validation-summary';summary.setAttribute('role','alert');summary.textContent=words.summary;
    if(issues.some(x=>x.key==='group')){const link=document.createElement('a');link.href='/?view=consult&mode=help'+(lang==='ko'?'':'&lang='+lang);link.textContent=words.consult;link.style.display='block';link.addEventListener('click',()=>{const inquiry=document.getElementById({ticket:'inquiry',daytour:'dayInquiry',guide:'guideInquiry',vehicle:'vehicleInquiry',private:'privateInquiry',combo:'comboInquiry'}[service]);try{sessionStorage.setItem('ltc-selected-conditions',JSON.stringify({service:'help',services:['help'],language:lang,sourcePath:location.pathname,inquiryText:words.consult+'\n'+(inquiry?.value||'').split('\n').filter(line=>!/(?:[\d,]+(?:\.\d+)?\s*(?:원|韩元)|(?:USD|KRW)\s*\d)/.test(line)).join('\n')+'\n'+[...scope.querySelectorAll('input[type=number]')].map(el=>(el.labels?.[0]?.textContent.trim()||el.id)+': '+el.value).join('\n'),fields:[],people:''}));}catch{}});summary.append(link);}
    scope?.prepend(summary);
    if(focus){const el=issues[0].el,panel=el.closest('.service-panel');if(panel?.hidden&&document.body.dataset.initialService==='combo')$(`[data-open-service="${panel.id.replace('service-','')}"]`)?.click();
      const stage=el.closest('[data-private-stage]');if(stage?.hidden)$(`[data-private-go="${stage.dataset.privateStage}"]`)?.click();
      for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
      requestAnimationFrame(()=>{el.scrollIntoView({block:'center',behavior:window.LTCInterface?.scrollBehavior?.()||'auto'});el.focus({preventScroll:true});});
    }
  }
  function validate(service,{showErrors=true}={}) {const issues=collect(service);const scope=scopeFor(service);if(scope)scope.dataset.ready=String(!issues.length);if(showErrors){attempted.add(service);present(service,issues,true);}return issues.length===0;}
  const copyServices={copyBtn:'ticket',dayCopy:'daytour',guideCopy:'guide',vehicleCopy:'vehicle',privateCopy:'private',comboCopy:'combo',copy:'english'};
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!copyServices[button.id])return;const service=copyServices[button.id];if(!validate(service)){event.preventDefault();event.stopImmediatePropagation();}},true);
  function refresh() {
    const today=chinaToday();all('input[type="date"]').forEach(el=>{if(!el.matches('.date2'))el.min=today;});
    const sanya=$('input[name="dayProduct"]:checked')?.value.startsWith('sanya-');if($('#dayDate')&&sanya)$('#dayDate').min=addDays(today,1);
    const first=$('#config-forest .date1'),second=$('#config-forest .date2');if(second){second.min=validDate(first?.value)?addDays(first.value,1):today;if(validDate(first?.value))second.max=addDays(first.value,3);else second.removeAttribute('max');}
    for(const id of Object.keys(copyServices)){const button=document.getElementById(id);if(button)button.disabled=false;}
    attempted.forEach(service=>present(service,collect(service)));
    for(const service of ['ticket','guide','vehicle','private','daytour','combo']){
      const scope=scopeFor(service);if(!scope)continue;
      const issues=collect(service);scope.dataset.ready=String(!issues.length);const copyId=Object.keys(copyServices).find(id=>copyServices[id]===service);const button=document.getElementById(copyId);if(button)button.dataset.ready=String(!issues.length);
      const hint=document.getElementById({ticket:'formHint',guide:'guideFormHint',vehicle:'vehicleFormHint',private:'privateAlerts',daytour:'dayFormHint',combo:'comboStatus'}[service]);if(hint&&issues.length&&service!=='private')hint.textContent=issues[0].message;
      const invalid=issues.some(x=>['integer','positive','hours','group'].includes(x.key));
      scope.querySelectorAll('.price,#total,#comboTotal').forEach(el=>el.hidden=invalid);
      const id='ltc-estimate-'+service;let notice=document.getElementById(id);if(invalid&&!notice){notice=document.createElement('p');notice.id=id;notice.setAttribute('role','status');notice.className='field-error';(scope.querySelector('.summary')||scope).prepend(notice);}if(notice){notice.textContent=words.estimate;notice.hidden=!invalid;}
    }
  }
  document.addEventListener('input',()=>queueMicrotask(refresh));document.addEventListener('change',()=>queueMicrotask(refresh));
  document.addEventListener('click',event=>{if(event.target.closest('#addGuideDate,#guideDates,[data-day-destination],[data-pick-tour]'))queueMicrotask(refresh);});
  window.LTCValidation={validate,collect,chinaToday,refresh};refresh();
})();
