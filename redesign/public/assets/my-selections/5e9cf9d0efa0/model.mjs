import {reviewWarnings} from './custom-trip.mjs';
export function selectionIdentity(productId,kind){return 'product:'+productId+(kind==='furong'?':furong-transfer':'');}
export const KEY='ltc-selections-v1';
export class SelectionError extends Error { constructor(code){super(code);this.code=code;} }
const copy=x=>JSON.parse(JSON.stringify(x));
const blank=()=>({version:1,revision:0,items:[],undo:null});
export function readState(storage){
 let raw;try{raw=storage.getItem(KEY);}catch{throw new SelectionError('STORAGE');}
 if(!raw)return blank();
 let state;try{state=JSON.parse(raw);}catch{throw new SelectionError('CORRUPT');}
 if(state.version!==1||!Number.isInteger(state.revision)||state.revision<0||!Array.isArray(state.items)||state.items.length>40||new Set(state.items.map(x=>x.id)).size!==state.items.length||state.items.some(x=>!x.id||!x.title||!Number.isInteger(x.revision)||x.revision<1||typeof x.included!=='boolean'||!Array.isArray(x.fields)||typeof x.details!=='string'||typeof x.summary!=='string'||typeof x.kind!=='string'||typeof x.sourcePath!=='string'||!(x.amountKRW===null||Number.isSafeInteger(x.amountKRW)&&x.amountKRW>=0)))throw new SelectionError('CORRUPT');
 if(state.undo!==null&&(!state.undo?.item?.id||!Number.isInteger(state.undo.index)))throw new SelectionError('CORRUPT');
 return state;
}
export function fingerprint(item){const {id,revision,createdAt,updatedAt,included,...content}=item;return JSON.stringify(content);}
export function totals(items){
 const chosen=items.filter(x=>x.included);
 return {count:chosen.length,amount:chosen.reduce((n,x)=>n+(Number.isInteger(x.amountKRW)&&x.amountKRW>=0?x.amountKRW:0),0),priced:chosen.filter(x=>x.amountKRW!==null).length,quoted:chosen.filter(x=>x.amountKRW===null&&x.kind!=='question').length,questions:chosen.filter(x=>x.kind==='question').length,incomplete:chosen.filter(x=>x.missing?.length).length};
}
export function transition(current,action,now=new Date().toISOString()){
 const next=copy(current);let result;
 if(action.type==='save'){
  const input=copy(action.item);
  if(!input.id||typeof input.title!=='string'||!input.title.trim()||input.title.length>160||!Array.isArray(input.fields)||typeof input.details!=='string'||input.details.length>18000||!(input.amountKRW===null||Number.isSafeInteger(input.amountKRW)&&input.amountKRW>=0))throw new SelectionError('INVALID');
  const i=next.items.findIndex(x=>x.id===input.id),existing=next.items[i];
  if(existing&&fingerprint(existing)===fingerprint(input))return {state:current,item:existing,unchanged:true};
  if(action.expectedItemRevision!==undefined){if(!existing||existing.revision!==action.expectedItemRevision)throw new SelectionError('CONFLICT');}
  else if(existing)throw new SelectionError('CONFLICT');
  if(i<0){
   const duplicate=next.items.find(x=>fingerprint(x)===fingerprint(input));
   if(duplicate)return {state:current,item:duplicate,duplicate:true};
   if(next.items.length>=40)throw new SelectionError('LIMIT');
  }
  result={...input,included:existing?.included??true,revision:(existing?.revision||0)+1,createdAt:existing?.createdAt||now,updatedAt:now};
  if(i>=0)next.items[i]=result;else next.items.push(result);
 }else if(action.type==='remove'){
  const i=next.items.findIndex(x=>x.id===action.id);if(i<0)throw new SelectionError('MISSING');
  if(action.expectedItemRevision!==undefined&&next.items[i].revision!==action.expectedItemRevision)throw new SelectionError('CONFLICT');
  next.undo={item:next.items[i],index:i};next.items.splice(i,1);
 }else if(action.type==='undo'){
  if(!next.undo)throw new SelectionError('MISSING');
  if(next.items.some(x=>x.id===next.undo.item.id))throw new SelectionError('CONFLICT');
  next.items.splice(Math.min(next.undo.index,next.items.length),0,next.undo.item);result=next.undo.item;next.undo=null;
 }else if(action.type==='include'){
  const item=next.items.find(x=>x.id===action.id);if(!item)throw new SelectionError('MISSING');
  item.included=!!action.included;item.revision++;item.updatedAt=now;result=item;
 }else throw new SelectionError('INVALID');
 next.revision++;
 if(JSON.stringify(next).length>250000)throw new SelectionError('LIMIT');
 return {state:next,item:result};
}
export function commit(storage,action,expectedRevision){
 const current=readState(storage);
 if(expectedRevision!==undefined&&expectedRevision!==current.revision)throw new SelectionError('CONFLICT');
 const result=transition(current,action);
 if(result.unchanged||result.duplicate)return result;
 const serialized=JSON.stringify(result.state);
 try{storage.setItem(KEY,serialized);if(storage.getItem(KEY)!==serialized)throw Error('verification');}catch{throw new SelectionError('STORAGE');}
 return result;
}
export function requestText(items,lang='ko',allItems=items){
 const w=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
 const selected=items.filter(x=>x.included),sum=totals(items);
 return [w('[로투차 · 선택 항목 상담]','【罗途查 · 所选项目咨询】','[LocalTourChina · selection inquiry]'),
 w('실제 문의·예약은 전송되지 않았습니다.','尚未发送真实咨询或预订。','No real inquiry or booking has been sent.'),
 ...selected.flatMap((item,i)=>['',`${i+1}. ${item.title}`,item.summary,item.kind==='question'?'':item.displayAmountText||item.quote?.priceLabel||(item.amountKRW===null?w('요금: 별도 문의','价格：待报价','Fare: quote required'):`KRW ${item.amountKRW.toLocaleString('en-US')}`),item.missing?.length?w('확인 필요: ','待补充：','Needs details: ')+item.missing.join(', '):'',item.details]),
 '',w('개별 항목 참고 소계','单项参考小计','Individual-item reference subtotal')+': '+(sum.priced?`KRW ${sum.amount.toLocaleString('en-US')}`:sum.quoted?w('별도 견적','待报价','Quote required'):w('금액 항목 없음','尚无计价项目','No priced items')),
 ...reviewWarnings(items,lang,allItems).map(x=>w('확인 필요: ','需核对：','To check: ')+x.message),
 w('별도 견적 항목','待报价项目','Quote-required items')+`: ${sum.quoted}`,
 w('최종 요금·가능 여부는 담당자 확인 후 확정합니다.','最终金额和可用情况须客服确认。','Final prices and availability require staff confirmation.')].filter(x=>x!==undefined).join('\n');
}
