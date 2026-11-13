import {transferQuote,earliestTransferDate} from './furong-transfer.mjs';
import {transferTimingIssues} from './custom-trip.mjs';
export const value=id=>document.getElementById(id)?.value||'';
const shown=element=>!!element&&!!element.getClientRects().length&&!element.closest('[hidden]');
export function activeProduct(){
 const furong=document.querySelector('.furong-product');
 if(shown(furong))return {kind:'furong',scope:furong};
 const recommendation=document.querySelector('.recommendation-flow');
 if(shown(recommendation))return {kind:'recommendation',scope:recommendation};
 const extra=document.querySelector('.shop-extra-form:not([hidden])');
 if(shown(extra))return {kind:document.body.dataset.configCategory||'package',scope:extra};
 const panel=[...document.querySelectorAll('.service-panel')].find(shown);
 if(panel&&!['service-combo','service-home','service-info','service-food','service-booking','service-reviews','service-company'].includes(panel.id))return {kind:panel.id.slice(8),scope:panel};
 const english=document.querySelector('section.inquiry');
 if(english)return {kind:document.body.dataset.service||'help',scope:document.querySelector('main')};
 return null;
}
const selectors={ticket:['inquiry','#total'],vehicle:['vehicleInquiry','#vehicleSummary .price'],guide:['guideInquiry','#guideSummary .price'],daytour:['dayInquiry','#daySummary .price'],private:['privateInquiry',null],onlineguide:[null,null]};
export function snapshot(scope){
 const fields=[...scope.querySelectorAll('input,select,textarea')].filter(x=>!x.readOnly&&!['password','file','submit','button'].includes(x.type)&&!/(?:contact|nickname|passport|^onlineName$|^name$)/i.test(x.id)&&!x.closest('[data-ms-ui]'));
 return fields.map((x,index)=>({id:x.id||'',name:x.name||'',index,type:x.type,value:x.value,checked:!!x.checked,...(x.classList.contains('guide-date')?{group:'guideDate',groupIndex:[...scope.querySelectorAll('.guide-date')].indexOf(x)}:{})}));
}
function formText(scope){return [...scope.querySelectorAll('input,select,textarea')].filter(x=>shown(x)&&!x.readOnly&&!x.closest('[data-ms-ui]')&&!['checkbox','radio','hidden','password','file'].includes(x.type)&&x.value&&!/(?:contact|nickname|passport|^onlineName$|^name$)/i.test(x.id)).map(x=>`${(x.labels?.[0]?.textContent||x.name||x.id||'').split('\n')[0].trim().slice(0,90)}: ${x.tagName==='SELECT'?x.selectedOptions[0]?.textContent:x.value}`).join('\n');}
function currentPath(kind){const url=new URL(location.href);url.searchParams.delete('msEdit');url.searchParams.delete('msOpen');if(kind==='furong'){url.searchParams.set('view','furong');url.hash='';}return url.pathname+url.search+url.hash;}
function price(text){if(!text||/문의|견적|咨询|quote|confirm|待|另/i.test(text))return null;const match=text.trim().match(/^(?:₩\s*([\d,]+)|([\d,]+)\s*(?:원|韩元|KRW))/);return match?Number((match[1]||match[2]).replaceAll(',','')):null;}
export function captureProduct(lang='ko'){
 const product=activeProduct();if(!product)return null;
 const {kind,scope}=product,w=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
 let title='',summary='',details='',amountKRW=null,missing=[],fieldsOverride=null;
 if(kind==='furong'){
  const selects=[...scope.querySelectorAll('select')],numbers=scope.querySelector('input[type=number]'),dates=[...scope.querySelectorAll('input[type=date]')],times=[...scope.querySelectorAll('input[type=time]')],addresses=[...scope.querySelectorAll('input:not([type]),input[type=text]')],notes=scope.querySelector('textarea');
  const buttons=[...scope.querySelectorAll('.furong-options button[aria-pressed=true]')],mode=buttons[0]?.textContent.trim(),round=buttons[1]?.textContent.trim(),direction=buttons[2]?.textContent.trim();
  const privateMode=/단독|独享|Private/.test(mode),roundtrip=/왕복|往返|Round/.test(round),people=Number(numbers?.value||0),region=selects[0]?.value||'city';
  title=w('부용진 ','芙蓉镇','Furong ')+(privateMode?w('단독 이동','独享接送','private transfer'):w('합승 이동','拼车接送','shared transfer'));
  const quote=(()=>{try{return transferQuote({mode:privateMode?'private':'shared',region,returnRegion:selects[1]?.value||region,journey:roundtrip?'roundtrip':'oneway',people});}catch{return null;}})();
  amountKRW=quote?.total??null;
  summary=[round,direction,selects[0]?.selectedOptions[0]?.textContent,`${people||'—'}${w('명','人',' travellers')}`,dates[0]?.value||w('날짜 미정','日期未定','Date undecided')].filter(Boolean).join(' · ');
  if(!dates[0]?.value)missing.push(w('이용 날짜','使用日期','Travel date'));if(!times[0]?.value)missing.push(w('픽업 시간','接客时间','Pickup time'));if(!addresses[0]?.value.trim())missing.push(w('상세 주소','详细地址','Exact address'));if(!notes?.value.trim())missing.push(w('짐 정보','行李信息','Luggage details'));
  if(roundtrip&&(!dates[1]?.value||!times[1]?.value||!addresses[1]?.value.trim()))missing.push(w('돌아오는 이동','返程安排','Return leg'));
  if(!quote)missing.push(w('인원·차량 별도 확인','人数、车辆须单独确认','Confirm party and vehicle'));
  missing.push(...transferTimingIssues({direction:/부용진 →|芙蓉镇→|Furong →/.test(direction)?'inbound':'outbound',date:dates[0]?.value,time:times[0]?.value,returnDate:dates[1]?.value,returnTime:times[1]?.value,roundtrip,earliest:earliestTransferDate()},lang));
  details=[scope.querySelector('.furong-service-note')?.textContent,formText(scope),w('통행료·주차료 포함 / 입장권 제외. 9명 이상 차량 배정·요금 별도 문의.','含高速费及停车费，不含门票。9人以上车辆安排及报价请咨询客服。','Tolls and parking included; admission excluded. Ask about vehicle arrangements and pricing for 9+ guests.'),w('운행·픽업 시간은 담당자 확인 후 확정합니다.','班次与接客时间须客服确认。','Departures and pickup times require staff confirmation.')].filter(Boolean).join('\n');
 }else if(kind==='recommendation'){
  let draft={};try{draft=JSON.parse(localStorage.getItem('ltc-redesign-draft-v1')||'{}');}catch{}
  const preferences=draft.recommendation||{},review=!!scope.querySelector('.recommended-review');
  const date=review?draft.date:value('date'),people=review?draft.people:value('people');
  title=scope.querySelector('header>p')?.textContent.trim()||w('패키지 상담','套餐咨询','Package inquiry');
  summary=[date||w('날짜 미정','日期未定','Date undecided'),people?people+w('명','人',' travellers'):'',w('최종 견적 확인','最终报价需确认','Confirm final quote')].filter(Boolean).join(' · ');
  amountKRW=price(scope.querySelector('.package-total b')?.textContent);
  details=[review?scope.querySelector('.recommended-terms pre')?.textContent:formText(scope),...Array.from(scope.querySelectorAll('.package-itinerary li'),x=>x.textContent.trim()),scope.querySelector('.package-party-summary')?.textContent,scope.querySelector('.recommended-form-budget')?.textContent].filter(Boolean).join('\n');
  if(!date)missing.push(w('도착 날짜','抵达日期','Arrival date'));
  if(!people)missing.push(w('인원','人数','Travellers'));
  if(review){fieldsOverride=[['date','date',date||''],['people','number',people||''],['arrivalTime','time',preferences.arrivalTime||''],['childrenCount','number',String(preferences.childrenCount??0)],['notes','textarea',draft.notes||''],...(preferences.childrenAges||[]).map((age,index)=>[index===0?'childrenAges':'childAge'+index,'number',String(age)])].map(([id,type,value])=>({id,type,value,checked:false}));fieldsOverride.push({selector:'.recommended-options .recommended-check input',type:'checkbox',checked:!!preferences.lessWalking});}
 }else{
  const [messageId,amountSelector]=selectors[kind]||[];
  details=(messageId?document.getElementById(messageId)?.value:'')||formText(scope);
  const prefix={vehicle:'vehicle',guide:'guide',daytour:'day',private:'private',onlineguide:'online'}[kind];
  const names={ticket:w('관광지 입장권','景区门票','Attraction tickets'),vehicle:w('차량·공항 픽업','车辆与机场接送','Vehicle & airport transfer'),guide:w('현지 가이드','当地导游','Local guide'),daytour:w('하루 투어','一日游','Day tour'),private:w('맞춤여행','定制旅行','Private trip'),onlineguide:w('온라인 여행 지원','在线旅行支持','Online travel support'),package:w('패키지 상담','套餐咨询','Package inquiry'),hotel:w('호텔 상담','酒店咨询','Hotel inquiry')};
  title=names[kind]||scope.querySelector('h1,h2,h3')?.textContent.trim()||w('여행 상담','旅行咨询','Travel inquiry');
  if(kind==='vehicle')title=(document.querySelector('#vehicleService input:checked')?.value==='rental'?w('일일 차량 대절','一日包车','Daily vehicle hire'):w('공항 픽업·샌딩','机场接送','Airport transfer'))+' · '+(document.getElementById('vehicleType')?.selectedOptions[0]?.textContent||'');
  if(kind==='ticket'){const selected=[...scope.querySelectorAll('#attractions input:checked')].map(x=>x.closest('label')?.querySelector('b,strong')?.textContent||x.value);if(selected.length)title=selected.join(' + ');}
  if(kind==='guide')title+=' · '+(document.getElementById('guideName')?.selectedOptions[0]?.textContent||'');
  if(kind==='package'||kind==='hotel')title=scope.querySelector('h3')?.textContent||title;
  const date=prefix?value(prefix+'Date')||value(prefix+'Start')||value('dates'):kind==='ticket'?[...scope.querySelectorAll('.config.active input[type=date]')].map(x=>x.value).filter(Boolean).sort()[0]:scope.querySelector('input[type=date]')?.value;
  const people=prefix?value(prefix+'People')||value('people'):kind==='ticket'?String(Math.max(0,...[...scope.querySelectorAll('.config.active')].map(panel=>[...panel.querySelectorAll('.age-count:not(:disabled)')].reduce((n,input)=>n+Number(input.value||0),0)))):'';
  const displayDate=kind==='guide'?[...scope.querySelectorAll('.guide-date')].map(x=>x.value).filter(Boolean).join(', '):date;
  summary=[displayDate||w('날짜 미정','日期未定','Date undecided'),people?people+w('명','人',' travellers'):'',kind==='vehicle'?document.getElementById('vehicleRoute')?.selectedOptions[0]?.textContent:''].filter(Boolean).join(' · ');
  const amountNode=amountSelector?document.querySelector(amountSelector):null;
  amountKRW=amountNode&&globalThis.window?.LTCPriceFX?.rates?.CNY>=0.0049897&&amountNode.dataset.referenceKrw!==undefined&&!/待|문의|재확인/.test(amountNode.textContent)?Number(amountNode.dataset.referenceKrw):amountSelector?price(amountNode?.textContent):null;
  if(kind==='guide'){
   const dates=[...scope.querySelectorAll('.guide-date')];
   if(!dates.length||dates.some(input=>!input.value||!input.checkValidity())||new Set(dates.map(input=>input.value)).size!==dates.length){
    amountKRW=null;missing.push(w('이용 날짜 전체 확인','核对所有服务日期','Check every service date'));
    details=details.replace(/^(예상 가이드 비용|参考导游费)([:：]).*$/gm,(_,label,colon)=>label+colon+w('날짜 확인 후 산정','日期核对后再计价','Calculated after confirming dates'));
   }
  }
  if(kind==='onlineguide'&&lang!=='en')amountKRW=50000;
  const required=kind==='ticket'?[]:[...scope.querySelectorAll('input[required],textarea[required],select[required]')].filter(shown).filter(input=>!/(?:contact|nickname|passport|^onlineName$|^name$)/i.test(input.id));
  for(const input of required)if(!input.value.trim())missing.push((input.labels?.[0]?.textContent||input.id).trim());
  if(!date&&kind!=='private')missing.push(w('이용 날짜','使用日期','Travel date'));
  if(kind==='vehicle'){for(const [id,label]of [['vehicleTime',w('픽업 시간','接客时间','Pickup time')],['vehiclePickup',w('픽업 장소','接客地点','Pickup place')],['vehicleDropoff',w('도착 장소','送达地点','Dropoff place')]])if(!value(id))missing.push(label);if(value('vehicleDirection')==='round'&&document.querySelector('#vehicleService input:checked')?.value==='airport'&&(!value('vehicleReturnDate')||!value('vehicleReturnTime')||!value('vehicleReturnPickup')||!value('vehicleReturnDropoff')))missing.push(w('복귀편 정보','返程信息','Return-leg details'));}
  if(kind==='ticket'&&!scope.querySelector('#attractions input:checked'))missing.push(w('관광지 선택','选择景区','Choose attraction'));
 }
 const invalid=[...scope.querySelectorAll('input[type=number]')].filter(x=>shown(x)&&!x.checkValidity());
 if(invalid.length){amountKRW=null;missing.push(w('인원·수량 확인','核对人数及数量','Check counts'));}
 const fields=fieldsOverride||snapshot(scope);
 if(kind==='furong'&&!(globalThis.window?.LTCPriceFX?.rates?.CNY>=.0049897))amountKRW=null;
 if(kind==='furong')for(const [index,group]of [...scope.querySelectorAll('.furong-options')].entries())fields.push({type:'choice',index,value:String([...group.querySelectorAll('button')].findIndex(x=>x.getAttribute('aria-pressed')==='true'))});
 let sourcePath=currentPath(kind);if(kind==='recommendation'){const url=new URL(sourcePath,location.origin);url.searchParams.set('step','details');sourcePath=url.pathname+url.search;}
 details=details.split('\n').filter(line=>!/^\s*(?:연락처|고객|이름|联系方式|姓名|客人|Contact|Name)\s*[:：]/i.test(line)).join('\n');
 return {kind,title,summary,details,amountKRW,missing:[...new Set(missing)],fields,sourcePath,language:lang};
}
export async function restoreProduct(item){
 const kind=item.kind;
 if(kind==='furong')for(const field of item.fields.filter(x=>x.type==='choice')){
  const group=document.querySelectorAll('.furong-product .furong-options')[field.index];group?.querySelectorAll('button')[Number(field.value)]?.click();
  await new Promise(requestAnimationFrame);
 }
 if(kind==='vehicle'){
  const saved=item.fields.find(x=>x.name==='vehicleService'&&x.checked);if(saved)document.querySelector(`#vehicleService input[value="${saved.value}"]`)?.closest('label')?.click();
 }
 // Reopen a product chosen from the original multi-booking catalogue.
 if(!activeProduct()||activeProduct().kind!==kind){
  const category=document.querySelector(`[data-shop-category="${kind}"]`);category?.click();
  const selected=item.fields.find(x=>x.id==='vehicleType')?.value;
  const vehicleService=item.fields.find(x=>x.name==='vehicleService'&&x.checked)?.value;
  const product=[...document.querySelectorAll('[data-shop-product]')].find(x=>kind==='vehicle'?x.dataset.shopProduct===selected&&(!vehicleService||x.dataset.shopService===vehicleService):kind==='ticket'?item.fields.some(f=>f.checked&&f.value===x.dataset.shopProduct):true);
  product?.querySelector('.shop-product-action')?.click();
 }
 for(const field of item.fields.filter(x=>x.type==='radio'&&x.checked)){
  const input=[...document.querySelectorAll('input[type=radio]')].find(x=>(field.id&&x.id===field.id)||x.name===field.name&&x.value===field.value);
  if(input&&!input.checked)input.closest('label')?.click();
 }
 const scope=activeProduct()?.scope;if(!scope)return false;
 if(kind==='guide'){
  const grouped=item.fields.filter(x=>x.group==='guideDate');
  const count=grouped.length||item.fields.filter(x=>x.type==='date'&&(x.id==='guideDate'||!x.id)).length;
  const current=()=>[...scope.querySelectorAll('.guide-date')];
  while(current().length<count){const before=current().length;document.getElementById('addGuideDate')?.click();if(current().length===before)break;}
  while(current().length>Math.max(1,count)){const inputs=current(),before=inputs.length;inputs.at(-1).parentElement.querySelector('button')?.click();if(current().length===before)break;}
 }
 for(let pass=0;pass<2;pass++){
  const all=[...scope.querySelectorAll('input,select,textarea')].filter(x=>!x.readOnly&&!['password','file','submit','button'].includes(x.type)&&!/(?:contact|nickname|passport|^onlineName$|^name$)/i.test(x.id)&&!x.closest('[data-ms-ui]'));
  for(const field of item.fields.filter(x=>x.type!=='choice')){
   const input=field.group==='guideDate'?scope.querySelectorAll('.guide-date')[field.groupIndex]:field.id?document.getElementById(field.id):field.selector?scope.querySelector(field.selector):all[field.index];if(!input||!scope.contains(input)||input.type==='radio')continue;
   if(field.type==='checkbox'){if(input.checked===field.checked)continue;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'checked').set.call(input,field.checked);}
   else {if(input.value===field.value)continue;const prototype=input.tagName==='SELECT'?HTMLSelectElement.prototype:input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(input,field.value);}
   input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  await new Promise(requestAnimationFrame);
 }
 return true;
}
