import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(path.join(root, 'src/site-template.html'), 'utf8');
const englishTemplate = await readFile(path.join(root, 'src/english-template.html'), 'utf8');
const englishAnalyticsHead = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-232N1VVFP5"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-232N1VVFP5');</script>`;
const englishAnalyticsEvents = `<script>document.addEventListener('click',event=>{const target=event.target.closest('a,button');if(!target||typeof gtag!=='function')return;const href=target.getAttribute('href')||'';if(target.closest('.language-switch')&&target.lang==='ko')gtag('event','language_switch',{from_language:'en',to_language:'ko',service});if(target.id==='copy')gtag('event','inquiry_copy',{language:'en',service});if(href.includes('pf.kakao.com'))gtag('event','kakao_click',{language:'en',service});if(href.includes('youtube.com'))gtag('event','youtube_click',{language:'en',service});if(href.includes('cafe.naver.com'))gtag('event','naver_cafe_click',{language:'en',service});if(href.startsWith('tel:'))gtag('event','phone_click',{language:'en',service})});</script>`;

const reviews = JSON.parse(await readFile(path.join(root, 'src/reviews.json'), 'utf8'));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const sortedReviews = [...reviews].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
const reviewIds = new Set();
for (const review of sortedReviews) {
  if (reviewIds.has(review.id) || !review.title || !review.author || !review.summary || !review.category || !['review','collection','guide'].includes(review.kind)) throw new Error('Incomplete or duplicate review');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(review.publishedAt) || review.sourceUrl !== `https://cafe.naver.com/lotocha/${review.id}` || !/^\d+$/.test(review.id)) throw new Error('Invalid review date or source URL');
  reviewIds.add(review.id);
}
const renderReview = review => {
  const isReview = review.kind === 'review';
  const cta = isReview ? '네이버 카페에서 전체 후기 읽기' : '네이버 카페에서 원문 보기';
  return `<article class="review-card" data-review-id="${escapeHtml(review.id)}"><div class="review-card-top"><span class="review-source">NAVER CAFE</span><time datetime="${escapeHtml(review.publishedAt)}">${escapeHtml(review.publishedAt.replaceAll('-','.'))}</time></div><span class="review-category">${escapeHtml(review.category)}</span><h3><a href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(review.title)}</a></h3><div class="review-summary"><span>${isReview ? '후기 요약' : '게시글 요약'}</span><p>${escapeHtml(review.summary)}</p></div><div class="review-author"><span class="review-avatar" aria-hidden="true">${escapeHtml(Array.from(review.author)[0])}</span><span>${escapeHtml(review.author)}</span></div><a class="review-original" href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(review.title)} — ${cta} (새 창)"><span>${cta}</span><span aria-hidden="true">↗</span></a></article>`;
};
const reviewCards = sortedReviews.filter(review=>review.kind==='review').map(renderReview);
const relatedReviewCards = sortedReviews.filter(review=>review.kind!=='review').map(renderReview);

