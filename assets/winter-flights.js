/* Times are airport-local; every supported origin uses Asia/Seoul (UTC+09). */
(function(root){
'use strict';
const meetsMinimumStay=item=>item.localNights>=2&&item.tripDays>=3;
const departureEpoch=item=>Date.parse(item.outbound.departTime.replace(' ','T')+'+09:00');
const isExpired=(item,now=Date.now())=>!Number.isFinite(departureEpoch(item))||departureEpoch(item)<=now;
function getPrefill(items,id,now=Date.now()){
 const f=items.find(item=>item.id===id);if(!f||(f.destination&&f.destination!=='DYG')||!meetsMinimumStay(f)||isExpired(f,now))return null;
 return {start:f.outbound.arriveTime.slice(0,10),arrival:f.outbound.arriveTime.slice(11,16),arrivalNo:f.outbound.segments.at(-1).flightNo,end:f.return.departTime.slice(0,10),departure:f.return.departTime.slice(11,16),departureNo:f.return.segments[0].flightNo};
}
function partition(items,{month='',airport='',days='',destination='',direct=false}={},now=Date.now()){
 const matching=items.filter(f=>meetsMinimumStay(f)&&(!destination||(f.destination||'DYG')===destination)&&(!month||f.outbound.departTime.slice(5,7)===month)&&(!airport||f.origin===airport)&&(!days||f.tripDays===Number(days))&&(!direct||[f.outbound,f.return].every(l=>l.segments.length===1)));
 return {active:matching.filter(f=>!isExpired(f,now)).sort((a,b)=>departureEpoch(a)-departureEpoch(b)),expired:matching.filter(f=>isExpired(f,now)).sort((a,b)=>departureEpoch(b)-departureEpoch(a))};
}
root.LTCFlights={departureEpoch,isExpired,getPrefill,partition};
if(!root.document)return;
function init(){
 const mount=document.getElementById('winter-flight-content'),data=root.LTC_WINTER_FLIGHTS;if(!mount||!data)return;
 const zh=document.documentElement.lang.startsWith('zh'),t=(ko,cn)=>zh?cn:ko;
 const airports={ICN:t('인천','仁川'),GMP:t('김포','金浦'),PUS:t('부산','釜山'),CJJ:t('청주','清州'),TAE:t('대구','大邱'),CJU:t('제주','济州'),MWX:t('무안','务安'),YNY:t('양양','襄阳')};
 const destinations={DYG:t('장가계 공항','张家界机场'),CSX:t('창사 + 열차','长沙 + 高铁'),CKG:t('충칭 + 열차','重庆 + 高铁')};
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
 mount.append(el('p',t('Trip.com 조회 자료 · 갱신일 ','Trip.com查询资料 · 更新日期 ')+data.updatedDate+'. '+t('전체 항공편이나 실시간 좌석 목록은 아닙니다. 예약 전 시간·가격·수하물 조건을 다시 확인하세요.','并非完整航班或实时余票列表。预订前请核对时间、价格及行李条件。')));
 mount.append(el('p',t('항공편 편도 6시간 이내 · 항공 최대 1회 경유 · 장가계 최소 2박 3일 · 한국 귀국일까지 최대 6일. 시간은 각 공항 현지 기준입니다. 한국은 중국보다 1시간 빠릅니다. 창사·충칭 경유 시 철도·지상 이동·숙박 시간은 별도입니다.','航空段单程6小时内 · 航空最多中转1次 · 张家界至少2晚3天 · 计至返回韩国当天最多6天。时间均为机场当地时间，韩国比中国快1小时。长沙、重庆方案的铁路、地面接驳和过夜时间另计。')));
 const purchase=el('aside',null,'flight-purchase-note');purchase.append(el('strong',t('로투차는 항공권을 대리 판매하거나 발권하지 않습니다.','我们不做机票代理，不销售机票或提供出票服务。')),el('p',t('항공권은 여행자가 Trip.com에서 직접 조회·구매해 주세요. 항공권 결제·변경·환불은 구매처를 통해 진행합니다. 아래 일정 상담은 장가계 현지 여행 서비스에 관한 것입니다.','机票请自行在Trip.com查询和购买；机票支付、改签和退款请联系购买平台。下方行程咨询仅针对张家界当地旅行服务。')),el('p',t('구매 경로: Trip.com → 항공권 → 왕복 → 한국 출발 공항 → 도착 공항(DYG/CSX/CKG) → 가는 날·오는 날 → 인원 선택 → 검색. 귀국편 검색 날짜는 항공편이 중국에서 출발하는 날짜입니다. 서울(SEL)로 표시되면 인천·김포 중 실제 출발 공항을 확인하세요.','购买路径：Trip.com → 机票 → 往返 → 韩国出发机场 → 抵达机场（DYG/CSX/CKG）→ 去程日期、返程日期 → 乘客人数 → 搜索。返程搜索日期是从中国机场起飞的日期，转高铁方案需先返回长沙或重庆。如显示首尔(SEL)，请核对实际出发机场是仁川还是金浦。')));const tripHome=el('a',t('Trip.com 항공권 검색 열기 ↗','打开Trip.com机票搜索 ↗'),'flight-buy');tripHome.href='https://kr.trip.com/flights/';tripHome.target='_blank';tripHome.rel='noopener noreferrer';tripHome.dataset.journey='flight_to_tripcom';purchase.append(tripHome);mount.append(purchase);
 const guide=el('details',null,'flight-transport-guide');guide.id='flight-transport-guide';guide.open=false;
 guide.append(el('summary',t('창사·충칭 → 장가계서역 열차 약 2–3시간 · 전체 교통 계획 보기','长沙、重庆→张家界西，高铁约2–3小时 · 展开整体交通计划')));
 guide.append(el('p',t('철도 구간은 왕복 모두 별도 예약합니다. 아래는 계획용 예상 시간이며 11·12월 특정 열차의 운행·좌석을 확정한 정보가 아닙니다.','铁路去返程均需另订。以下是规划用预计时间，不代表11、12月某班列车已确认运行或有票。')));
 const routes=[
  {code:'CSX',path:t('창사 황화공항(CSX) → 창사역(长沙站) → 장가계서역(张家界西) → 호텔','长沙黄花机场 CSX → 长沙站 → 张家界西站 → 酒店'),transfer:t('공항 → 창사역: 택시·차량 이동에 약 60–90분 배정','机场→长沙站：出租车/车辆接驳按约60–90分钟预留'),rail:t('창사역 ↔ 장가계서역: 직통 고속열차·동차 약 2–3시간','长沙站↔张家界西站：直达高铁/动车预计约2–3小时'),note:t('长沙站와 长沙南站는 다른 역입니다. 본 계획은 长沙站 출발이며, 표가 长沙南인 경우 공항 접속과 열차 시간을 다시 계산하세요.','长沙站和长沙南站是不同车站。本计划使用长沙站；如购买长沙南出发的车票，必须重新核对机场接驳与列车耗时。'),sources:[['长沙—张家界铁路参考','https://hunan.voc.com.cn/news/202506/29739552.html']]},
  {code:'CKG',path:t('충칭 장베이공항(CKG) → 충칭동역(重庆东) → 장가계서역(张家界西) → 호텔','重庆江北机场 CKG → 重庆东站 → 张家界西站 → 酒店'),transfer:t('공항 → 충칭동역: D620 공항버스 또는 차량, 대기·도보 포함 약 90–150분 배정','机场→重庆东站：D620机场快线或车辆，含候车、步行按约90–150分钟预留'),rail:t('충칭동역 ↔ 장가계서역: 직통 고속열차 약 2–3시간','重庆东站↔张家界西站：直达高铁预计约2–3小时'),note:t('重庆东·重庆北·重庆西는 서로 다른 역입니다. 다른 역의 출발 시간을 이 계획에 그대로 적용하지 마세요.','重庆东、重庆北、重庆西是不同车站，不能直接套用其他车站的发车时间。'),sources:[['重庆—张家界铁路参考','https://wap.cq.gov.cn/zwgk/zfxxgkml/zdlyxxgk/jt/jtzx/202506/t20250626_14750169.html'],['D620机场快线','https://cqrb.cn/contry/dy2/2025-06-30/2335393_pc.html']]}
 ];
 const routeGrid=el('div',null,'flight-route-grid');
 for(const route of routes){const box=el('article',null,'flight-route');box.append(el('h3',destinations[route.code]),el('p',route.path),el('p',route.transfer),el('p',route.rail),el('p',route.note));for(const [label,url] of route.sources){const link=el('a',label+' ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';box.append(link);}routeGrid.append(box);}guide.append(routeGrid);
 guide.append(el('p',t('로투차 계획 여유: 입국·수하물 1.5–2시간, 철도역 도착은 열차 출발 45–60분 전, 장가계서역→호텔 30–60분. 교통·대기 여건에 따라 더 걸릴 수 있습니다. 항공사·철도사의 공식 최소 환승 시간은 아닙니다.','我们的规划预留：入境及取行李1.5–2小时，提前45–60分钟到达铁路站，张家界西站→酒店30–60分钟。拥堵及排队时需增加；这些不是承运人的官方最低衔接时间。')));
 guide.append(el('p',t('공항 도착→장가계 호텔까지, 연결이 원활할 때 창사 약 6–9시간 / 충칭 약 6–10시간을 계획하세요. 비행·출발 공항 수속·숙박 시간은 포함하지 않습니다. 아래 일정은 도착 도시에서 쉬고 다음 날 이동하는 방식입니다.','接驳顺畅时，从机场落地到张家界酒店按长沙约6–9小时、重庆约6–10小时规划，不含飞行、韩国机场出发手续及过夜时间。下方方案采用先在抵达城市休息、次日转高铁的安排。')));
 guide.append(el('p',t('귀국 전날 장가계에서 출국 도시로 돌아와 공항 근처에서 쉬세요. 국제선은 출발 약 3시간 전 공항 도착을 계획하고 실제 항공사 마감 시간을 확인하세요. 새벽 출발편은 전날 밤 공항으로 이동합니다.','返程提前一天从张家界回到出境城市，在机场附近休息；国际航班按起飞前约3小时抵达机场规划，并核对航空公司实际截止时间。凌晨航班应在前一晚到机场。')));
 guide.append(el('p',t('열차표는 통상 출발일 포함 15일 전부터 판매됩니다. Trip.com → 기차표 또는 12306에서 정확한 출발역·张家界西·날짜를 확인하고 귀국 열차도 따로 예약하세요. 항공+철도는 별도 표이며 연결이 보장된 통합 항공권이 아닙니다.','火车票通常提前15天（含当天）发售。Trip.com → 火车票，或12306，选择准确出发站、张家界西及日期；返程另查另购。航空与铁路为分开购买的票，不是保障接续的联程机票。')));
 for(const [label,url] of [[t('12306 열차 조회 ↗','12306查询列车 ↗'),'https://www.12306.cn/'],[t('예매 기간 안내 ↗','预售期参考 ↗'),'https://www.beijing.gov.cn/fuwu/bmfw/sy/jrts/202609/t20260915_4864621.html']]){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';guide.append(a);}mount.append(guide);
 const coverage=el('details',null,'flight-coverage');coverage.append(el('summary',t('조회 범위와 자료 기준','查询范围与数据口径')));
 coverage.append(el('p',t('대상 공항: ','查询机场：')+Object.entries(airports).map(([code,name])=>`${name} (${code})`).join(' · ')));
 coverage.append(el('p',t('출발 2026-11-01–12-30, 중국 출발 귀국편 12-31까지. 12-31 출발·1월 귀국은 포함하지 않습니다. 항공사 운항표 전체를 수집한 자료가 아니며, 조회 결과가 없다고 미운항을 뜻하지 않습니다.','去程2026-11-01至12-30，中国返程起飞最晚12-31。未覆盖12-31出发或1月返程。不是航空公司完整时刻表，未查到结果不等于没有航班。')));
 coverage.append(el('p',t('한국 전체 날짜별 조회에 공항별 일부 날짜 조회를 추가했습니다. 모든 공항의 모든 날짜를 전수 조회한 자료는 아닙니다.','韩国整体逐日期查询，加上各机场部分日期补查；并非每个机场所有日期的全量查询。')));
 if(data.coverage?.attempted)coverage.append(el('p',`${t('날짜·공항 조합 조회','日期与机场组合查询')}: ${data.coverage.successful} / ${data.coverage.attempted} ${t('성공','成功')}`));if(data.gatewayCoverage)coverage.append(el('p',t('창사·충칭 추가 조회: ','长沙、重庆补查：')+data.gatewayCoverage.successful+' / '+data.gatewayCoverage.attempted+'; '+data.gatewayCoverage.datePairs.join(' · ')+'. '+t('8개 한국 공항의 위 날짜만 표본 조회했습니다.','八个韩国机场仅补查以上日期组合。')));mount.append(coverage);
 const filters=el('div',null,'flight-filters');mount.append(filters);
 function select(id,title,options){const label=el('label',title+' '),input=el('select');input.id=id;for(const [value,name] of options){const option=el('option',name);option.value=value;input.append(option);}label.append(input);filters.append(label);return input;}
 const all=['',t('전체','全部')];
 const destination=select('flight-destination',t('도착 경로','抵达方式'),[all,...Object.entries(destinations)]);
 const month=select('flight-month',t('출발 월','出发月份'),[all,['11',t('11월','11月')],['12',t('12월','12月')]]);
 const airport=select('flight-airport',t('한국 출발 공항','韩国出发机场'),[all,...Object.entries(airports).map(([k,v])=>[k,`${v} ${k}`])]);
 const days=select('flight-days',t('여행일','旅行天数'),[all,...[3,4,5,6].map(d=>[String(d),`${d}${t('일','天')}`])]);
 const directLabel=el('label',null,'flight-direct'),direct=el('input');direct.type='checkbox';direct.id='flight-direct';directLabel.append(direct,document.createTextNode(t('항공 구간 왕복 직항만','仅航空段往返直飞')));filters.append(directLabel);
 const status=el('p',null,'flight-status');status.id='flight-count';status.setAttribute('role','status');status.setAttribute('aria-live','polite');mount.append(status);
 const grid=el('div',null,'flight-grid');grid.id='flight-active';mount.append(grid);
 const empty=el('p',t('해당 조건으로 출발 가능한 자료가 없습니다. 미운항을 뜻하지 않습니다.','没有符合条件的未过期资料，不代表没有航班。'));empty.id='flight-empty';mount.append(empty);
 const more=el('button',t('더 보기','显示更多'),'flight-more');more.type='button';mount.append(more);
 const archive=el('details',null,'flight-archive'),archiveTitle=el('summary'),archiveList=el('div');archive.id='flight-archive';archive.append(archiveTitle,el('p',t('한국 출발 시각이 지나 자동으로 접었습니다. 지난 항공편은 일정에 적용할 수 없습니다.','韩国出发时间已过，自动缩小并折叠。过期航班不能带入新行程。')),archiveList);mount.append(archive);
 mount.append(el('small',t('현재 기기 시각으로 출발 여부를 판정하며, 항공사의 취소·지연 여부를 조회하는 기능은 아닙니다.','过期状态按当前设备时间判断，不代表航空公司的取消或延误状态。')));
 let limit=9,lastSignature='';
 const beforeFlight=(localTime,minutes)=>new Date(Date.parse(localTime.replace(' ','T')+'Z')-minutes*60000).toISOString().slice(0,16).replace('T',' ');
 const duration=n=>`${Math.floor(n/60)}${t('시간','小时')}${n%60?` ${n%60}${t('분','分')}`:''}`;
 const legText=l=>l.segments.map(s=>s.flightNo).join(' + ')+' · '+duration(l.duration)+' · '+(l.segments.length===1?t('직항','直飞'):t('경유 ','中转 ')+l.segments.slice(0,-1).map(s=>s.arriveAirport).join('/'));
 function card(f){const a=el('article',null,'flight-card');a.append(el('h3',`${airports[f.origin]||f.origin} ${f.origin} ↔ ${f.destination||'DYG'}`),el('p',`${f.outbound.departTime.slice(0,10)} → ${f.return.arriveTime.slice(0,10)}`,'flight-dates'),el('p',`${f.localNights}${f.gatewayPlan?t('박 장가계 숙박 예정','晚预计张家界住宿'):t('박 현지 숙박','晚当地住宿')} · ${f.tripDays}${t('일 여행','天旅行')}`));
 if(f.gatewayPlan)a.append(el('p',destinations[f.destination]+' → '+t('장가계 · 철도 약 2–3시간 별도','张家界 · 铁路约2–3小时另计'),'flight-gateway-badge'));
 for(const [label,l] of [[t('가는 편','去程'),f.outbound],[t('오는 편','返程'),f.return]]){const p=el('p');p.append(el('strong',label),el('span',legText(l)),el('span',l.departTime.slice(0,16)+' → '+l.arriveTime.slice(0,16)));a.append(p);}
 if(f.gatewayPlan){const plan=el('details',null,'flight-gateway-plan');plan.append(el('summary',t('날짜별 항공 + 철도 계획','展开每日航空＋铁路交通计划')));const g=f.gatewayPlan,city=destinations[f.destination];const items=[
 f.outbound.arriveTime.slice(0,10)+' · '+t('중국 도착 → 입국·수하물 → 도착 도시 숙박. 심야 도착은 호텔의 자정 이후 체크인을 확인하세요.','抵达中国→入境取行李→在抵达城市休息住宿。深夜到达请确认酒店跨午夜入住。'),
 g.zjjArrivalDate+' · '+city+' → '+t('오전·낮 직통 열차 → 张家界西 → 호텔. 열차 약 2–3시간, 차편 확정 후 도착 시간을 결정합니다.','上午/日间直达列车→张家界西→酒店。铁路约2–3小时，车次确认后再确定抵达时间。'),
 g.zjjArrivalDate+' → '+g.zjjDepartureDate+' · '+t('장가계 ','张家界预计')+f.localNights+t('박 체류 예정. 도착·출발일은 이동일이 포함되며 전일 관광일이 아닙니다.','晚住宿。到达、离开当天含交通，不是完整游览日。'),
 g.zjjDepartureDate+' · '+t('장가계서역 → 출국 도시(열차 약 2–3시간) → 공항 근처에서 휴식.','张家界西→出境城市（铁路约2–3小时）→机场附近休息。'),
 beforeFlight(f.return.departTime,180)+' · '+t('출국 공항 도착 권장 시각(항공사 규정 재확인).','建议抵达出境机场的时间（再核对航空公司规定）。'),
 f.return.departTime.slice(0,16)+' · '+f.destination+' → '+f.origin+' · '+t('항공편 출발. 새벽편이면 전날 밤 공항 도착.','返程航班起飞；凌晨航班需前一晚到机场。')];const list=el('ol');for(const text of items)list.append(el('li',text));plan.append(list,el('small',t('계획안: 열차 시간·좌석·호텔은 미확정입니다. 도착 도시의 항공 시간을 장가계 공항 픽업 시간으로 사용하지 마세요.','规划方案：列车时刻、余票及酒店尚未确认。抵达城市的航班时间不能当作张家界机场接机时间。')));a.append(plan);}
 if(f.bookingUrl){try{const url=new URL(f.bookingUrl);if(url.protocol==='https:'&&(url.hostname==='trip.com'||url.hostname.endsWith('.trip.com'))){const buy=el('a',t('Trip.com에서 직접 검색·구매 ↗','自行前往Trip.com查询购买 ↗'),'flight-buy');buy.href=f.bookingUrl;buy.target='_blank';buy.rel='noopener noreferrer';buy.dataset.journey='flight_to_tripcom';a.append(buy);}}catch{}}
 const link=el('a',t('현지 여행 일정 상담 →','咨询当地旅行行程 →'));link.href=f.gatewayPlan?'private-tour.html':'private-tour.html?flight='+encodeURIComponent(f.id);link.dataset.journey='flight_to_private';a.append(link);return a;}
 function draw(force=false){const state=partition(data.itineraries,{month:month.value,airport:airport.value,days:days.value,destination:destination.value,direct:direct.checked});const signature=state.active.map(f=>f.id).join('|')+';'+state.expired.map(f=>f.id).join('|')+';'+limit;if(!force&&signature===lastSignature)return;lastSignature=signature;
 status.textContent=`${t('출발 전','未过期')} ${state.active.length} · ${t('기간 만료','已过期')} ${state.expired.length} · ${t('전체 자료','全部资料')} ${data.itineraries.length}`;
 grid.replaceChildren(...state.active.slice(0,limit).map(card));empty.hidden=state.active.length!==0;more.hidden=limit>=state.active.length;
 archive.hidden=state.expired.length===0;archiveTitle.textContent=`${t('기간 만료 · 지난 항공편','已过期 · 历史航班')} (${state.expired.length})`;
 archiveList.replaceChildren(...state.expired.map(f=>{const row=el('div',null,'flight-expired-row');row.append(el('span',t('기간 만료','已过期'),'flight-expired-badge'),el('strong',`${airports[f.origin]||f.origin} ${f.origin} ↔ ${f.destination||'DYG'}`),el('span',`${f.outbound.departTime.slice(0,16)} → ${f.return.arriveTime.slice(0,16)}`),el('small',f.outbound.segments.map(s=>s.flightNo).join('/')+' · '+f.return.segments.map(s=>s.flightNo).join('/')));return row;}));
 }
 filters.addEventListener('change',()=>{limit=9;draw(true);});more.addEventListener('click',()=>{limit+=9;draw(true);});draw();
 // Reclassify open tabs as soon as the departure boundary is crossed.
 setInterval(()=>draw(),60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw();});root.addEventListener('focus',()=>draw());root.addEventListener('pageshow',()=>draw());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(globalThis);
