import {renderStandards,renderTeam,renderEvidence,renderBooking} from './evidence.mjs';

export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHome(lang,{assetBase,directory}){
 const t=(ko,zh,en)=>({ko,zh,en})[lang];
 const u=file=>(lang==='ko'?'/':'/'+lang+'/')+file;
 const photo=(name,alt,extra='')=>`<img src="${assetBase}photos/${name}" alt="${esc(alt)}" ${extra}>`;
 const featured=[
  {
   id:'regular34',image:'cliff-privacy.png',file:'zhangjiajie-4days.html',
   title:t('천문산·원가계 핵심 코스','天门山与袁家界','Tianmen and Yuanjiajie'),
   duration:t('3박 4일','3晚4天','3 nights / 4 days'),
   note:t('늦은 도착·늦은 귀국 기준 · 도보와 계단 있음','按晚到晚返安排，含步行和台阶','For late flights in and out. Includes walking and steps.'),
  },
  {
   id:'experience45',image:'golden-whip-owner-real.webp',file:'zhangjiajie.html',
   title:t('황석채·금편계 숲길','黄石寨与金鞭溪','Huangshizhai and Golden Whip Stream'),
   duration:t('4박 5일','4晚5天','4 nights / 5 days'),
   note:t('삼림공원 이틀 · 같은 시내 호텔 4박 · 부용진·공연 미포함','森林公园玩两天，同一家市区酒店住4晚，不含芙蓉镇及演出','Two days in the Forest Park, four nights in one city hotel. No Furong or show.'),
  },
  {
   id:'regular56',image:'furong-riverside-evening.jpg',file:'zhangjiajie-6days.html',
   title:t('장가계·부용진 야경','张家界与芙蓉镇夜景','Zhangjiajie and Furong after dark'),
   duration:t('5박 6일','5晚6天','5 nights / 6 days'),
   note:t('황석채 뒤 호텔 휴식 · 부용진 야경 후 장가계 복귀','黄石寨游览后回酒店休息，游览芙蓉镇夜景后返回张家界','Hotel break after Huangshizhai. Return to Zhangjiajie after Furong’s night views.'),
  },
 ];
 const viewPhotos=t('사진 보기','看照片','View photos');
 const cards=featured.map(r=>`<article class="trip-card ed-feature-card">
  <button class="trip-cover ed-feature-cover" type="button" data-route-story="${r.id}" aria-haspopup="dialog" aria-label="${esc(`${viewPhotos} · ${r.title}`)}">
   ${photo(r.image,r.title,'loading="lazy" width="900" height="680"')}
   <span class="ed-photo-tag">${viewPhotos}</span>
  </button>
  <div class="ed-feature-body">
   <p class="ed-duration">${r.duration}</p>
   <h3>${r.title}</h3>
   <p>${r.note}</p>
   <div data-product-glance="${r.id}"></div>
   <a class="ed-detail" data-ed-product="${r.id}" href="${u(r.file)}">${t('일정·포함 내역·요금 보기','查看行程、包含项目与价格','View itinerary, inclusions and price')}</a>
  </div>
 </article>`).join('');
 const services=[
  ['products.html#nearby',t('하루투어','一日游','Day tours'),t('천문산·삼림공원·부용진 등','天门山、森林公园、芙蓉镇等','Tianmen, the Forest Park, Furong and more')],
  [t('korean-guide.html','local-guide.html','local-guide.html'),t('현지 가이드','当地导游','Local guides'),t('우리 일정에 맞춰 동행','按日期确认语言与档期','Confirm language and availability')],
  ['airport-transfer.html',t('공항 픽업·샌딩','机场接送','Airport transfers'),t('공항에서 숙소까지','机场与酒店之间','Between the airport and your hotel')],
  ['day-charter.html',t('전용 차량','包车','Private vehicles'),t('하루 이용 또는 구간 이동','全天用车或单程接送','Whole-day hire or a point-to-point ride')],
  ['tickets.html',t('입장권','景区门票','Attraction tickets'),t('날짜·연령·입장 시간 확인','核对日期、年龄与入场时段','Check dates, ages and entry times')],
  ['online-guide.html',t('온라인 여행 도움','线上旅行协助','Online travel support'),t('자유여행 중 이용','自由行途中使用','Help during an independent trip')],
 ].map(([href,title,desc])=>`<a class="ed-service" href="${u(href)}"><h3>${title} <span aria-hidden="true">↗</span></h3><p>${desc}</p></a>`).join('');
 return `<main class="ed-home">
  <section class="ed-shell ed-hero">
   <div class="ed-hero-copy">
    <h1>${t('장가계,<br>우리만의 속도로.','张家界，<br>按我们的节奏。','Zhangjiajie.<br>At your own pace.')}</h1>
    <p class="ed-hero-intro">${t('우리 일행만의 장가계 여행. 일정과 숙소, 차량을 함께 맞추고 한국어로 안내해요.','安排适合你们的张家界私人行程，协助预订住宿、用车和当地导游。','Private trips in Zhangjiajie, with help arranging hotels, transport and local guides.')}</p>
    <div class="ed-actions">
     <a class="primary ed-primary" href="${u('consultation.html?trip=custom')}" data-ed-action="start_inquiry">${t('여행 상담하기','咨询行程','Discuss your trip')}</a>
     <a class="ed-text-link" href="${u('trips.html#all-trips')}">${t('숙박여행 9개 비교','比较9条多日游','Compare 9 multi-day tours')}</a>
    </div>
    <p class="ed-hero-foot">${t('항공권 별도','机票另购','Flights are separate')}</p>
   </div>
   <figure class="ed-hero-picture">
    ${photo('mist.webp',t('안개 사이로 겹겹이 솟은 장가계 봉우리','云雾中层层耸立的张家界峰林','Zhangjiajie’s stone pillars rising through mist'),'width="1280" height="1400" fetchpriority="high" loading="eager"')}
    <img class="ed-hero-mascot" src="${assetBase}brand/rotucha-orange-hat-master.png" alt="" aria-hidden="true" width="130" height="150">
   </figure>
  </section>
  <section class="ed-shell ed-section" id="journeys">
   <div class="ed-section-head"><h2>${t('장가계 추천 일정','张家界推荐行程','Featured Zhangjiajie itineraries')}</h2></div>
   <div class="nb-party ed-party">
    <span>${t('요금을 볼 인원 · 만 15세 이상','查看报价人数（15岁及以上）','Group size for pricing (ages 15+)')}</span>
    <div class="party-pills">${[2,3,4,5,6].map(n=>`<button type="button" data-home-party="${n}" aria-pressed="${n===4}">${n}</button>`).join('')}</div>
    <small>${t('만 14세 이하 별도 견적','14岁及以下儿童另行报价','Separate quote for children aged 14 and under')}</small>
   </div>
   <div class="ed-feature-grid">${cards}</div>
   ${directory}
  </section>
  <section class="ed-section ed-services-band" id="services">
   <div class="ed-shell">
    <div class="ed-section-head"><h2>${t('필요한 서비스만 예약하기','按需预订单项服务','Book individual services')}</h2></div>
    <div class="ed-services-grid">${services}</div>
   </div>
  </section>
  ${renderTeam(lang,{assetBase})}${renderStandards(lang)}${renderEvidence(lang,{assetBase})}${renderBooking(lang)}
  <div class="ed-shell ed-closing">
   <div class="ed-actions" role="navigation" aria-label="${t('영상과 여행 커뮤니티','视频与旅行社区','Videos and travel community')}">
    <a class="ed-text-link" href="https://www.youtube.com/@Lctch/videos" target="_blank" rel="noopener">${t('여행 영상 · YouTube','旅行视频 · YouTube','Travel videos · YouTube')}</a>
    <a class="ed-text-link" href="https://cafe.naver.com/lotocha" target="_blank" rel="noopener">${t('여행 커뮤니티 · Naver Cafe','旅行社区 · Naver Cafe','Travel community · Naver Cafe')}</a>
   </div>
  </div>
  <aside class="ed-mobile-action" data-home-handoff hidden>
   <p>${t('날짜가 미정이어도 괜찮아요','日期未定也可咨询','Dates still undecided?')}</p>
   <a class="primary ed-primary" href="${u('consultation.html?trip=custom')}">${t('여행 상담하기','咨询行程','Discuss your trip')}</a>
  </aside>
 </main>`;
}
