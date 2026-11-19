(() => {
  const rates = values => Object.fromEntries(values.map((v,i)=>[i+2,{perPerson:v*10000,total:v*10000*(i+2),rooms:Math.ceil((i+2)/2)}]));
  const commonConditions = [
    "按成人正常票价、普通日期、市区酒店、2人1间计算。3人按2间、5人按3间，也包含单独一人的客房。",
    "中国法定节假日、连休和7—8月另行报价。确认酒店分店、客房及门票能否预订后，再预约。",
    "按市区桔子、美居级别双床房计算。改住武陵源、更换酒店或客房、增加住宿时，会先说明差价。",
    "儿童、满60岁旅客及7人以上，按实际年龄与人数构成计算。",
    "按首日深夜抵达、末日游览后晚班返程计算。其他航班需一并确认游览日期和服务时间。"
  ];
  const excluded = [
    ["自行准备的费用","往返机票及前往张家界的长途交通、所需签证费用、旅行保险。"],
    ["个人选择产生的费用","抵达当天餐食、咖啡、零食、酒类、额外饮品、购物及洗衣等个人消费。市区咖啡休息时的饮品另计。"],
    ["额外需求，先报价","酒店、客房升级，额外房间、住宿、餐食、车辆、按摩，以及基础行程外的景点和加时服务。确认费用变化后再安排。"],
    ["本行程之外的体验","不含凤凰古城、蹦极、飞拉达、攀岩等。"]
  ];
  const records = {
    experience45:{...window.Product45,nights:4,duration:"四晚五天",detail:'zhangjiajie.html',shortSummary:"12餐、1杯咖啡、80分钟按摩",note:"给群山与林间两天时间"},
    regular34:{id:'regular34',duration:"三晚四天",nights:3,detail:'zhangjiajie-4days.html',version:'ZJJ34-20261117-v1',asOf:'2026.11.17',rates:rates([103,100,87,86,80]),basis:"普通日期 · 市区酒店3晚 · 2人1间 · 晚到晚走",conditions:commonConditions,shortSummary:"9餐、1场演出、80分钟按摩",note:"依次看代表风景",included:[
      ["酒店与餐饮","市区酒店3晚，早餐3次、午餐3次、晚餐3次，共9餐。不含抵达当天餐食。"],
      ["导游与接送","含行程内导游、司机、专车、张家界机场往返、停车及道路通行费。导游语言和实际费用在报价时确认。"],
      ["第3天群山与演出","森林公园门票、环保车、天子山索道上行、百龙天梯下行、十里画廊往返小火车、魅力湘西1场。"],
      ["第2天天门山与旅途休息","天门山门票、预约线路交通及扶梯、使用玻璃栈道时的鞋套、1次80分钟足部及全身按摩。"],
      ["第4天溶洞与峡谷","黄龙洞门票、洞内游船，大峡谷门票、玻璃桥、7项选5项体验票。按航班时间和体力确定实际项目。"]
    ],excluded:[...excluded,["本行程不含的景点","这条三晚四天行程不含黄石寨、金鞭溪散步和芙蓉镇。"]]},
    regular56:{id:'regular56',duration:"五晚六天",nights:5,detail:'zhangjiajie-6days.html',version:'ZJJ56-catalog12-late-night',asOf:'2026.11.17',rates:Object.fromEntries(Object.entries(window.Notebook.data.catalog['56'].pricing.scenario_rates.regular.late_night).filter(([n])=>Number(n)<=6).map(([n,perPerson])=>[n,{perPerson,total:perPerson*Number(n),rooms:Math.ceil(Number(n)/2)}])),basis:"普通日期 · 市区酒店5晚 · 2人1间 · 晚到晚走",conditions:commonConditions,shortSummary:"15餐、1场演出、80分钟按摩、芙蓉镇往返",note:"山间白昼，古镇夜色",included:[
      ["酒店与餐饮","同一家市区酒店5晚，早餐5次、午餐5次、晚餐5次，共15餐。不含抵达当天餐食，不安排芙蓉镇住宿。"],
      ["导游与接送","含行程内导游、司机、专车、张家界机场往返、芙蓉镇当日往返车辆、停车及道路通行费。导游语言和实际费用在报价时确认。"],
      ["第2、3天群山与演出","森林公园门票、环保车、天子山索道上行、百龙天梯下行、十里画廊往返小火车、黄石寨往返索道、魅力湘西1场。"],
      ["第4天天门山与休息","天门山门票、预约线路交通及扶梯、使用玻璃栈道时的鞋套、1次80分钟足部及全身按摩。"],
      ["第5天芙蓉镇","芙蓉镇门票及往返接送。下午出发去古镇，晚餐、夜景后返回张家界酒店。"],
      ["第6天溶洞与峡谷","黄龙洞门票、洞内游船，大峡谷门票、玻璃桥、7项选5项体验票。按体力及返程航班确定实际项目。"]
    ],excluded:[...excluded,["本行程未增加的散步","不含金鞭溪散步。游览黄石寨后，专门留出下午回酒店休息。"]]}
  };
  const won=n=>window.Notebook.money(n);
  const get=id=>records[id];
  const activeParty=id=>{const s=window.Journey?.read()||{};const n=Number(id==='experience45'?s.pricing45Party:s.pricingParties?.[id]);return records[id]?.rates[n]?n:4;};
  const scopeHTML=id=>{const p=get(id);return `<div class="scope45"><h3>这个价格已包含</h3><dl>${p.included.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><h3>需要另行准备或选择</h3><dl>${p.excluded.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><p class="scope-end">预订前，在同一份文件中确认行程、酒店、总价及取消条件。会产生额外费用的变更，先说明再安排。</p></div>`;};
  function priceHTML(id){if(id==='regular34')return window.Dated34.panel();const p=get(id),n=activeParty(id),r=p.rates[n];return `<div class="current-price45"><p class="rate-label">这条 ${p.duration}的基础价</p><div class="party-pills" role="group" aria-label="${p.duration} 成人人数">${Object.keys(p.rates).map(k=>`<button type="button" data-product-party="${k}" data-product-id="${id}" aria-pressed="${Number(k)===n}">${k}人</button>`).join('')}</div><div class="rate-amount"><strong>${won(r.perPerson)}</strong><span>${n}人出发 · 每人</span></div><p class="rate-total">${n}人总价 <b>${won(r.total)}</b><span>按双床房计算 ${r.rooms}间 · ${p.nights}晚</span></p><p class="rate-main-condition">${p.basis}<br>机票另计 · 不含中国节假日及7—8月</p><details class="rate-conditions"><summary>查看价格适用条件</summary><ul>${p.conditions.map(x=>`<li>${x}</li>`).join('')}</ul><p>价格核对日期 ${p.asOf}</p></details></div>`;}
  function glanceHTML(id){if(id==='regular34')return window.Dated34.glance();const p=get(id),n=activeParty(id),r=p.rates[n];return `<div class="price-glance" data-product-glance="${id}"><p class="rate-label">${p.duration} 普通日期基础价</p><p><strong>${won(r.perPerson)}</strong>${n}人出发 · 每人</p><p>${n}人总价 ${won(r.total)} · 客房 ${r.rooms}间<br>机票另计 · 不含中国节假日及7—8月</p><a href="${p.detail}#price-reference">查看2—6人价格及包含项目</a></div>`;}
  const partyFromText=window.Notebook.partyFromText;
  function quoteFor(id,fields={}){
    if(id==='experience45')return window.Product45.quoteFor(fields);
    const p=get(id),n=partyFromText(fields.party),date=String(fields.dates||''),departure=String(fields.departure||''),room=String(fields.room||''),companions=String(fields.companions||'');
    if(!p)return {status:'custom',reason:"按日期与人数，推荐适合的旅行。"};
    if(/(?:7|8)\s*월|(?:7|8)月|20\d{2}[-/.]0?[78][-/.]|춘절|설날|추석|국경절|노동절|春节|国庆|五一|연휴|공휴일|July|August|Jul|Aug|七月|八月|劳动节|holiday|Chinese new year|Golden week/i.test(date))return {status:'custom',reason:"节假日和暑期日期不适用基础价，将另行说明对应日期的费用。"};
    if(fields.arrival==='early'||fields.arrival==='late'||/오전|낮|早|下午|中午|morning|afternoon|early|(?:^|\s)(?:1[0-9]|20):|오후\s*[1-8]\s*시/.test(departure))return {status:'custom',reason:"当前价格按首日深夜抵达、末日晚班返程计算。我们会根据所填航班重新调整游览日期和服务时间后说明。"};
    const roomCount=room.match(/([1-9])\s*(?:실|개|间|rooms?)/);
    if(/1\s*인\s*1\s*실|싱글|업그레이드|무릉원|스위트|5성|오성|单人|单间|一人一间|升级|武陵源|套房|五星|single|upgrade|Wulingyuan|suite|5-star/i.test(room)||(n&&roomCount&&Number(roomCount[1])!==p.rates[n].rooms))return {status:'custom',reason:"所需客房或酒店与基础条件不同，将按实际房间数量及等级计算总价。"};
    if(/아동|어린이|아이|유아|초등|중학생|경로|(?:만\s*)?(?:[6-9]\d|100)\s*(?:세|살|대|岁|years?|yo|y\/o)|儿童|孩子|婴儿|小孩|老人|长者|child|kid|infant|senior|elderly|grandparents/i.test(companions))return {status:'custom',reason:"将结合同行人的实际年龄和客房要求重新计算总价。"};
    if(!n)return {status:'custom',reason:String(fields.party||'').trim()?"按所填人员组成另行计算。":"填写人数，即可一起查看2—6位成人的基础价及总价。"};
    return {status:'base',n,...p.rates[n],reason:"实际日期是否适用，以及酒店、门票能否预订尚待确认。节假日、7—8月、儿童和长者优惠及变更需求另行报价。"};
  }
  function inquiryHTML(id,fields){if(id==='regular34')return window.Dated34.inquiryHTML(fields);const p=get(id),q=quoteFor(id,fields);if(q.status!=='base')return `<div class="inquiry-rate45"><b>按我们的条件核实费用</b><p>${q.reason}</p><a href="${p.detail}#price-reference">${p.duration} 查看基础价目表</a></div>`;return `<div class="inquiry-rate45"><p class="rate-label">${p.duration} · 普通日期基础价</p><div class="rate-amount"><strong>${won(q.perPerson)}</strong><span>每人</span></div><p class="rate-total">${q.n}人总价 <b>${won(q.total)}</b></p><p>酒店 ${q.rooms}间·${p.nights}晚， ${p.shortSummary}，行程内导游、车辆、门票及交通。机票另计。</p><p class="rate-context">${q.reason}</p><details class="inquiry-scope"><summary>再看包含与另计费用</summary>${scopeHTML(id)}</details></div>`;}
  function inquiryLines(id,fields){if(id==='regular34')return window.Dated34.lines(fields);const p=get(id),q=quoteFor(id,fields);return q.status==='base'?`已确认的 ${p.duration} 普通日期基础价： ${q.n}人 · 每人 ${won(q.perPerson)} ／共 ${won(q.total)} （客房 ${q.rooms}间·${p.nights}晚，机票另计）。\n请确认这个价格是否适用于实际日期、航班、年龄和客房要求，以及是否有费用变化。`:`${p.duration} 我们有不同于基础价格条件的要求，请按所填日期、航班和人数说明总价。`;}
  function mount(){document.querySelectorAll('[data-product-price]').forEach(el=>el.innerHTML=priceHTML(el.dataset.productPrice));document.querySelectorAll('[data-product-scope]').forEach(el=>el.innerHTML=scopeHTML(el.dataset.productScope));document.querySelectorAll('[data-product-glance]').forEach(el=>el.outerHTML=glanceHTML(el.dataset.productGlance));document.querySelectorAll('[data-product-inline]').forEach(el=>{const id=el.dataset.productInline,n=activeParty(id);if(id==='regular34'){el.textContent=window.Notebook.pick("按日期与酒店报价",'按日期和酒店报价','Quote by dates and hotel');return;}el.textContent=n+"人 · 每人 "+won(get(id).rates[n].perPerson);});window.Dated34.bind();}
  document.addEventListener('click',event=>{const button=event.target.closest('[data-product-party]');if(!button)return;const id=button.dataset.productId,n=Number(button.dataset.productParty);if(!get(id)?.rates[n])return;const s=window.Journey.read();s.pricingParties={...s.pricingParties,[id]:n};if(id==='experience45')s.pricing45Party=n;s.fields.party=`成人 ${n}人`;window.Journey.save(s);mount();document.dispatchEvent(new Event('productprice:changed'));});
  window.ProductCatalog={records,get,won,activeParty,scopeHTML,priceHTML,glanceHTML,partyFromText,quoteFor,inquiryHTML,inquiryLines,mount};
})();
