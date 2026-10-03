/* Times are airport-local; every supported origin uses Asia/Seoul (UTC+09). */
(function(root){
'use strict';
const meetsMinimumStay=item=>item.localNights>=2&&item.tripDays>=3;
const departureEpoch=item=>Date.parse(item.outbound.departTime.replace(' ','T')+'+09:00');
const isExpired=(item,now=Date.now())=>!Number.isFinite(departureEpoch(item))||departureEpoch(item)<=now;
function getPrefill(items,id,now=Date.now()){
 const f=items.find(item=>item.id===id);if(!f||!meetsMinimumStay(f)||isExpired(f,now))return null;
 return {start:f.outbound.arriveTime.slice(0,10),arrival:f.outbound.arriveTime.slice(11,16),arrivalNo:f.outbound.segments.at(-1).flightNo,end:f.return.departTime.slice(0,10),departure:f.return.departTime.slice(11,16),departureNo:f.return.segments[0].flightNo};
}
function partition(items,{month='',airport='',days='',direct=false}={},now=Date.now()){
 const matching=items.filter(f=>meetsMinimumStay(f)&&(!month||f.outbound.departTime.slice(5,7)===month)&&(!airport||f.origin===airport)&&(!days||f.tripDays===Number(days))&&(!direct||[f.outbound,f.return].every(l=>l.segments.length===1)));
 return {active:matching.filter(f=>!isExpired(f,now)).sort((a,b)=>departureEpoch(a)-departureEpoch(b)),expired:matching.filter(f=>isExpired(f,now)).sort((a,b)=>departureEpoch(b)-departureEpoch(a))};
}
root.LTCFlights={departureEpoch,isExpired,getPrefill,partition};
if(!root.document)return;
function init(){
 const mount=document.getElementById('winter-flight-content'),data=root.LTC_WINTER_FLIGHTS;if(!mount||!data)return;
 const zh=document.documentElement.lang.startsWith('zh'),t=(ko,cn)=>zh?cn:ko;
 const airports={ICN:t('인천','仁川'),GMP:t('김포','金浦'),PUS:t('부산','釜山'),CJJ:t('청주','清州'),TAE:t('대구','大邱'),CJU:t('제주','济州'),MWX:t('무안','务安'),YNY:t('양양','襄阳')};
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
 mount.append(el('p',t('Trip.com 조회 자료 · 갱신일 ','Trip.com查询资料 · 更新日期 ')+data.updatedDate+'. '+t('전체 항공편이나 실시간 좌석 목록은 아닙니다. 예약 전 시간·가격·수하물 조건을 다시 확인하세요.','并非完整航班或实时余票列表。预订前请核对时间、价格及行李条件。')));
 mount.append(el('p',t('편도 6시간 이내 · 최대 1회 경유 · 현지 최소 2박 3일 · 한국 귀국일까지 최대 6일. 시간은 각 공항 현지 기준입니다. 한국은 중국보다 1시간 빠릅니다.','单程6小时内 · 最多中转1次 · 当地至少2晚3天 · 计至返回韩国当天最多6天。时间均为机场当地时间，韩国比中国快1小时。')));
 const purchase=el('aside',null,'flight-purchase-note');purchase.append(el('strong',t('로투차는 항공권을 대리 판매하거나 발권하지 않습니다.','我们不做机票代理，不销售机票或提供出票服务。')),el('p',t('항공권은 여행자가 Trip.com에서 직접 조회·구매해 주세요. 항공권 결제·변경·환불은 구매처를 통해 진행합니다. 아래 일정 상담은 장가계 현지 여행 서비스에 관한 것입니다.','机票请自行在Trip.com查询和购买；机票支付、改签和退款请联系购买平台。下方行程咨询仅针对张家界当地旅行服务。')),el('p',t('구매 경로: Trip.com → 항공권 → 왕복 → 한국 출발 공항 → 장가계(DYG) → 가는 날·오는 날 → 인원 선택 → 검색. 귀국편 검색 날짜는 장가계에서 출발하는 날짜입니다. 서울(SEL)로 표시되면 인천·김포 중 실제 출발 공항을 확인하세요.','购买路径：Trip.com → 机票 → 往返 → 韩国出发机场 → 张家界(DYG) → 去程日期、返程日期 → 乘客人数 → 搜索。返程搜索日期是离开张家界的日期。如显示首尔(SEL)，请核对实际出发机场是仁川还是金浦。')));const tripHome=el('a',t('Trip.com 항공권 검색 열기 ↗','打开Trip.com机票搜索 ↗'),'flight-buy');tripHome.href='https://kr.trip.com/flights/';tripHome.target='_blank';tripHome.rel='noopener noreferrer';tripHome.dataset.journey='flight_to_tripcom';purchase.append(tripHome);mount.append(purchase);
 const coverage=el('details',null,'flight-coverage');coverage.append(el('summary',t('조회 범위와 자료 기준','查询范围与数据口径')));
 coverage.append(el('p',t('대상 공항: ','查询机场：')+Object.entries(airports).map(([code,name])=>`${name} (${code})`).join(' · ')));
 coverage.append(el('p',t('출발 2026-11-01–12-30, 장가계 출발 귀국편 12-31까지. 12-31 출발·1월 귀국은 포함하지 않습니다. 항공사 운항표 전체를 수집한 자료가 아니며, 조회 결과가 없다고 미운항을 뜻하지 않습니다.','去程2026-11-01至12-30，张家界返程起飞最晚12-31。未覆盖12-31出发或1月返程。不是航空公司完整时刻表，未查到结果不等于没有航班。')));
 coverage.append(el('p',t('한국 전체 날짜별 조회에 공항별 일부 날짜 조회를 추가했습니다. 모든 공항의 모든 날짜를 전수 조회한 자료는 아닙니다.','韩国整体逐日期查询，加上各机场部分日期补查；并非每个机场所有日期的全量查询。')));
 if(data.coverage?.attempted)coverage.append(el('p',`${t('날짜·공항 조합 조회','日期与机场组合查询')}: ${data.coverage.successful} / ${data.coverage.attempted} ${t('성공','成功')}`));mount.append(coverage);
 const filters=el('div',null,'flight-filters');mount.append(filters);
 function select(id,title,options){const label=el('label',title+' '),input=el('select');input.id=id;for(const [value,name] of options){const option=el('option',name);option.value=value;input.append(option);}label.append(input);filters.append(label);return input;}
 const all=['',t('전체','全部')];
 const month=select('flight-month',t('출발 월','出发月份'),[all,['11',t('11월','11月')],['12',t('12월','12月')]]);
 const airport=select('flight-airport',t('한국 출발 공항','韩国出发机场'),[all,...Object.entries(airports).map(([k,v])=>[k,`${v} ${k}`])]);
 const days=select('flight-days',t('여행일','旅行天数'),[all,...[3,4,5,6].map(d=>[String(d),`${d}${t('일','天')}`])]);
 const directLabel=el('label',null,'flight-direct'),direct=el('input');direct.type='checkbox';direct.id='flight-direct';directLabel.append(direct,document.createTextNode(t('왕복 직항만','仅往返直飞')));filters.append(directLabel);
 const status=el('p',null,'flight-status');status.id='flight-count';status.setAttribute('role','status');status.setAttribute('aria-live','polite');mount.append(status);
 const grid=el('div',null,'flight-grid');grid.id='flight-active';mount.append(grid);
 const empty=el('p',t('해당 조건으로 출발 가능한 자료가 없습니다. 미운항을 뜻하지 않습니다.','没有符合条件的未过期资料，不代表没有航班。'));empty.id='flight-empty';mount.append(empty);
 const more=el('button',t('더 보기','显示更多'),'flight-more');more.type='button';mount.append(more);
 const archive=el('details',null,'flight-archive'),archiveTitle=el('summary'),archiveList=el('div');archive.id='flight-archive';archive.append(archiveTitle,el('p',t('한국 출발 시각이 지나 자동으로 접었습니다. 지난 항공편은 일정에 적용할 수 없습니다.','韩国出发时间已过，自动缩小并折叠。过期航班不能带入新行程。')),archiveList);mount.append(archive);
 mount.append(el('small',t('현재 기기 시각으로 출발 여부를 판정하며, 항공사의 취소·지연 여부를 조회하는 기능은 아닙니다.','过期状态按当前设备时间判断，不代表航空公司的取消或延误状态。')));
 let limit=9,lastSignature='';
 const duration=n=>`${Math.floor(n/60)}${t('시간','小时')}${n%60?` ${n%60}${t('분','分')}`:''}`;
 const legText=l=>l.segments.map(s=>s.flightNo).join(' + ')+' · '+duration(l.duration)+' · '+(l.segments.length===1?t('직항','直飞'):t('경유 ','中转 ')+l.segments.slice(0,-1).map(s=>s.arriveAirport).join('/'));
 function card(f){const a=el('article',null,'flight-card');a.append(el('h3',`${airports[f.origin]||f.origin} ${f.origin} ↔ DYG`),el('p',`${f.outbound.departTime.slice(0,10)} → ${f.return.arriveTime.slice(0,10)}`,'flight-dates'),el('p',`${f.localNights}${t('박 현지 숙박','晚当地住宿')} · ${f.tripDays}${t('일 여행','天旅行')}`));
 for(const [label,l] of [[t('가는 편','去程'),f.outbound],[t('오는 편','返程'),f.return]]){const p=el('p');p.append(el('strong',label),el('span',legText(l)),el('span',l.departTime.slice(0,16)+' → '+l.arriveTime.slice(0,16)));a.append(p);}
 if(f.bookingUrl){try{const url=new URL(f.bookingUrl);if(url.protocol==='https:'&&(url.hostname==='trip.com'||url.hostname.endsWith('.trip.com'))){const buy=el('a',t('Trip.com에서 직접 검색·구매 ↗','自行前往Trip.com查询购买 ↗'),'flight-buy');buy.href=f.bookingUrl;buy.target='_blank';buy.rel='noopener noreferrer';buy.dataset.journey='flight_to_tripcom';a.append(buy);}}catch{}}
 const link=el('a',t('현지 여행 일정 상담 →','咨询当地旅行行程 →'));link.href='private-tour.html?flight='+encodeURIComponent(f.id);link.dataset.journey='flight_to_private';a.append(link);return a;}
 function draw(force=false){const state=partition(data.itineraries,{month:month.value,airport:airport.value,days:days.value,direct:direct.checked});const signature=state.active.map(f=>f.id).join('|')+';'+state.expired.map(f=>f.id).join('|')+';'+limit;if(!force&&signature===lastSignature)return;lastSignature=signature;
 status.textContent=`${t('출발 전','未过期')} ${state.active.length} · ${t('기간 만료','已过期')} ${state.expired.length} · ${t('전체 자료','全部资料')} ${data.itineraries.length}`;
 grid.replaceChildren(...state.active.slice(0,limit).map(card));empty.hidden=state.active.length!==0;more.hidden=limit>=state.active.length;
 archive.hidden=state.expired.length===0;archiveTitle.textContent=`${t('기간 만료 · 지난 항공편','已过期 · 历史航班')} (${state.expired.length})`;
 archiveList.replaceChildren(...state.expired.map(f=>{const row=el('div',null,'flight-expired-row');row.append(el('span',t('기간 만료','已过期'),'flight-expired-badge'),el('strong',`${airports[f.origin]||f.origin} ${f.origin} ↔ DYG`),el('span',`${f.outbound.departTime.slice(0,16)} → ${f.return.arriveTime.slice(0,16)}`),el('small',f.outbound.segments.map(s=>s.flightNo).join('/')+' · '+f.return.segments.map(s=>s.flightNo).join('/')));return row;}));
 }
 filters.addEventListener('change',()=>{limit=9;draw(true);});more.addEventListener('click',()=>{limit+=9;draw(true);});draw();
 // Reclassify open tabs as soon as the departure boundary is crossed.
 setInterval(()=>draw(),60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw();});root.addEventListener('focus',()=>draw());root.addEventListener('pageshow',()=>draw());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(globalThis);
