import {resolveReferenceQuote,formatReferenceQuote,latestExchangeRates,conditionText,pick} from '/catalog-config.mjs';
import {KEY,readState} from '/assets/my-selections/38568a60b57b/model.mjs';
import {loadCatalog} from '/assets/runtime-api.mjs';
const originalRecord=JSON.parse(document.getElementById('catalog-current').textContent);
let record=originalRecord;try{record=(await loadCatalog())[originalRecord.id]||{...originalRecord,archived:true};}catch{}
const lang=document.documentElement.lang,form=document.querySelector('[data-catalog-form]'),w=(...x)=>pick(lang,...x),status=form.querySelector('[data-quote-status]');
function syncTransportFields(){const privateField=form.querySelector('[data-private-vehicle]');if(privateField){const shared=form.elements.mode.value==='shared';privateField.hidden=shared;privateField.querySelector('select').disabled=shared;}const group=form.querySelector('[data-transfer-return]');if(group){const active=form.elements.direction?.value==='round';group.hidden=!active;group.querySelectorAll('input,select,textarea').forEach(x=>x.disabled=!active);}}
form.addEventListener('change',syncTransportFields);
const gather=()=>Object.fromEntries([...new FormData(form)].filter(([k])=>!k.startsWith('_')));
let revision=0;
let timer;
function changed(){revision++;form._catalogQuote=null;status.hidden=true;clearTimeout(timer);if(record.pricing.policy==='dated_package'&&form.elements.date.value&&form.elements.party.value&&form.elements.hotel?.value)timer=setTimeout(calculate,250);}
form.addEventListener('input',changed);
form.addEventListener('change',changed);
async function calculate(){
 if(record.archived){status.hidden=false;status.textContent=w('현재 예약할 수 없는 상품입니다.','该产品暂不开放预订。','This product is currently unavailable.');return;}
 const ticket=++revision,c=gather();form._catalogQuote=null;status.hidden=false;
 status.textContent=w('선택한 날짜의 요금 확인 중…','正在核算所选日期的报价…','Checking the selected dates…');
 let result;
 try{result=await resolveReferenceQuote(record,c);}catch{if(ticket===revision)status.textContent=w('요금을 확인하지 못했습니다. 다시 시도하거나 상담해 주세요.','暂时无法取得报价，请重试或联系客服。','Unable to retrieve a quote. Please retry or contact us.');return;}
 if(ticket!==revision)return;
 const quote=result.quote;
 if(result.status==='missing'&&record.pricing.policy==='transport_server'){status.textContent=w('날짜·인원·차량·접송 지역을 선택해 주세요. 왕복은 복귀 날짜와 시간도 필요합니다.','请选择日期、人数、车型和接送区域；往返还需回程日期与出发时间。','Select date, party, vehicle and transfer areas; returns also need a return date and departure time.');return;}
 if(result.status==='fx_pending'){status.textContent=w('환율 확인 후 요금을 안내합니다.','汇率待更新，请联系客服核价。','Exchange rates need updating. Please ask our team for a quote.');return;}
 if(result.status==='missing'){status.textContent=w('날짜·인원·호텔을 모두 선택하면 요금이 표시됩니다.','选齐日期、人数和酒店后显示价格。','Select a date, party size and hotel to see the price.');return;}
 if(result.status==='date'){status.textContent=w('오늘부터 2년 이내의 날짜를 선택해 주세요.','请选择今天起两年内的日期。','Choose a date within the next two years.');return;}
 if(result.status==='hotel_pending'){status.textContent=w('호텔요금 확인 필요: ','酒店房价待确认：','Hotel rates pending for: ')+(result.pendingDates||[]).join(' · ')+w(' · ','。',' · ')+w('3박 요금 확인 후 견적을 안내합니다. 선택 조건을 저장하거나 상담해 주세요.','三晚房价齐全后再提供总价。可先保存条件或咨询客服。','We can quote the total once all three nights are available. Save these choices or contact our team.');return;}
 if(!quote){status.textContent=w('선택한 조건의 요금은 상담 후 확인합니다.','当前条件的报价待客服确认。','The price for these conditions is pending confirmation.')+(c.mode==='shared'?' '+w('합류 인원은 담당자가 확인해 안내해 드려요.','拼团总人数由我们核实，无需您填写。','Our team checks the final group size.'):'');return;}
 let fx=quote.quoteFx||null;
 if(quote.basis!=='transport-server'&&(lang!=='ko'||quote.basis==='benchmark-from'||quote.fxCnyFloor)){
  status.textContent=w('환율 확인 중','正在查询最新汇率…','Checking the latest exchange rate…');
  const latest=await latestExchangeRates();fx=latest||fx;
 }
 if(ticket!==revision)return;
 const display=formatReferenceQuote(quote,lang,fx);
 if(!display){status.textContent=w('환율 또는 견적 유효기간을 다시 확인해야 합니다. 카카오톡으로 현재 요금을 확인해 주세요.','汇率或报价有效期需要重新核验，请通过微信确认当前报价。','The exchange rate or quote validity needs review. Please confirm the current price via WhatsApp.');return;}
 display.asOf=new Date().toISOString();form._catalogQuote=display;status.textContent=display.displayText;
 if(record.id==='34'){
  const parts=display.displayText.split(' · '),price=document.createElement('strong'),total=document.createElement('span'),hotel=document.createElement('p'),meta=document.createElement('p'),nights=document.createElement('ul'),note=document.createElement('small');
  price.textContent=parts[0];total.textContent=parts[1];hotel.className='dated-quote-hotel';hotel.textContent=quote.hotelNames[lang];
  meta.className='dated-quote-meta';meta.textContent=w(`${quote.rooms}개 객실 · 3박·조식 · 중·석식 ${quote.mealCount}회`,`${quote.rooms}间客房 · 3晚含早 · 正餐${quote.mealCount}次`,`${quote.rooms} rooms · 3 nights with breakfast · ${quote.mealCount} lunches and dinners`);
  nights.className='dated-quote-nights';quote.hotelDates.forEach((date,i)=>{const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('time');label.textContent=w(`${i+1}번째 밤`,`第${i+1}晚`,`Night ${i+1}`);value.dateTime=date;value.textContent=date;li.append(label,value);nights.append(li);});
  note.textContent=(lang!=='ko'&&fx?.date?w('환율 기준일: ','汇率日期：','Exchange rate dated: ')+fx.date+' · ':'')+w('숙박일별 요금을 반영한 참고 견적입니다. 객실 가능 여부와 최종 금액은 상담 후 확정합니다.','已按各晚房价核算，房态与最终金额经客服确认。','Includes each night’s hotel rate. Room availability and the final amount are confirmed with our team.');
  status.replaceChildren(price,total,hotel,meta,nights,note);
 }
}
form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);calculate();});
let saved;try{saved=readState(localStorage).items.find(x=>x.id==='product:'+record.id);}catch{}
if(saved?.conditions){for(const [name,value] of Object.entries(saved.conditions))if(form.elements[name])form.elements[name].value=value;if(saved.quote)calculate();}
const arrival=new URLSearchParams(location.search).get('arrival');if(['early','late'].includes(arrival)&&form.elements.arrival){form.elements.arrival.value=arrival;form._catalogQuote=null;status.hidden=true;}
syncTransportFields();
form.catalogConditions=gather;form.calculateQuote=calculate;
if(form.elements.arrival)form.elements.arrival.dispatchEvent(new Event('change',{bubbles:true}));
