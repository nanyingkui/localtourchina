(() => {
  const rates = values => Object.fromEntries(values.map((v,i)=>[i+2,{perPerson:v*10000,total:v*10000*(i+2),rooms:Math.ceil((i+2)/2)}]));
  const commonConditions = [
    '성인 정상요금·일반기간·시내 호텔·2인 1실 기준입니다. 3명은 2실, 5명은 3실로 계산해 남는 한 분의 객실도 포함합니다.',
    '중국 공휴일·연휴와 7–8월은 별도 견적입니다. 호텔 지점·객실과 입장권 예약 가능 여부를 확인한 뒤 예약합니다.',
    '시내 오렌지·머큐어급 트윈룸 기준입니다. 무릉원 숙박, 호텔·객실 변경, 추가 숙박은 차액을 먼저 안내합니다.',
    '아동·만 60세 이상·7명 이상은 실제 나이와 인원 구성으로 계산합니다.',
    '첫날 늦은 도착, 마지막 날 관광 후 늦은 귀국편 기준입니다. 다른 항공편이면 관광일과 서비스 시간을 함께 확인합니다.'
  ];
  const excluded = [
    ['직접 준비하는 비용','왕복 항공권과 장가계까지의 장거리 교통, 필요한 비자 비용, 여행자보험.'],
    ['개인 선택에 따른 비용','도착일 식사, 커피·간식·주류·추가 음료, 쇼핑과 세탁 등 개인 경비. 시내 커피 시간에 마시는 음료는 별도입니다.'],
    ['추가 요청은 먼저 견적','호텔·객실 업그레이드, 추가 객실·숙박·식사·차량·마사지, 기본 일정 밖의 방문과 서비스 연장. 변경 금액을 확인한 뒤 진행합니다.'],
    ['이번 코스 밖의 체험','봉황고성, 번지점프·비아페라타·암벽등반 등은 포함하지 않습니다.']
  ];
  const records = {
    experience45:{...window.Product45,nights:4,duration:'4박 5일',detail:'zhangjiajie.html',shortSummary:'식사 12회, 커피 1잔·마사지 80분',note:'산과 숲길에 이틀'},
    regular34:{id:'regular34',duration:'3박 4일',nights:3,detail:'zhangjiajie-4days.html',version:'ZJJ34-20261117-v1',asOf:'2026.11.17',rates:rates([103,100,87,86,80]),basis:'일반기간 · 시내 호텔 3박 · 2인 1실 · 늦은 도착·늦은 귀국',conditions:commonConditions,shortSummary:'식사 9회, 공연 1회·마사지 80분',note:'대표 풍경을 차례로',included:[
      ['호텔과 식사','시내 호텔 3박·조식 3회, 중식 3회·석식 3회. 총 9회 식사이며 도착일 식사는 제외됩니다.'],
      ['한국어 안내와 이동','일정 내 한국어 가이드·기사·전용차량, 장가계 공항 왕복, 주차·도로비. 가이드와 기사 기본 비용을 포함합니다.'],
      ['3일차 산과 공연','삼림공원 입장·셔틀, 천자산 케이블카 상행·백룡엘리베이터 하행, 십리화랑 열차 왕복, 매력상서 공연 1회.'],
      ['2일차 천문산과 여행 중 휴식','천문산 입장·예약 노선 교통과 에스컬레이터, 유리잔도 이용 시 덧신, 발·전신 마사지 80분 1회.'],
      ['4일차 동굴과 협곡','황룡동 입장·동굴 내 유람선, 대협곡 입장·유리다리·7종 중 5종 이용권. 항공편과 체력에 맞춰 실제 이용 항목을 정합니다.']
    ],excluded:[...excluded,['이 일정에 없는 방문지','황석채·금편계 산책·부용진은 이 3박 4일에 포함하지 않습니다.']]},
    regular56:{id:'regular56',duration:'5박 6일',nights:5,detail:'zhangjiajie-6days.html',version:'ZJJ56-catalog12-late-night',asOf:'2026.11.17',rates:Object.fromEntries(Object.entries(window.Notebook.data.catalog['56'].pricing.scenario_rates.regular.late_night).filter(([n])=>Number(n)<=6).map(([n,perPerson])=>[n,{perPerson,total:perPerson*Number(n),rooms:Math.ceil(Number(n)/2)}])),basis:'일반기간 · 시내 호텔 5박 · 2인 1실 · 늦은 도착·늦은 귀국',conditions:commonConditions,shortSummary:'식사 15회, 공연 1회·마사지 80분·부용진 왕복',note:'산의 낮, 마을의 밤',included:[
      ['호텔과 식사','같은 시내 호텔 5박·조식 5회, 중식 5회·석식 5회. 총 15회 식사이며 도착일 식사는 제외됩니다. 부용진에서 숙박하는 코스는 아닙니다.'],
      ['한국어 안내와 이동','일정 내 한국어 가이드·기사·전용차량, 장가계 공항 왕복, 부용진 당일 왕복 차량, 주차·도로비.'],
      ['2·3일차 산과 공연','삼림공원 입장·셔틀, 천자산 상행·백룡 하행, 십리화랑 열차 왕복, 황석채 왕복 케이블카, 매력상서 공연 1회.'],
      ['4일차 천문산과 휴식','천문산 입장·예약 노선 교통과 에스컬레이터, 유리잔도 이용 시 덧신, 발·전신 마사지 80분 1회.'],
      ['5일차 부용진','부용진 입장권과 왕복 이동. 오후에 마을로 출발해 저녁과 야경을 본 뒤 장가계 호텔로 돌아옵니다.'],
      ['6일차 동굴과 협곡','황룡동 입장·동굴 내 유람선, 대협곡 입장·유리다리·7종 중 5종 이용권. 체력과 귀국편을 보고 이용 항목을 정합니다.']
    ],excluded:[...excluded,['이번 코스에 더하지 않은 산책','금편계 산책은 포함하지 않습니다. 황석채를 둘러본 뒤 오후에는 호텔에서 쉬도록 시간을 남겼습니다.']]}
  };
  const won=n=>window.Notebook.money(n);
  const get=id=>records[id];
  const activeParty=id=>{const s=window.Journey?.read()||{};const n=Number(id==='experience45'?s.pricing45Party:s.pricingParties?.[id]);return records[id]?.rates[n]?n:4;};
  const scopeHTML=id=>{const p=get(id);return `<div class="scope45"><h3>이 금액에 포함돼요</h3><dl>${p.included.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><h3>따로 준비하거나 선택해요</h3><dl>${p.excluded.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><p class="scope-end">예약 전 일정·호텔·총액·취소 조건을 한 문서에서 확인합니다. 추가 비용이 생기는 변경은 먼저 안내해요.</p></div>`;};
  function priceHTML(id){if(id==='regular34')return window.Dated34.panel();const p=get(id),n=activeParty(id),r=p.rates[n];return `<div class="current-price45"><p class="rate-label">이 ${p.duration}의 기본요금</p><div class="party-pills" role="group" aria-label="${p.duration} 성인 인원">${Object.keys(p.rates).map(k=>`<button type="button" data-product-party="${k}" data-product-id="${id}" aria-pressed="${Number(k)===n}">${k}명</button>`).join('')}</div><div class="rate-amount"><strong>${won(r.perPerson)}</strong><span>${n}인 출발 · 1인</span></div><p class="rate-total">${n}인 총액 <b>${won(r.total)}</b><span>트윈 기준 ${r.rooms}실 · ${p.nights}박</span></p><p class="rate-main-condition">${p.basis}<br>항공권 별도 · 중국 연휴·7–8월 제외</p><details class="rate-conditions"><summary>요금 적용 조건 확인</summary><ul>${p.conditions.map(x=>`<li>${x}</li>`).join('')}</ul><p>요금 확인일 ${p.asOf}</p></details></div>`;}
  function glanceHTML(id){if(id==='regular34')return window.Dated34.glance();const p=get(id),n=activeParty(id),r=p.rates[n];return `<div class="price-glance" data-product-glance="${id}"><p class="rate-label">${p.duration} 일반기간 기본요금</p><p><strong>${won(r.perPerson)}</strong>${n}인 출발 · 1인</p><p>${n}인 총액 ${won(r.total)} · 객실 ${r.rooms}실<br>항공권 별도 · 중국 연휴·7–8월 제외</p><a href="${p.detail}#price-reference">2–6인 요금·포함 항목 보기</a></div>`;}
  const partyFromText=window.Notebook.partyFromText;
  function quoteFor(id,fields={}){
    if(id==='experience45')return window.Product45.quoteFor(fields);
    const p=get(id),n=partyFromText(fields.party),date=String(fields.dates||''),departure=String(fields.departure||''),room=String(fields.room||''),companions=String(fields.companions||'');
    if(!p)return {status:'custom',reason:'날짜와 인원에 맞춰 여행을 제안해 드려요.'};
    if(/(?:7|8)\s*월|(?:7|8)月|20\d{2}[-/.]0?[78][-/.]|춘절|설날|추석|국경절|노동절|春节|国庆|五一|연휴|공휴일|July|August|Jul|Aug|七月|八月|劳动节|holiday|Chinese new year|Golden week/i.test(date))return {status:'custom',reason:'연휴·여름 날짜는 기본요금 적용 대상이 아니에요. 해당 날짜의 금액을 따로 안내합니다.'};
    if(fields.arrival==='early'||fields.arrival==='late'||/오전|낮|早|下午|中午|morning|afternoon|early|(?:^|\s)(?:1[0-9]|20):|오후\s*[1-8]\s*시/.test(departure))return {status:'custom',reason:'지금 본 요금은 첫날 늦은 도착·마지막 날 늦은 귀국 기준입니다. 적어주신 항공편으로 관광일과 서비스 시간을 다시 맞춰 안내해요.'};
    const roomCount=room.match(/([1-9])\s*(?:실|개|间|rooms?)/);
    if(/1\s*인\s*1\s*실|싱글|업그레이드|무릉원|스위트|5성|오성|单人|单间|一人一间|升级|武陵源|套房|五星|single|upgrade|Wulingyuan|suite|5-star/i.test(room)||(n&&roomCount&&Number(roomCount[1])!==p.rates[n].rooms))return {status:'custom',reason:'희망 객실 구성이나 호텔이 기본 조건과 달라요. 실제 객실 수와 등급을 반영해 총액을 안내합니다.'};
    if(/아동|어린이|아이|유아|초등|중학생|경로|(?:만\s*)?(?:[6-9]\d|100)\s*(?:세|살|대|岁|years?|yo|y\/o)|儿童|孩子|婴儿|小孩|老人|长者|child|kid|infant|senior|elderly|grandparents/i.test(companions))return {status:'custom',reason:'동행인의 실제 나이와 객실 조건을 반영해 총액을 다시 계산합니다.'};
    if(!n)return {status:'custom',reason:String(fields.party||'').trim()?'적어주신 인원 구성에 맞춰 별도로 계산합니다.':'인원을 적으면 2–6인 성인 기본요금과 총액을 함께 볼 수 있어요.'};
    return {status:'base',n,...p.rates[n],reason:'실제 날짜의 적용 여부와 호텔·입장권 가능 여부는 확인 전입니다. 연휴·7–8월, 아동·경로 우대와 변경 요청은 별도 견적이에요.'};
  }
  function inquiryHTML(id,fields){if(id==='regular34')return window.Dated34.inquiryHTML(fields);const p=get(id),q=quoteFor(id,fields);if(q.status!=='base')return `<div class="inquiry-rate45"><b>우리 조건으로 확인할 요금</b><p>${q.reason}</p><a href="${p.detail}#price-reference">${p.duration} 기본요금표 보기</a></div>`;return `<div class="inquiry-rate45"><p class="rate-label">${p.duration} · 일반기간 기본요금</p><div class="rate-amount"><strong>${won(q.perPerson)}</strong><span>1인</span></div><p class="rate-total">${q.n}인 총액 <b>${won(q.total)}</b></p><p>호텔 ${q.rooms}실·${p.nights}박, ${p.shortSummary}, 일정 내 가이드·차량·입장 및 교통. 항공권 별도.</p><p class="rate-context">${q.reason}</p><details class="inquiry-scope"><summary>포함·별도 비용 다시 보기</summary>${scopeHTML(id)}</details></div>`;}
  function inquiryLines(id,fields){if(id==='regular34')return window.Dated34.lines(fields);const p=get(id),q=quoteFor(id,fields);return q.status==='base'?`확인한 ${p.duration} 일반기간 기본요금: ${q.n}인 · 1인 ${won(q.perPerson)} / 총 ${won(q.total)} (객실 ${q.rooms}실·${p.nights}박, 항공권 별도).\n실제 날짜·항공편·나이·객실 조건에 이 금액이 적용되는지, 변경 금액이 있는지 확인해 주세요.`:`${p.duration} 기본요금 적용 조건과 다른 요청이 있어요. 적어드린 날짜·항공편·인원으로 총액을 안내해 주세요.`;}
  function mount(){document.querySelectorAll('[data-product-price]').forEach(el=>el.innerHTML=priceHTML(el.dataset.productPrice));document.querySelectorAll('[data-product-scope]').forEach(el=>el.innerHTML=scopeHTML(el.dataset.productScope));document.querySelectorAll('[data-product-glance]').forEach(el=>el.outerHTML=glanceHTML(el.dataset.productGlance));document.querySelectorAll('[data-product-inline]').forEach(el=>{const id=el.dataset.productInline,n=activeParty(id);if(id==='regular34'){el.textContent=window.Notebook.pick('날짜·호텔별 견적','按日期和酒店报价','Quote by dates and hotel');return;}el.textContent=n+'인 · 1인 '+won(get(id).rates[n].perPerson);});window.Dated34.bind();}
  document.addEventListener('click',event=>{const button=event.target.closest('[data-product-party]');if(!button)return;const id=button.dataset.productId,n=Number(button.dataset.productParty);if(!get(id)?.rates[n])return;const s=window.Journey.read();s.pricingParties={...s.pricingParties,[id]:n};if(id==='experience45')s.pricing45Party=n;s.fields.party=`성인 ${n}명`;window.Journey.save(s);mount();document.dispatchEvent(new Event('productprice:changed'));});
  window.ProductCatalog={records,get,won,activeParty,scopeHTML,priceHTML,glanceHTML,partyFromText,quoteFor,inquiryHTML,inquiryLines,mount};
})();
