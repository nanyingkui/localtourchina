(() => {
  const product = {"id": "experience45", "version": "ZJJ45-20261116-v1", "asOf": "2026.11.16", "rates": {"2": {"perPerson": 1220000, "total": 2440000, "rooms": 1}, "3": {"perPerson": 1210000, "total": 3630000, "rooms": 2}, "4": {"perPerson": 1040000, "total": 4160000, "rooms": 2}, "5": {"perPerson": 1020000, "total": 5100000, "rooms": 3}, "6": {"perPerson": 940000, "total": 5640000, "rooms": 3}}, "basis": "普通日期 · 市区酒店4晚 · 2人1间 · 晚到晚走", "conditions": ["按成人正常票价计算。3人按2间、5人按3间房计费，也包含单独一人的客房。", "按市区桔子、美居级别双床房计算。预订前提供酒店具体分店和客房信息；更换等级时，先说明差价。", "中国法定节假日、连休及7—8月、武陵源住宿需另行报价。确认实际日期是否适用，以及客房、门票能否预订后再预约。", "按第一天在酒店休息、最后一天游览后晚班返程计算。若因航班增加住宿、餐食、服务时间或调整行程，会先说明费用变化。", "儿童、满60岁旅客、7人以上、增加客房或升级住宿，按实际条件重新计算。"], "included": [["酒店与餐饮", "市区酒店4晚、早餐4次、午餐4次、晚餐4次，共12餐。不含抵达当天的餐食。"], ["导游与专用车辆", "含行程内导游、司机、专车、张家界机场往返及停车和道路通行费。导游语言和实际费用在报价时确认。"], ["第2、3天公园与交通", "森林公园门票、环保车、十里画廊往返小火车、百龙天梯上行、天子山索道下行、黄石寨往返索道。金鞭溪为公园门票内的步行路段。"], ["第4天天门山与休息", "天门山门票、预约线路交通及扶梯、使用玻璃栈道时的鞋套、每人1杯咖啡、1次80分钟足部及全身按摩。"], ["第5天溶洞与峡谷", "黄龙洞门票及洞内游船，大峡谷门票、玻璃桥、7项选5项体验票。无需完成全部五项，实际项目按体力与运营情况安排。"]], "excluded": [["自行准备的费用", "往返机票及前往张家界的长途交通、所需签证费用、旅行保险。"], ["个人选择产生的费用", "抵达当天餐食、购物、零食、酒类、额外饮品、洗衣等个人消费。除包含的1杯咖啡外，其他加点另计。"], ["额外需求，先报价", "酒店或客房升级、增加房间、住宿、车辆、餐食、按摩，以及基础行程外的景点和服务延长。仅安排经你同意的项目。"], ["本行程不含的体验", "不含演出、芙蓉镇、凤凰古城、蹦极、飞拉达及攀岩。"]], "daily": ["机场接机、会合协助、酒店1晚。抵达当天餐食另计。", "森林公园、环保车、十里画廊往返小火车、百龙天梯上行、天子山索道下行。早、午、晚餐及酒店1晚。", "使用同一张公园门票游览黄石寨、金鞭溪。含黄石寨往返索道、早午晚餐、酒店1晚。", "天门山门票、交通、扶梯、玻璃栈道鞋套，1杯咖啡、80分钟按摩。早、午、晚餐及酒店1晚。", "黄龙洞及洞内游船，大峡谷、玻璃桥、7项选5项体验票，早午晚餐及机场送机。"]};
  const maintained=window.Notebook.data.catalog.experience45;
  if(maintained)product.rates=Object.fromEntries(Object.entries(maintained.pricing.rates).map(([n,perPerson])=>[n,{perPerson,total:perPerson*Number(n),rooms:Math.ceil(Number(n)/2)}]));
  const won = n => window.Notebook.money(n);
  const activeParty = () => { const n=Number(window.Journey?.read().pricing45Party); return product.rates[n] ? n : 4; };
  function scopeHTML(){return `<div class="scope45"><h3>这个价格已包含</h3><dl>${product.included.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><h3>需要另行准备或选择</h3><dl>${product.excluded.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><p class="scope-end">预订前，在同一份文件中确认行程、酒店、总价及取消条件。额外要求或现场变更如产生费用，会在安排前说明。</p></div>`;}
  function priceHTML(n=activeParty(),compact=false){const r=product.rates[n];return `<div class="current-price45"><p class="rate-label">这条四晚五天行程的基础价</p>${compact?'':`<div class="party-pills" role="group" aria-label="选择查看基础价的成人人数">${Object.keys(product.rates).map(k=>`<button type="button" data-price-party="${k}" aria-pressed="${Number(k)===n}">${k}人</button>`).join('')}</div>`}<div class="rate-amount"><strong>${won(r.perPerson)}</strong><span>${n}人出发 · 每人</span></div><p class="rate-total">${n}人总价 <b>${won(r.total)}</b><span>按双床房计算 ${r.rooms}间 · 4晚</span></p><p class="rate-main-condition">${product.basis}<br>机票另计 · 不含中国节假日及7—8月</p><details class="rate-conditions"><summary>查看价格适用条件</summary><ul>${product.conditions.map(x=>`<li>${x}</li>`).join('')}</ul><p>价格核算日期 ${product.asOf}</p></details></div>`;}
  function glanceHTML(){const n=activeParty(),r=product.rates[n];return `<div class="price-glance" data-price-glance><p class="rate-label">这条四晚五天行程的基础价</p><p><strong>${won(r.perPerson)}</strong>${n}人出发 · 每人</p><p>${n}人总价 ${won(r.total)} · 客房 ${r.rooms}间<br>普通日期 · 机票另计 · 不含中国节假日及7—8月</p><a href="#quote">查看2—6人价格及包含项目</a></div>`;}
  const partyFromText=window.Notebook.partyFromText;
  function quoteFor(fields={}){
    const n=partyFromText(fields.party),date=String(fields.dates||''),arrival=String(fields.arrival||''),departure=String(fields.departure||''),room=String(fields.room||''),companions=String(fields.companions||'');
    const peak=/(?:7|8)\s*월|(?:7|8)月|20\d{2}[-/.]0?[78][-/.]|춘절|설날|추석|국경절|노동절|春节|国庆|五一|연휴|공휴일|July|August|Jul|Aug|七月|八月|劳动节|holiday|Chinese new year|Golden week/i.test(date);
    const differentFlight=arrival==='early'||arrival==='late'||/오전|낮|早|下午|中午|morning|afternoon|early|(?:^|\s)(?:1[0-9]|20):|오후\s*[1-8]\s*시/.test(departure);
    const roomCount=room.match(/([1-9])\s*(?:실|개|间|rooms?)/);
    const differentRoom=/1\s*인\s*1\s*실|싱글|업그레이드|무릉원|스위트|5성|오성|单人|单间|一人一间|升级|武陵源|套房|五星|single|upgrade|Wulingyuan|suite|5-star/i.test(room)||(n&&roomCount&&Number(roomCount[1])!==product.rates[n].rooms);
    const ageCondition=/아동|어린이|아이|유아|초등|중학생|경로|(?:만\s*)?(?:[6-9]\d|100)\s*(?:세|살|대|岁|years?|yo|y\/o)|儿童|孩子|婴儿|小孩|老人|长者|child|kid|infant|senior|elderly|grandparents/i.test(companions);
    if(peak)return {status:'custom',reason:"节假日和暑期日期不适用基础价，将另行说明对应日期的费用。"};
    if(differentFlight)return {status:'custom',reason:"基础价按晚到晚走航班计算。我们会根据你填写的航班重新核对行程和费用。"};
    if(differentRoom)return {status:'custom',reason:"所需客房或酒店与基础条件不同，将按实际房间数量及等级计算总价。"};
    if(ageCondition)return {status:'custom',reason:"同行人的年龄会影响门票、客房费用，确认实际年龄后重新核算总价。"};
    if(!n)return {status:'custom',reason:String(fields.party||'').trim()?"儿童、长者优惠或7人以上等情况，将按你填写的人员组成另行计算。":"填写人数，即可一起查看2—6位成人的基础价及总价。"};
    return {status:'base',n,...product.rates[n],reason:"所填日期能否适用尚待确认。中国节假日、7—8月、儿童和长者优惠，以及行程变更需另行报价。"};
  }
  function inquiryHTML(fields){const q=quoteFor(fields);if(q.status!=='base')return `<div class="inquiry-rate45"><b>按我们的条件核实费用</b><p>${q.reason}</p><a href="zhangjiajie.html#price-reference">查看普通日期基础价目表</a></div>`;return `<div class="inquiry-rate45"><p class="rate-label">按所填人数 · 普通日期基础价</p><div class="rate-amount"><strong>${won(q.perPerson)}</strong><span>每人</span></div><p class="rate-total">${q.n}人总价 <b>${won(q.total)}</b></p><p>酒店 ${q.rooms}间·4晚、12餐、行程内导游、车辆、门票及交通、1杯咖啡、80分钟按摩。机票另计。</p><p class="rate-context">${q.reason}</p><details class="inquiry-scope"><summary>再看包含与另计费用</summary>${scopeHTML()}</details></div>`;}
  function inquiryLines(fields){const q=quoteFor(fields);return q.status==='base'?`已查看的普通日期基础价： ${q.n}人 · 每人 ${won(q.perPerson)} ／共 ${won(q.total)} （客房 ${q.rooms}间，机票另计）。\n请确认这个价格是否适用于实际日期、航班、同行年龄和客房要求，以及是否有费用变化。`:"我们的条件与基础价格适用范围有差异，请按所填日期、航班和人员组成说明总价。";}
  function mount(){
    document.querySelectorAll('[data-price45-panel]').forEach(el=>el.innerHTML=priceHTML());
    document.querySelectorAll('[data-price45-scope]').forEach(el=>el.innerHTML=scopeHTML());
    document.querySelectorAll('[data-price-glance]').forEach(el=>el.outerHTML=glanceHTML());
    document.querySelectorAll('[data-price45-inline]').forEach(el=>el.textContent=activeParty()+"人 · 每人 "+won(product.rates[activeParty()].perPerson));
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-price-party]');if(!button)return;const n=Number(button.dataset.priceParty);if(!product.rates[n])return;const state=window.Journey.read();state.pricing45Party=n;state.fields.party=`成人 ${n}人`;window.Journey.save(state);mount();document.dispatchEvent(new Event('price45:changed'));});
  window.Product45={...product,won,activeParty,scopeHTML,priceHTML,glanceHTML,partyFromText,quoteFor,inquiryHTML,inquiryLines,mount};
})();
