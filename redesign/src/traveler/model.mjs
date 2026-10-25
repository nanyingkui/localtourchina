export const ZONE='Asia/Shanghai';
export const STATUS={received:'신청 접수',reviewing:'담당자 확인 중',quoted:'견적 안내',deposit_paid:'입금 확인',confirmed:'예약 확정',completed:'이용 완료',cancelled:'취소'};
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chinaDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(k=>parts.find(x=>x.type===k).value).join('-');
}
export function dateLabel(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return '날짜 미정';return new Intl.DateTimeFormat('ko-KR',{timeZone:ZONE,month:'long',day:'numeric',weekday:'short'}).format(new Date(date+'T12:00:00+08:00'));}
export function liveBookings(bookings){return bookings.filter(b=>!['cancelled','completed'].includes(b.status)).sort((a,b)=>(a.travel_date+'T'+(a.pickup?.arrival_time||'00:00')).localeCompare(b.travel_date+'T'+(b.pickup?.arrival_time||'00:00')));}
export function refreshedDate(previous,next,selected,chosen=false,today=chinaDate()){
 const active=liveBookings(next);if(!active.length)return selected||today;
 if(!chosen)return active.find(b=>b.travel_date>=today)?.travel_date||active[0].travel_date;
 if(active.some(b=>b.travel_date===selected))return selected;
 const oldIds=new Set(previous.filter(b=>b.travel_date===selected).map(b=>b.id));
 return active.find(b=>oldIds.has(b.id))?.travel_date||selected;
}
export function shownStatus(b){return b.status==='confirmed'&&!b.supplier_confirmed?'담당자 확인 중':STATUS[b.status]||'상태 확인 필요';}
export function priceLabel(b){return b.quote_amount!==null&&b.quote_amount!==undefined&&b.quote_currency?`${new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2}).format(b.quote_amount)} ${b.quote_currency}`:'일정 확인 후 안내';}
export function validatePickup(raw,now=Date.now()){
 const p={};for(const k of ['date','arrival_time','flight','region','hotel','hotel_address','notes','customer_name','contact'])p[k]=String(raw[k]||'').trim();
 p.flight=p.flight.toUpperCase().replaceAll(' ','');p.consent=raw.consent===true||raw.consent==='on';
 for(const k of ['adults','children','luggage']){if(!/^\d{1,2}$/.test(String(raw[k]??'')))throw Error('인원과 짐 수를 확인해 주세요.');p[k]=Number(raw[k]);}
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(p.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.arrival_time))throw Error('중국 도착 날짜와 시간을 입력해 주세요.');
 const arrival=Date.parse(`${p.date}T${p.arrival_time}:00+08:00`);
 if(!Number.isFinite(arrival)||chinaDate(new Date(arrival))!==p.date||arrival<=now||arrival>now+731*86400000)throw Error('앞으로 2년 이내의 도착 날짜와 시간을 선택해 주세요.');
 if(!/^[A-Z0-9]{2,3}[0-9]{1,4}[A-Z]?$/.test(p.flight))throw Error('항공편 번호를 확인해 주세요. 예: KE163');
 if(!['city','wulingyuan'].includes(p.region)||p.hotel.length<2||p.hotel.length>200||p.hotel_address.length>300)throw Error('호텔 이름과 지역을 확인해 주세요.');
 if(p.adults<1||p.children<0||p.adults+p.children>50||p.luggage<0||p.luggage>50)throw Error('인원은 성인 포함 1~50명, 큰 짐은 0~50개로 입력해 주세요.');
 if(!p.customer_name||p.customer_name.length>100||p.contact.length<2||p.contact.length>200||p.notes.length>1000)throw Error('신청자 이름, 연락처와 요청 사항을 확인해 주세요.');
 if(!p.consent)throw Error('예약 상담을 위한 정보 수집·이용에 동의해 주세요.');
 return p;
}
export function apiError(error){
 const message=String(error?.message||'');
 if(/LOGIN_REQUIRED|JWT|session|token/i.test(message))return '로그인이 만료되었어요. 다시 로그인해 주세요.';
 if(message.includes('REQUEST_CHANGED'))return '같은 신청의 전송 결과를 확인 중이에요. 예약 목록을 먼저 새로고침해 주세요.';
 if(message.includes('TOO_MANY'))return '신청이 많아 잠시 후 다시 시도해 주세요. 기존 신청은 내 여행에서 확인할 수 있어요.';
 if(message.includes('INVALID'))return '날짜·시간과 입력한 정보를 다시 확인해 주세요.';
 return '연결을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
export function readAuthReturn(raw){
 const u=new URL(String(raw).trim());
 if(u.origin!=='https://localtourchina.com'||u.pathname!=='/app/'||u.username||u.password||u.hash||[...u.searchParams.keys()].some(k=>k!=='code'))throw Error('로그인 후 열린 로투차 페이지에서 복사한 연결을 붙여 넣어 주세요.');
 const code=u.searchParams.get('code');if(!code||!/^[A-Za-z0-9_-]{6,4096}$/.test(code))throw Error('로그인 연결이 올바르지 않아요. 다시 로그인해 주세요.');
 return code;
}
export function clearTravelerStorage(storage){for(const key of ['ltc-traveler-auth-v1','ltc-traveler-auth-v1-code-verifier','ltc-traveler-auth-v1-user'])try{storage.removeItem(key);}catch{}}
