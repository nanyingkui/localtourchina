import {referenceQuote,formatReferenceQuote,latestExchangeRates,conditionText,pick} from '/catalog-config.mjs';
import {KEY,readState} from '/assets/my-selections/20261113journey/model.mjs';
const lang=document.documentElement.lang,record=JSON.parse(document.getElementById('catalog-current').textContent),form=document.querySelector('[data-catalog-form]'),w=(...x)=>pick(lang,...x),status=form.querySelector('[data-quote-status]');
const gather=()=>Object.fromEntries([...new FormData(form)].filter(([k])=>!k.startsWith('_')));
let revision=0;
form.addEventListener('input',()=>{revision++;form._catalogQuote=null;status.hidden=true;});
form.addEventListener('change',()=>{revision++;form._catalogQuote=null;status.hidden=true;});
async function calculate(){
 const ticket=++revision,c=gather(),quote=referenceQuote(record,c);form._catalogQuote=null;status.hidden=false;
 if(!quote){status.textContent=w('선택한 조건의 요금은 상담 후 확인합니다.','当前条件的报价待客服确认。','The price for these conditions is pending confirmation.')+(c.mode==='shared'?' '+w('합류 인원은 담당자가 확인해 안내해 드려요.','拼团总人数由我们核实，无需您填写。','Our team checks the final group size.'):'');return;}
 let fx=null;
 if(lang!=='ko'||quote.basis==='benchmark-from'||quote.fxCnyFloor){
  status.textContent=w('환율 확인 중','正在查询最新汇率…','Checking the latest exchange rate…');
  fx=await latestExchangeRates();
 }
 if(ticket!==revision)return;
 const display=formatReferenceQuote(quote,lang,fx);
 if(!display){status.textContent=w('환율 또는 견적 유효기간을 다시 확인해야 합니다. 카카오톡으로 현재 요금을 확인해 주세요.','汇率或报价有效期需要重新核验，请通过微信确认当前报价。','The exchange rate or quote validity needs review. Please confirm the current price via WhatsApp.');return;}
 display.asOf=new Date().toISOString();form._catalogQuote=display;status.textContent=display.displayText;
}
form.addEventListener('submit',e=>{e.preventDefault();calculate();});
let saved;try{saved=readState(localStorage).items.find(x=>x.id==='product:'+record.id);}catch{}
if(saved?.conditions){for(const [name,value] of Object.entries(saved.conditions))if(form.elements[name])form.elements[name].value=value;if(saved.quote)calculate();}
const arrival=new URLSearchParams(location.search).get('arrival');if(['early','late'].includes(arrival)&&form.elements.arrival){form.elements.arrival.value=arrival;form._catalogQuote=null;status.hidden=true;}
form.catalogConditions=gather;form.calculateQuote=calculate;
if(form.elements.arrival)form.elements.arrival.dispatchEvent(new Event('change',{bubbles:true}));
