const words=(lang,ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
export const SERVICE_OPTIONS=['itinerary','hotel','vehicle','guide','tickets','meals'];
export function serviceLabel(key,lang='ko'){const values={itinerary:['일정 제안','行程建议','Itinerary planning'],hotel:['숙소','住宿','Hotels'],vehicle:['차량·픽업','车辆与接送','Transport'],guide:['현지 가이드','当地导游','Local guide'],tickets:['입장권','门票','Tickets'],meals:['식사','餐饮','Meals']};const v=values[key];return v?words(lang,...v):key;}
export function normalizeBrief(input={}){
 const brief={};for(const key of ['destination','when','party','wish','budget']){
  if(input[key]!==undefined&&typeof input[key]!=='string')throw Error('INVALID_CUSTOM_BRIEF');
  brief[key]=(input[key]||'').trim();if(brief[key].length>(key==='wish'?2000:300))throw Error('INVALID_CUSTOM_BRIEF');
 }
 if(brief.destination.length<2&&brief.wish.length<3)throw Error('EMPTY_CUSTOM_BRIEF');
 brief.services=[...new Set(input.services||[])];if(brief.services.some(x=>!SERVICE_OPTIONS.includes(x)))throw Error('INVALID_CUSTOM_BRIEF');
 for(const [key,allowed]of Object.entries({pace:['unknown','relaxed','standard','active'],hotel:['unknown','arrange','self'],relationship:['ask','include','separate']})){
  brief[key]=input[key]||allowed[0];if(!allowed.includes(brief[key]))throw Error('INVALID_CUSTOM_BRIEF');
 }
 return brief;
}
export function makeCustomItem(input,id,lang='ko',items=[]){
 const brief=normalizeBrief(input),w=(ko,zh,en)=>words(lang,ko,zh,en);
 const related=items.filter(x=>x.included&&x.kind!=='custom');
 const refs=brief.relationship==='separate'?[]:related.map(x=>({id:x.id,revision:x.revision,title:x.title}));
 const unknown=w('상담 시 확인','咨询时确认','Confirm during consultation');
 const pace={unknown:unknown,relaxed:w('여유롭게·걷기 적게','轻松一些、少走路','Relaxed, less walking'),standard:w('보통','常规节奏','Standard'),active:w('걷기·트레킹 가능','愿意多走或徒步','Active / walking')};
 const hotel={unknown:unknown,arrange:w('숙소 배정 요청','希望安排住宿','Please arrange accommodation'),self:w('이미 직접 예약한 숙소 있음 · 날짜·주소 확인 필요','已有自行预订的住宿，日期与地址须确认','Some accommodation already booked; confirm dates and addresses')};
 const relation={ask:w('기존 선택을 포함할지 먼저 상담','先确认原选择是否纳入整体方案','Confirm whether existing selections belong in the plan'),include:w('기존 선택을 전체 일정에 반영 · 중복 비용 확인','希望把原选择纳入整体行程，避免重复收费','Include existing selections; check overlapping costs'),separate:w('기존 선택과 별개의 일정 요청','与原选择分开安排','A separate plan from existing selections')};
 const details=[w('[맞춤여행 요청 · 일정과 요금 확인 필요]','【定制行程需求 · 行程与价格均待确认】','[Custom trip brief · itinerary and quote to confirm]'),
  w('목적지','目的地','Destination')+': '+(brief.destination||unknown),w('여행 시기·기간','时间与天数','Timing and duration')+': '+(brief.when||unknown),w('여행 인원','同行人数','Travellers')+': '+(brief.party||unknown),w('가장 원하는 것','最想要的安排','Main wishes')+': '+(brief.wish||unknown),
  w('필요한 도움','希望安排','Requested help')+': '+(brief.services.length?brief.services.map(x=>serviceLabel(x,lang)).join(', '):unknown),w('여행 속도','节奏','Pace')+': '+pace[brief.pace],w('숙소 상황','住宿情况','Accommodation')+': '+hotel[brief.hotel],w('예산 참고','预算参考','Budget guidance')+': '+(brief.budget||unknown),w('기존 선택과의 관계','与原选择的关系','Existing selections')+': '+relation[brief.relationship],
  ...refs.map(x=>w('관련 선택','关联选择','Related choice')+': '+x.title),w('항공·예약·실제 이용 가능 여부와 최종 총액은 담당자 확인 후 안내합니다. 예산은 확정 요금이 아닙니다.','航班、预约、实际可订情况及最终总价须客服核对。预算不等于已确认报价。','Flights, bookings, availability and final total require staff confirmation. A budget is not a confirmed quote.')].join('\n');
 return {id,kind:'custom',title:w('내 취향에 맞춘 여행','按我的想法定制行程','A trip shaped around me'),summary:[brief.destination||w('목적지 상담','目的地待商量','Destination to discuss'),brief.when||w('날짜 미정','时间未定','Dates undecided'),brief.party].filter(Boolean).join(' · '),details,fields:[],amountKRW:null,missing:[!brief.when?w('여행 시기','出行时间','Travel timing'):'',!brief.party?w('인원 구성','人数构成','Party details'):''].filter(Boolean),language:lang,sourcePath:lang==='ko'?'/':`/${lang}/index.html`,customBrief:{...brief,refs},briefVersion:'custom-trip-brief-v1'};
}
export function reviewWarnings(items,lang='ko',allItems=items){
 const selected=items.filter(x=>x.included),out=[],w=(ko,zh,en)=>words(lang,ko,zh,en);
 const customs=selected.filter(x=>x.kind==='custom'),single=selected.filter(x=>['ticket','guide','vehicle','daytour','furong','onlineguide'].includes(x.kind));
 if(customs.some(x=>x.customBrief?.relationship!=='separate')&&single.length)out.push({code:'CUSTOM_SCOPE',message:w('맞춤 견적에 기존 선택이 포함되는지 확인해 주세요. 현재 소계와 맞춤 총액을 바로 합산하지 않습니다.','须确认定制报价是否已包含原选服务，不能把当前参考小计再加进定制总价。','Confirm whether the custom quote includes existing services. Do not add this subtotal to a complete custom quote.')});
 if(selected.some(x=>['package','recommendation','private'].includes(x.kind))&&single.length)out.push({code:'PACKAGE_SCOPE',message:w('패키지와 개별 서비스의 포함 범위를 확인해 주세요. 중복 비용은 최종 견적에서 조정합니다.','套餐与单项服务的包含范围须核对，可能重复的费用由客服在最终报价中调整。','Check package inclusions against individual services; reconcile overlapping costs in the final quote.')});
 if(selected.some(x=>x.kind==='daytour')&&single.some(x=>['ticket','vehicle','guide'].includes(x.kind)))out.push({code:'DAYTOUR_SCOPE',message:w('하루 투어에 입장권·차량·가이드가 포함될 수 있습니다. 같은 날짜·구간인지 확인해 주세요.','一日游可能已含门票、车辆或导游，请核对是否用于同一天、同一路段。','Day tours may already include tickets, transport or guides. Confirm dates and routes.')});
 for(const item of customs){const refs=item.customBrief?.refs||[];if(refs.some(ref=>!allItems.some(x=>x.id===ref.id&&x.revision===ref.revision)))out.push({code:'CUSTOM_CHANGED',message:w('맞춤 요청에 연결된 선택이 이후 변경되거나 제거되었습니다. 최신 선택을 다시 확인해 주세요.','定制需求关联的原选择后来有修改或移除，请重新核对最新清单。','A choice linked to the custom brief has changed or been removed. Recheck the latest selections.')});
  if(refs.some(ref=>allItems.some(x=>x.id===ref.id)&&!selected.some(x=>x.id===ref.id)))out.push({code:'CUSTOM_NOT_INCLUDED',message:w('연결된 기존 선택 중 이번 문의에 포함하지 않은 항목이 있습니다. 함께 문의하려면 선택 목록에서 체크해 주세요.','部分关联的原选择未纳入本次咨询。如需一起询问，请返回清单勾选。','Some linked choices are not included in this inquiry. Check them in your list if you want to ask about them together.')});
 }
 return out.filter((x,index,all)=>all.findIndex(y=>y.code===x.code)===index);
}
export function transferTimingIssues({direction='outbound',date='',time='',returnDate='',returnTime='',roundtrip=false,earliest=''},lang='ko'){
 const out=[],w=(ko,zh,en)=>words(lang,ko,zh,en);
 if(date&&earliest&&date<earliest)out.push(w('최소 사전 예약일 확인','核对提前预订日期','Check booking lead time'));
 if(time&&(direction==='outbound'?time<'08:00':time>'21:00'))out.push(w('운행 시간 확인','所选时间超出运营范围','Check operating hours'));
 if(roundtrip){if(returnDate&&date&&returnDate<date||returnDate===date&&returnTime&&time&&returnTime<=time)out.push(w('돌아오는 일정 순서 확인','返程须晚于首程','Return must follow the first leg'));if(returnTime&&(direction==='outbound'?returnTime>'21:00':returnTime<'08:00'))out.push(w('돌아오는 운행 시간 확인','返程时间超出运营范围','Check return operating hours'));}
 return out;
}
