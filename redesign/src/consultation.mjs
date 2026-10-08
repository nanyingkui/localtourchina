export const STORAGE_KEY='ltc-redesign-preview-v1';
export const DRAFT_KEY='ltc-redesign-draft-v1';
export const serviceNames={private:'전체 프라이빗 여행',ticket:'관광지 입장권',vehicle:'차량·공항 픽업',guide:'현지 한국어 가이드',daytour:'하루 투어',help:'여행 방법 추천',onlineguide:'온라인 여행 지원'};
export function initialDraft(mode='private'){
 return {mode,services:[mode==='single'?'ticket':mode==='help'?'help':'private'],dateMode:'unknown',date:'',month:'',people:'2',nickname:'',contact:'',notes:'',details:false,hotel:'',flight:'',budget:'',consent:false,configuration:null};
}
export const partyLimit=d=>d.services?.includes('vehicle')&&!d.services.includes('private')?34:30;
export function validateDraft(d,now=new Date()){
 const e={};
 if(!d.services?.length||d.services.some(x=>!Object.hasOwn(serviceNames,x)))e.services='필요한 서비스를 하나 이상 선택해 주세요.';
 if(d.dateMode==='exact'){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date))e.date='예상 출발 날짜를 선택해 주세요.';
  else {const [y,m,day]=d.date.split('-').map(Number);const date=new Date(y,m-1,day);const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==day||date<today)e.date='오늘 이후의 날짜를 선택해 주세요.';}
 }
 if(!['exact','month','unknown'].includes(d.dateMode))e.dateMode='여행 시기를 선택해 주세요.';
 if(d.dateMode==='month'&&(!/^\d{4}-(0[1-9]|1[0-2])$/.test(d.month)||d.month<`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`))e.month='이번 달 이후의 예상 여행 월을 선택해 주세요.';
 if(!Number.isInteger(Number(d.people))||Number(d.people)<1||Number(d.people)>partyLimit(d))e.people=partyLimit(d)===34?'인원은 1명부터 34명까지 입력해 주세요.':'인원은 1명부터 30명까지 입력해 주세요.';
 if(!d.contact?.trim()||d.contact.trim().length<2)e.contact='카카오톡 ID 또는 연락 가능한 전화번호를 입력해 주세요.';
 if(d.contact?.trim().length>200)e.contact='연락처는 200자 이내로 입력해 주세요.';
 if(!d.consent)e.consent='상담을 위한 정보 이용에 동의해 주세요.';
 return e;
}
export function dateLabel(d){if(d.configuration?.dateDescription&&!d.configuration?.date)return d.configuration.dateDescription;if(d.configuration?.endDate&&d.configuration.endDate!==d.date&&d.dateMode==='exact')return d.date+' ~ '+d.configuration.endDate;return d.dateMode==='unknown'?'날짜 미정':d.dateMode==='month'?d.month+' 예정':d.date;}
export function inquiryText(d,reference='',lang='ko',live=false){
 const configurationText=(d.configuration?.inquiryText||'').replace(/^(고객:|客人：|Name:)\s*.*$/gm,(_,label)=>label+' '+(d.nickname.trim()||'—')).replace(/^(연락처:|联系方式：|Contact:)\s*.*$/gm,(_,label)=>label+' '+d.contact.trim());
 if(lang==='zh'||lang==='en'){const zh=lang==='zh';const names=zh?{private:'全程私人定制',ticket:'景区门票',vehicle:'专车与机场接送',guide:'当地韩语导游',daytour:'一日游',help:'旅行方案推荐',onlineguide:'在线旅行支持'}:{private:'Private trip',ticket:'Attraction tickets',vehicle:'Vehicles and airport transfers',guide:'Local guide',daytour:'Day tour',help:'Trip recommendations',onlineguide:'Online travel support'};const labels=zh?['罗途查旅行咨询','预览咨询编号','服务','出行时间','人数','姓名或昵称','联系方式','补充需求','酒店','航班','预算参考']:['LocalTourChina trip inquiry','Preview reference','Services','Travel dates','Travellers','Name or nickname','Contact','Requests','Hotel','Flight','Budget guidance'];const dates=d.dateMode==='unknown'?(zh?'日期未定':'Dates undecided'):d.dateMode==='month'?d.month+(zh?'（预计）':' (expected)'):d.date;return ['['+labels[0]+']',reference?(live?(zh?'咨询编号':'Inquiry reference'):labels[1])+': '+reference:null,labels[2]+': '+d.services.map(x=>names[x]).join(' + '),labels[3]+': '+dates,labels[4]+': '+d.people,labels[5]+': '+(d.nickname.trim()||'—'),labels[6]+': '+d.contact.trim(),...['notes','hotel','flight','budget'].map((k,i)=>d[k]?.trim()?labels[7+i]+': '+d[k].trim():null),configurationText?'\n'+configurationText:null,'',live?(zh?'本内容为旅行咨询需求。最终行程与金额经确认后生效，尚未确认预订。':'Trip inquiry request. Final itinerary and costs require confirmation. This is not a confirmed booking.'):zh?'※ 本内容来自设计预览。只有手动发送此消息后才开始实际咨询，尚未确认预订。':'Preview inquiry only. Consultation starts after you manually send this message. This is not a confirmed booking.'].filter(x=>x!==null).join('\n');}

 return ['[로투차 여행 상담 문의]',reference?`${live?'상담번호':'미리보기 상담번호'}: ${reference}`:null,`서비스: ${d.services.map(x=>serviceNames[x]).join(' + ')}`,`여행 시기: ${dateLabel(d)}`,`인원: ${d.people}명`,`이름/닉네임: ${d.nickname.trim()||'미입력'}`,`연락처: ${d.contact.trim()}`,d.notes.trim()?`요청: ${d.notes.trim()}`:null,d.hotel.trim()?`호텔: ${d.hotel.trim()}`:null,d.flight.trim()?`항공편: ${d.flight.trim()}`:null,d.budget.trim()?`예산 참고: ${d.budget.trim()}`:null,configurationText?'\n'+configurationText:null,'',live?'※ 상담 요청입니다. 일정·금액·예약 가능 여부는 담당자 확인 후 확정합니다. 예약 확정이 아닙니다.':'※ 미리보기에서 작성한 내용입니다. 실제 상담은 이 메시지를 전송한 뒤 시작됩니다. 예약 확정이 아닙니다.'].filter(x=>x!==null).join('\n');
}
export function savePreview(d,storage=localStorage,now=new Date()){
 const errors=validateDraft(d,now);if(Object.keys(errors).length){const error=new Error('validation');error.errors=errors;throw error;}
 const day=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
 const random=globalThis.crypto?.randomUUID?.().replaceAll('-','').slice(0,10).toUpperCase()||Math.random().toString(36).slice(2,12).toUpperCase();
 const record={...d,reference:`PREVIEW-${day}-${random}`,createdAt:now.toISOString(),status:'미리보기 저장',productionSubmitted:false};
 const previous=JSON.parse(storage.getItem(STORAGE_KEY)||'[]');
 if(!Array.isArray(previous))throw new Error('stored records invalid');
 storage.setItem(STORAGE_KEY,JSON.stringify([...previous,record]));
 return record;
}