const pages = [
  {file:'booking.html',service:'booking',title:'여행 예약 | 로투차',description:'맞춤 여행, 데이투어, 입장권, 차량과 가이드를 필요한 만큼 선택하세요.'},
  {file:'food-map.html',service:'food',title:'지역별 맛집·지도 | 로투차',description:'장가계 시내·무릉원·봉황고성·부용진·싼야 식당 안내와 고덕지도.'},
  {file:'reviews.html', service:'reviews', title:'장가계 여행 후기 | 로투차', description:'네이버 카페에 남겨진 장가계 여행 후기의 핵심을 읽고, 원문에서 전체 이야기와 사진을 확인하세요.'},
  {file:'travel-info.html', service:'info', title:'중국 여행 준비·입국 체크리스트 | 로투차', description:'한국 여권 여행자를 위한 중국 무비자·입국신고·결제·통신·교통 준비를 단계별로 확인하세요. 장가계·무릉원·봉황고성·부용진·싼야 맛집 안내 Beta.'},
  {
    file: 'index.html',
    service: 'home',
    title: '로투차 | 장가계 현지 여행 예약',
    description: '장가계 입장권, 데이투어, 한국어 현지가이드, 차량과 올인원 프라이빗 투어를 한곳에서 확인하세요.'
  },
  {
    file: 'private-tour.html',
    service: 'private',
    title: '장가계 올인원 프라이빗 투어 | 로투차',
    description: '호텔, 전용차량, 한국어 가이드, 입장권과 식사가 포함된 장가계 맞춤 프라이빗 투어를 설계하세요.'
  },
  {
    file: 'tickets.html',
    service: 'ticket',
    title: '장가계 관광지 입장권 예약 | 로투차',
    description: '장가계 국가삼림공원, 천문산과 대협곡 입장권 옵션을 비교하고 예상 금액을 확인하세요.'
  },
  {
    file: 'day-tours.html',
    service: 'daytour',
    title: '장가계 · 하이난 싼야·삼아 데이투어 예약 | 로투차',
    description: '장가계와 하이난 싼야·삼아(三亚) 일일 투어의 일정, 요금, 포함 사항과 집결 장소를 확인하세요.'
  },
  {
    file: 'local-guide.html',
    service: 'guide',
    title: '장가계 한국어 현지가이드 | 로투차',
    description: '장가계 공항·역 미팅부터 관광지 동행까지 일정에 맞는 한국어 현지가이드를 요청하세요.'
  },
  {
    file: 'vehicles.html',
    service: 'vehicle',
    title: '장가계 차량·공항픽업 예약 | 로투차',
    description: '장가계 공항 픽업, 샌딩과 인원에 맞는 전용차량의 사진 및 예상 금액을 확인하세요.'
  },
  {
    file: 'multi-booking.html',
    service: 'combo',
    title: '장가계 여행 서비스 묶음예약 | 로투차',
    description: '입장권, 데이투어, 한국어 가이드와 차량을 한 번에 조합해 문의하세요.'
  },
  {
    file: 'company.html',
    service: 'company',
    title: '사업자·서비스 제공자 정보 | 로투차',
    description: '로투차 장가계 여행 서비스 제공업체, 중국 법인 영업집조와 한국·중국 상담 연락처를 확인하세요.'
  }
];

for (const page of pages) {
  let html = template.replaceAll('{{REVIEW_CARDS}}', reviewCards.join('\n')).replaceAll('{{RELATED_REVIEW_CARDS}}', relatedReviewCards.join('\n')).replaceAll('{{REVIEW_COUNT}}', String(reviewCards.length)).replaceAll('{{FEATURED_REVIEW_CARDS}}', reviewCards.slice(0, 2).join('\n'))
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${page.description}">`)
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}">`)
    .replace('<body data-initial-service="home">', `<body data-initial-service="${page.service}">`)
    .replace(/service-tab active/g, 'service-tab');

  const activePattern = new RegExp(`(<a class="service-tab)([^"]*" data-service="${page.service}")`);
  html = html.replace(activePattern, '$1 active$2');
  html = html.replace('href="en/index.html" data-en-link', `href="en/${['reviews','booking','food'].includes(page.service) ? 'index.html' : page.file}" data-en-link`);
  html = html.replace('</head>', `  <link rel="alternate" hreflang="ko" href="https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}">\n  <link rel="alternate" hreflang="en" href="https://localtourchina.com/en/${['reviews','booking','food'].includes(page.service) || page.file === 'index.html' ? '' : page.file}">\n</head>`);
  if (page.service === 'reviews') html = html.replace(/  <link rel="alternate" hreflang="en"[^>]*>\n/, '');
  html = `<!-- Generated from src/site-template.html. Run: npm run build -->\n${html}`;
  await writeFile(path.join(root, page.file), html);
}

