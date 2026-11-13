// Reference prices mirror the existing catalogue. No inferred price for larger/shared parties.
export const pick=(lang,ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
export function referenceQuote(record,conditions){
 const n=Number(conditions.party),p=record.pricing;
 if(!Number.isInteger(n)||n<1||n>99||!conditions.mode)return null;
 // Route-specific manual quotes are distinct from supplier-independent benchmark prices.
 if(p.requires_manual_review)return null;
 if(p.policy==='competitor_usd_from'){
  if(conditions.mode!=='private'||!(p.source_unit_price>0))return null;
  return {basis:'benchmark-from',sourceUnitUSD:p.source_unit_price,markupRate:p.markup_rate,rounding:p.rounding,sourceCheckedAt:p.source_checked_at,sourceUrl:p.source_url,unit:'adult-from',totalKRW:null,conditions:{...conditions}};
 }
 if(p.unit==='guide-day'){
  const start=Date.parse(conditions.date),end=Date.parse(conditions.endDate||conditions.date),days=(end-start)/86400000+1;
  const minutes=s=>/^\d{2}:\d{2}$/.test(s||'')?Number(s.slice(0,2))*60+Number(s.slice(3)):NaN;
  const hours=(minutes(conditions.endTime)-minutes(conditions.startTime))/60;
  if(conditions.guideMeals==='quote')return null;
  if(conditions.mode!=='private'||n>12||conditions.language!=='ko'||conditions.guideRole!=='tour'||!Number.isInteger(days)||days<1||days>31||!(hours>0&&hours<=12))return null;
  return {perUnitKRW:p.standard_daily_krw,perPersonKRW:null,totalKRW:p.standard_daily_krw*days,unit:'guide-day',days,hours,fxCnyFloor:p.fx_cny_floor,overtimeHoursPerDay:Math.max(0,hours-p.included_hours),directGuideOvertimeKRW:p.overtime_direct_krw,basis:'reference',currency:'KRW',conditions:{...conditions}};
 }
 if(p.unit==='group'){
  const start=Date.parse(conditions.date),end=Date.parse(conditions.endDate);
  const days=(end-start)/86400000+1;
  if(conditions.mode!=='private'||!Number.isInteger(days)||days<1||days>p.max_days)return null;
  return {perUnitKRW:p.price,perPersonKRW:null,totalKRW:p.price,unit:'group',basis:'reference',currency:'KRW',conditions:{...conditions}};
 }
 if(record.discovery?.group==='packages'&&(!conditions.arrival||!conditions.departure||!conditions.season||!conditions.room))return null;
 if(p.policy==='quote_required'||p.policy==='existing_service_form')return null;
 if(conditions.room==='extra'||record.id==='fenghuang'&&(!conditions.room||!conditions.season))return null;
 if(p.minimum_party&&n<p.minimum_party||p.maximum_reference_party&&n>p.maximum_reference_party)return null;
 if(conditions.mode==='shared'){
  if(record.discovery?.group!=='nearby')return null;
  const exampleParty=Math.max(4,n),table=p.season_rates?.[conditions.season]||p.rates;
  const per=table?.[exampleParty],privatePer=table?.[n];if(!per||!privatePer)return null;
  return {basis:'shared-example',exampleParty,ownParty:n,perPersonKRW:per,privatePerPersonKRW:privatePer,savingPerPersonKRW:Math.max(0,privatePer-per),totalKRW:null,fxCnyFloor:p.fx_cny_floor,conditions:{...conditions}};
 }
 const rates=p.rates||{};
 let per=p.price||rates[n];
 const scenario=conditions.arrival+'_'+conditions.departure;
 if(p.scenario_rates)per=p.scenario_rates[conditions.season]?.[scenario]?.[n];
 else if(p.season_rates)per=p.season_rates[conditions.season||'regular']?.[n];
 if(!per)return null;
 return {perPersonKRW:per,totalKRW:per*n,basis:p.price?'from':'reference',currency:'KRW',fxCnyFloor:p.fx_cny_floor,validUntil:p.valid_until,nights:p.nights,scenario,conditions:{...conditions}};
}
export function conditionText(c,lang){
 const w=(...x)=>pick(lang,...x);
 const labels={endDate:['마지막 이용일','服务结束日','Last service date'],servicePlace:['미팅 장소·호텔·도시','集合地点、酒店与城市','Meeting place, hotel and city'],language:['안내 언어','服务语言','Service language'],startTime:['시작 시간','开始时间','Start time'],endTime:['종료 시간','结束时间','End time'],guideRole:['서비스 종류','服务类型','Service type'],guidePreference:['희망 가이드','意向导游','Preferred guide'],transport:['교통 준비','交通安排','Transport'],tickets:['입장권','门票安排','Tickets'],guideMeals:['가이드 식사','导游用餐','Guide meals'],serviceScope:['구체적인 요청','具体需求','Specific help']};
 const values={ko:['한국어','韩语','Korean'],zh:['중국어','中文','Chinese'],en:['영어 (가능 여부 확인)','英语（待确认）','English (subject to availability)'],tour:['여행 안내','旅行向导','Tour guiding'],daily:['일상 통역','生活翻译','Everyday interpreting'],business:['비즈니스 통역','商务翻译','Business interpreting'],own:['직접 준비','自行安排','Already arranged'],taxi:['택시·디디','出租车 / 网约车','Taxi / ride hail'],request:['견적 필요','需要报价','Quote needed'],provided:['일행과 함께 제공','随团提供','Provided with our group'],quote:['식대 포함 견적 요청','需含餐补报价','Include meal allowance']};
 const extra=Object.entries(labels).filter(([key])=>c[key]).map(([key,label])=>w(...label)+': '+(values[c[key]]?w(...values[c[key]]):c[key]));
 if(c.departure)extra.push(w('출발 항공편','返程航班时段','Departure flight')+': '+(c.departure==='night'?w('늦은 저녁','深夜','Late night'):w('오후','下午','Afternoon')));
 if(c.season)extra.push(w('여행 시기','价格适用日期','Travel period')+': '+(c.season==='holiday'?w('공휴일·호텔 할증','节假日及酒店加价日','Holiday / hotel surcharge'):w('일반 날짜','平日','Regular dates')));
 return [c.date&&`${w('날짜','日期','Date')}: ${c.date}`,c.party&&`${w('우리 일행','同行人数','Our party')}: ${c.party} ${w('명','人','guests')}`,c.mode&&w('출발 방식','出发方式','Departure')+': '+(c.mode==='shared'?w('합류 희망','申请拼团','Join a group'):w('우리 일행 단독','独立出发','Private departure')),c.arrival&&w('도착','抵达','Arrival')+': '+(c.arrival==='late'?w('늦은 도착','晚到','Late arrival'):w('이른 도착','早到','Early arrival')),c.room&&w('객실','房间','Rooms')+': '+(c.room==='extra'?w('추가 객실 요청','额外房间','Extra rooms requested'):w('2인 1실','双人一间','Twin sharing')),...extra,c.notes&&w('추가 요청','补充要求','Requests')+': '+c.notes].filter(Boolean).join('\n');
}
export function canonicalItem(record,lang,conditions={},quote=null){
 const w=(...x)=>pick(lang,...x),text=conditionText(conditions,lang);
 const missing=[];
 if(!conditions.date)missing.push(w('날짜','日期','Date'));
 if(!conditions.party)missing.push(w('인원','人数','Party size'));
 if(!conditions.mode)missing.push(w('출발 방식','出发方式','Departure type'));
 if(record.discovery?.group==='packages'&&!conditions.arrival)missing.push(w('도착 시간','抵达时间','Arrival timing'));
 return {id:'product:'+record.id,productId:record.id,title:record.locales[lang].title,sourcePath:record.paths[lang],kind:'catalog',language:lang,conditions,quote,fields:Object.entries(conditions).map(([name,value])=>({id:'catalog-'+name,name,value:String(value),type:'text',checked:false})),summary:text.replaceAll('\n',' · ')||w('조건을 선택한 뒤 견적 확인','选择条件后确认报价','Choose conditions for a quote'),details:[text,quote?.displayText, w('최종 요금·가능 여부·포함 사항은 상담 후 확정합니다.','最终价格、可用情况及包含项须客服确认。','Final price, availability and inclusions require confirmation.')].filter(Boolean).join('\n'),amountKRW:quote?.totalKRW??null,missing};
}
export function mergeSelection(record,lang,incoming,existing,configured){
 if(existing&&!configured)return {...existing}; // Adding a saved catalogue card never erases its configured values.
 if(existing&&!incoming.fields.length)return {...existing};
 return incoming;
}

// One presentation path for product forms, saved selections and inquiry text.
// Benchmark starting prices never imply a party-size quote or a bookable total.
export function formatReferenceQuote(input,lang,fx){
 if(!input)return null;
 const q={...input},w=(...v)=>pick(lang,...v),currency=lang==='zh'?'CNY':lang==='en'?'USD':'KRW';
 if(q.validUntil&&new Date().toISOString().slice(0,10)>q.validUntil)return null;
 if(q.fxCnyFloor&&(!(fx?.rates?.CNY>=q.fxCnyFloor-1e-10)||!fx.date))return null;
 const fmt=(n,digits=currency==='KRW'?0:2)=>new Intl.NumberFormat(lang==='zh'?'zh-CN':lang==='en'?'en-US':'ko-KR',{style:'currency',currency,maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n);
 if(q.basis==='shared-example'){
  if(lang!=='ko'&&(!(fx?.rates?.[currency]>0)||!fx.date))return null;
  const rate=lang==='ko'?1:fx.rates[currency];q.displayLanguage=lang;
  q.priceLabel=w(`${q.exampleParty}명 합류 시 1인 ${fmt(q.perPersonKRW*rate)}`,`${q.exampleParty}人成团时每人 ${fmt(q.perPersonKRW*rate)}`,`${fmt(q.perPersonKRW*rate)} each if ${q.exampleParty} guests join`);
  q.displayText=q.priceLabel+' · '+(q.savingPerPersonKRW>0?w(`우리 ${q.ownParty}명 단독 출발보다 1인 ${fmt(q.savingPerPersonKRW*rate)} 절약 가능.`, `比我方${q.ownParty}人独立出发每人可省 ${fmt(q.savingPerPersonKRW*rate)}。`, `Potential saving of ${fmt(q.savingPerPersonKRW*rate)} each versus a private departure for your ${q.ownParty}.`):w('추가 합류 시 요금을 다시 확인합니다.','如有更多客人合流，再确认可减金额。','Any further joining guests require a revised saving estimate.'))+' '+w('예시이며 할인 확정이 아닙니다. 같은 날짜·일정의 합류 인원과 자원을 확인한 뒤 최종 금액을 안내합니다. 합류가 성사되지 않으면 단독 요금 또는 날짜 변경을 협의합니다.', '这是成团参考，不代表优惠已确认。客服落实同日同线人数及资源后确认总价；未成团时再协商独立出发价格或改期。', 'An example, not a confirmed discount. Staff confirm the same-date group and resources before quoting the total. If the group does not form, agree a private price or another date.');
  if(lang!=='ko')q.displayText+=' '+w('환율 기준일: ','汇率日期：','Exchange rate dated: ')+fx.date;
  return q;
 }
 if(q.basis==='benchmark-from'){
  const rates=fx?.rates;
  if(!(rates?.USD>0)||!(rates?.CNY>0)||!fx.date)return null;
  const rawUSD=q.sourceUnitUSD*(1+q.markupRate);
  const rate=currency==='USD'?1:currency==='KRW'?1/rates.USD:rates.CNY/rates.USD;
  const step=q.rounding?.[currency]||1,amount=Math.ceil((rawUSD*rate-1e-9)/step)*step;
  q.displayCurrency=currency;q.displayAmount=amount;q.displayLanguage=lang;
  q.perPersonKRW=Math.ceil((rawUSD/rates.USD-1e-9)/1000)*1000;q.totalKRW=null;
  q.fx={date:fx.date,rates:{...rates}};
  q.priceLabel=w('성인 1인 '+fmt(amount,0)+'부터','成人每人 '+fmt(amount,0)+' 起','From '+fmt(amount,0)+' per adult');
  q.displayText=q.priceLabel+' · '+w('전체 요금은 날짜·인원·픽업 지역 확인 후 안내합니다.','总价按日期、人数和接送区域确认。','The party total depends on dates, group size and pickup zone.')+' '+w('환율 기준일: ','汇率日期：','Exchange rate dated: ')+fx.date;
  return q;
 }
 if(lang!=='ko'&&(!(fx?.rates?.[currency]>0)||!fx.date))return null;
 const rate=lang==='ko'?1:fx.rates[currency],unit=q.perUnitKRW??q.perPersonKRW;
 const label=q.unit==='guide-day'?w('가이드 1명·1일 6시간','每位导游每天6小时','Per guide, per 6-hour day'):q.unit==='group'?w('한 팀·한 여행','每团一次旅行','Per group, per trip'):w('성인 1인','每位成人','Per adult');
 q.displayLanguage=lang;q.priceLabel=fmt(q.totalKRW*rate);
 q.displayText=label+' '+fmt(unit*rate)+(q.basis==='from'?w('부터','起',' from'):'')+' · '+w('참고 합계','参考合计','Reference total')+' '+fmt(q.totalKRW*rate);
 if(lang!=='ko'){q.fx={date:fx.date,rate,currency};q.displayText+=' · '+w('환율 기준일: ','汇率日期：','Exchange rate dated: ')+fx.date;}
 if(q.nights){
  const [arrival,departure]=q.scenario.split('_');
  const meals=2*(q.nights-1)+(arrival==='early'?2:0)+(departure==='night'?2:1);
  q.displayText+=' · '+w(`시내 기본 호텔 ${q.nights}박·조식 / 중·석식 ${meals}회. 실제 항공편·호텔·추가 요청에 따라 재견적합니다.`, `市区基础酒店${q.nights}晚含早／正餐${meals}次。实际航班、酒店或额外要求变化须重算。`, `${q.nights} city-hotel nights with breakfast / ${meals} lunches and dinners. Different flights, hotels or extra requests require a revised quote.`);
 }
 if(q.unit==='guide-day')q.displayText+=' · '+w(`${q.days}일 기본 안내비. 하루 6시간 초과분은 시간당 ₩20,000을 가이드에게 별도 지급합니다. 1시간 미만 정산은 사전 확인합니다.`,`${q.days}天基础导游费。每天超过6小时的部分，按₩20,000／小时另付导游；不足1小时如何结算须事前确认。`,`${q.days} day(s) of base guiding. Beyond 6 hours per day, pay the guide ₩20,000 per hour separately; agree partial-hour billing in advance.`);
 q.displayText+=' · '+w('최종 확정 전 참고 금액','参考报价，尚未最终确认','Estimate, subject to confirmation');
 return q;
}

let liveFxRequest;
export function latestExchangeRates(){
 if(!liveFxRequest)liveFxRequest=fetch('https://api.frankfurter.dev/v1/latest?base=KRW&symbols=CNY,USD',{signal:AbortSignal.timeout(8000)}).then(r=>r.ok?r.json():null).catch(()=>null);
 return liveFxRequest;
}