const englishPages = [
  {file:'index.html',service:'home',nav:'Home',title:'Zhangjiajie Private Tours | Localtour China',description:'Plan a Zhangjiajie private tour with a fluent English-speaking local guide, tickets, hotels and private transport.',eyebrow:'LOCALTOUR CHINA',heading:'Zhangjiajie travel, made easier',intro:'Choose a complete private trip or request only the local services you need.',image:'../assets/media/hero/home-mobile.jpg',features:[['One local contact','Hotels, transport, tickets and a fluent English-speaking local guide are coordinated together.'],['Designed around your flights','We adapt the route after checking arrival and departure times.'],['Written quote first','Availability, payment and cancellation terms are confirmed before you pay.']]},
  {file:'travel-info.html',service:'info',nav:'Travel guide',title:'Zhangjiajie & Sanya Food and Travel Guide | Localtour China',description:'Practical food, transport, payment and packing advice for Zhangjiajie and Sanya.',eyebrow:'LOCAL TRAVEL GUIDE',heading:'Local food and practical travel tips',intro:'Quick guidance for eating, getting around, paying and preparing for your trip.',image:'../assets/media/sanya/night-market.jpg',features:[['Zhangjiajie food','Try Sanxiaguo, Tujia dishes and rice noodles; ask for the spice level before ordering.'],['Sanya food','Confirm seafood weight, price and cooking charges before payment.'],['Transport, payment and contact','Save your hotel address in Chinese, confirm your payment method and keep the local coordinator on KakaoTalk or WeChat.'],['Personal recommendations','Send your hotel, group size, dietary needs and preferred food. We will suggest options that fit your route.']]},
  {file:'private-tour.html',service:'private',nav:'Private tour',title:'All-inclusive Zhangjiajie Private Tour | Localtour China',description:'Request a tailor-made Zhangjiajie private tour with hotel, a fluent English-speaking local guide, tickets, meals and transport.',eyebrow:'ALL-INCLUSIVE PRIVATE TOUR',heading:'Your Zhangjiajie trip, planned as one journey',intro:'A private itinerary built around your dates, pace, hotel needs and must-see places.',image:'../assets/media/hero/home-mobile.jpg',features:[['Core services included','Hotel, private vehicle, itinerary tickets and the company of a fluent English-speaking local guide.'],['Flexible itinerary','Popular routes can be adjusted to your flights and walking preferences.'],['Human confirmation','A local coordinator checks the route before issuing the quote.']]},
  {file:'tickets.html',service:'ticket',nav:'Tickets',title:'Zhangjiajie Attraction Tickets | Localtour China',description:'Request Zhangjiajie National Forest Park, Tianmen Mountain and Grand Canyon tickets.',eyebrow:'ATTRACTION TICKETS',heading:'Book the right ticket combination',intro:'Tell us where you want to go and we will confirm the correct ticket, date and entry requirements.',image:'../assets/media/attractions/forest-south.jpg',features:[['National Forest Park','Routes may include Bailong Elevator, Tianzi Mountain and Golden Whip Stream.'],['Tianmen Mountain','Confirm the selected line, entry date and time before payment.'],['Grand Canyon','Glass Bridge and canyon options depend on the selected product.']]},
  {file:'day-tours.html',service:'daytour',nav:'Day tours',title:'Zhangjiajie Day Tours | Localtour China',description:'Explore Zhangjiajie on a private day tour with transport, tickets and a fluent English-speaking local guide.',eyebrow:'PRIVATE DAY TOURS',heading:'See more of Zhangjiajie in one day',intro:'Choose the scenery you want to experience and travel with a fluent English-speaking local guide.',image:'../assets/media/attractions/canyon-bridge.jpg',features:[['Private schedule','Your group travels without joining a large fixed bus tour.'],['English guide accompaniment','A fluent English-speaking local guide accompanies your group throughout the agreed sightseeing hours.'],['Clear inclusions','The quote identifies transport, guide, meals and tickets separately.']]},
  {file:'local-guide.html',service:'guide',nav:'English guide',title:'Fluent English-speaking Zhangjiajie Local Guide | Localtour China',description:'Travel with a fluent English-speaking local guide for Zhangjiajie airport meetings and sightseeing.',eyebrow:'FLUENT ENGLISH-SPEAKING LOCAL GUIDE',heading:'Explore Zhangjiajie with a fluent English-speaking local guide',intro:'Your local guide accompanies you from the agreed meeting point and communicates with you in fluent English throughout the booked service hours.',image:'../assets/services/guide-reception-desktop.jpg',features:[['Meeting support','Meet your fluent English-speaking local guide at the airport, railway station, hotel or agreed attraction entrance.'],['Accompanied sightseeing','Your guide stays with your group during the agreed itinerary and helps with local communication.'],['Service clearly confirmed','Meeting point, guide service hours and itinerary are written in your quote.']]},
  {file:'vehicles.html',service:'vehicle',nav:'Vehicles',title:'Zhangjiajie Airport Transfer & Private Car | Localtour China',description:'Arrange Zhangjiajie airport transfers and private vehicles based on passenger and luggage count.',eyebrow:'TRANSFER & PRIVATE CAR',heading:'The right vehicle for your group',intro:'Send passenger, luggage and pickup details so we can confirm a suitable local vehicle.',image:'../assets/services/airport-transfer-desktop.jpg',features:[['Airport and station transfer','Pickup and drop-off details are confirmed before travel.'],['Private vehicle service','Vehicle size is matched to passengers and luggage.'],['Real vehicle references','Available vehicle photos can be supplied before confirmation.']]},
  {file:'multi-booking.html',service:'combo',nav:'Multi-service',title:'Zhangjiajie Multi-service Booking | Localtour China',description:'Combine Zhangjiajie tickets, day tours, a fluent English-speaking local guide and private vehicles in one inquiry.',eyebrow:'MULTI-SERVICE REQUEST',heading:'One inquiry for several local services',intro:'Combine tickets, touring, a fluent English-speaking local guide and transport without repeating your trip details.',image:'../assets/media/attractions/tianmen-cliff.jpg',features:[['One trip record','Dates and traveller details are shared across the requested services.'],['English guide option','A fluent English-speaking local guide can accompany your group during the agreed sightseeing hours.'],['Itemised quote','Each included service and payment condition remains visible.']]},
  {file:'company.html',service:'company',nav:'Company',title:'Company & Service Provider | Localtour China',description:'View the Zhangjiajie travel service provider and Localtour China contact information.',eyebrow:'COMPANY & CONTACTS',heading:'Know who provides your local service',intro:'We publish the local service provider and operating contact details for transparency.',image:'../assets/media/hero/home-mobile.jpg',features:[['Service provider','Zhangjiajie Xiangxi International Travel Service Co., Ltd.'],['Operator','Nam Young-gyu (남영규)'],['Contact','China +86 185 8961 0702 · Korea +82 10 5572 2601 · KakaoTalk Buta200 · WeChat nanyingkui']]}
];
const enDir=path.join(root,'en');await mkdir(enDir,{recursive:true});
const navHtml=current=>englishPages.map(p=>`<a class="${p.service===current?'active':''}" href="${p.file}">${p.nav}</a>`).join('');
const featureHtml=page=>`<section class="overview card"><div><span class="eyebrow">WHAT TO EXPECT</span><h2>${page.service==='company'?'Verified contact details':'Local support, clearly explained'}</h2><div class="feature-list">${page.features.map(([a,b])=>`<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div></div><img src="${page.image}" alt="${page.heading}" loading="lazy"></section>`;
for(const page of englishPages){const koPath=`../${page.file}`,canonical=`https://localtourchina.com/en/${page.file==='index.html'?'':page.file}`,koUrl=`https://localtourchina.com/${page.file==='index.html'?'':page.file}`;const html=englishTemplate.replace('<head>',`<head>${englishAnalyticsHead}`).replace('</body>',`${englishAnalyticsEvents}</body>`).replaceAll('{{TITLE}}',page.title).replaceAll('{{DESCRIPTION}}',page.description).replaceAll('{{CANONICAL}}',canonical).replaceAll('{{KO_URL}}',koUrl).replaceAll('{{KO_PATH}}',koPath).replaceAll('{{NAV}}',navHtml(page.service)).replaceAll('{{IMAGE}}',page.image).replaceAll('{{EYEBROW}}',page.eyebrow).replaceAll('{{HEADING}}',page.heading).replaceAll('{{INTRO}}',page.intro).replaceAll('{{CONTENT}}',featureHtml(page)).replaceAll('{{SERVICE_JSON}}',JSON.stringify(page.nav)).replaceAll('{{SERVICE_SLUG}}',page.service);await writeFile(path.join(enDir,page.file),`<!-- Generated from src/english-template.html. Run: npm run build -->\n${html}`)}

const sitemapUrls = [...pages.map(page=>({...page,prefix:''})),...englishPages.map(page=>({...page,prefix:'en/'}))].map(page => {
  const url = `https://localtourchina.com/${page.prefix}${page.file === 'index.html' ? '' : page.file}`;
  const priority = page.service === 'home' ? '1.0' : '0.8';
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-28</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');

await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`);

console.log(`Built ${pages.length} Korean pages, ${englishPages.length} English pages and sitemap.xml`);
