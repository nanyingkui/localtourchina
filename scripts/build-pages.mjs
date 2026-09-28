import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(path.join(root, 'src/site-template.html'), 'utf8');
const englishTemplate = await readFile(path.join(root, 'src/english-template.html'), 'utf8');

const pages = [
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
    title: '장가계 데이투어 예약 | 로투차',
    description: '입장권, 차량, 점심과 한국어 가이드가 포함된 장가계 대표 일일 투어를 확인하세요.'
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
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${page.description}">`)
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}">`)
    .replace('<body data-initial-service="home">', `<body data-initial-service="${page.service}">`)
    .replace(/service-tab active/g, 'service-tab');

  const activePattern = new RegExp(`(<a class="service-tab)([^"]*" data-service="${page.service}")`);
  html = html.replace(activePattern, '$1 active$2');
  html = html.replace('href="en/index.html" data-en-link', `href="en/${page.file}" data-en-link`);
  html = html.replace('</head>', `  <link rel="alternate" hreflang="ko" href="https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}">\n  <link rel="alternate" hreflang="en" href="https://localtourchina.com/en/${page.file === 'index.html' ? '' : page.file}">\n</head>`);
  html = `<!-- Generated from src/site-template.html. Run: npm run build -->\n${html}`;
  await writeFile(path.join(root, page.file), html);
}

const englishPages = [
  {file:'index.html',service:'home',nav:'Home',title:'Zhangjiajie Private Tours | Localtour China',description:'Plan a Zhangjiajie private tour with local guides, tickets, hotels and private transport.',eyebrow:'LOCALTOUR CHINA',heading:'Zhangjiajie travel, made easier',intro:'Choose a complete private trip or request only the local services you need.',image:'../assets/media/hero/home-mobile.jpg',features:[['One local contact','Hotels, transport, tickets and guiding coordinated together.'],['Designed around your flights','We adapt the route after checking arrival and departure times.'],['Written quote first','Availability, payment and cancellation terms are confirmed before you pay.']]},
  {file:'private-tour.html',service:'private',nav:'Private tour',title:'All-inclusive Zhangjiajie Private Tour | Localtour China',description:'Request a tailor-made Zhangjiajie private tour with hotel, guide, tickets, meals and transport.',eyebrow:'ALL-INCLUSIVE PRIVATE TOUR',heading:'Your Zhangjiajie trip, planned as one journey',intro:'A private itinerary built around your dates, pace, hotel needs and must-see places.',image:'../assets/media/hero/home-mobile.jpg',features:[['Core services included','Hotel, private vehicle, local guide and itinerary tickets.'],['Flexible itinerary','Popular routes can be adjusted to your flights and walking preferences.'],['Human confirmation','A local coordinator checks the route before issuing the quote.']]},
  {file:'tickets.html',service:'ticket',nav:'Tickets',title:'Zhangjiajie Attraction Tickets | Localtour China',description:'Request Zhangjiajie National Forest Park, Tianmen Mountain and Grand Canyon tickets.',eyebrow:'ATTRACTION TICKETS',heading:'Book the right ticket combination',intro:'Tell us where you want to go and we will confirm the correct ticket, date and entry requirements.',image:'../assets/media/attractions/forest-south.jpg',features:[['National Forest Park','Routes may include Bailong Elevator, Tianzi Mountain and Golden Whip Stream.'],['Tianmen Mountain','Confirm the selected line, entry date and time before payment.'],['Grand Canyon','Glass Bridge and canyon options depend on the selected product.']]},
  {file:'day-tours.html',service:'daytour',nav:'Day tours',title:'Zhangjiajie Day Tours | Localtour China',description:'Explore Zhangjiajie on a private day tour with transport, tickets and a local guide.',eyebrow:'PRIVATE DAY TOURS',heading:'See more of Zhangjiajie in one day',intro:'Choose the scenery you want to experience and we will check a practical route for your date.',image:'../assets/media/attractions/canyon-bridge.jpg',features:[['Private schedule','Your group travels without joining a large fixed bus tour.'],['Local coordination','Pickup point, tickets and route timing are confirmed together.'],['Clear inclusions','The quote identifies transport, guide, meals and tickets separately.']]},
  {file:'local-guide.html',service:'guide',nav:'Local guide',title:'Zhangjiajie Local Guide | Localtour China',description:'Request a local guide for airport meetings and Zhangjiajie sightseeing.',eyebrow:'LOCAL GUIDE',heading:'Local help from arrival to sightseeing',intro:'Request an English-speaking guide and tell us where you would like to meet.',image:'../assets/services/guide-reception-desktop.jpg',features:[['Meeting support','Airport, railway station, hotel or attraction meeting points.'],['Sightseeing assistance','Route guidance and practical communication during the day.'],['Language confirmed','Guide language and service hours are written in your quote.']]},
  {file:'vehicles.html',service:'vehicle',nav:'Vehicles',title:'Zhangjiajie Airport Transfer & Private Car | Localtour China',description:'Arrange Zhangjiajie airport transfers and private vehicles based on passenger and luggage count.',eyebrow:'TRANSFER & PRIVATE CAR',heading:'The right vehicle for your group',intro:'Send passenger, luggage and pickup details so we can confirm a suitable local vehicle.',image:'../assets/services/airport-transfer-desktop.jpg',features:[['Airport and station transfer','Pickup and drop-off details are confirmed before travel.'],['Private vehicle service','Vehicle size is matched to passengers and luggage.'],['Real vehicle references','Available vehicle photos can be supplied before confirmation.']]},
  {file:'multi-booking.html',service:'combo',nav:'Multi-service',title:'Zhangjiajie Multi-service Booking | Localtour China',description:'Combine Zhangjiajie tickets, day tours, local guides and private vehicles in one inquiry.',eyebrow:'MULTI-SERVICE REQUEST',heading:'One inquiry for several local services',intro:'Combine tickets, touring, guiding and transport without sending the same trip details repeatedly.',image:'../assets/media/attractions/tianmen-cliff.jpg',features:[['One trip record','Dates and traveller details are shared across the requested services.'],['Fewer repeated steps','We return one coordinated response instead of separate conversations.'],['Itemised quote','Each included service and payment condition remains visible.']]},
  {file:'company.html',service:'company',nav:'Company',title:'Company & Service Provider | Localtour China',description:'View the Zhangjiajie travel service provider and Localtour China contact information.',eyebrow:'COMPANY & CONTACTS',heading:'Know who provides your local service',intro:'We publish the local service provider and operating contact details for transparency.',image:'../assets/media/hero/home-mobile.jpg',features:[['Service provider','Zhangjiajie Xiangxi International Travel Service Co., Ltd.'],['Operator','Nam Young-gyu (남영규)'],['Contact','China +86 185 8961 0702 · Korea +82 10 5572 2601 · KakaoTalk ID Buta200']]}
];
const enDir=path.join(root,'en');await mkdir(enDir,{recursive:true});
const navHtml=current=>englishPages.map(p=>`<a class="${p.service===current?'active':''}" href="${p.file}">${p.nav}</a>`).join('');
const featureHtml=page=>`<section class="overview card"><div><span class="eyebrow">WHAT TO EXPECT</span><h2>${page.service==='company'?'Verified contact details':'Local support, clearly explained'}</h2><div class="feature-list">${page.features.map(([a,b])=>`<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div></div><img src="${page.image}" alt="${page.heading}" loading="lazy"></section>`;
for(const page of englishPages){const koPath=`../${page.file}`,canonical=`https://localtourchina.com/en/${page.file==='index.html'?'':page.file}`,koUrl=`https://localtourchina.com/${page.file==='index.html'?'':page.file}`;const html=englishTemplate.replaceAll('{{TITLE}}',page.title).replaceAll('{{DESCRIPTION}}',page.description).replaceAll('{{CANONICAL}}',canonical).replaceAll('{{KO_URL}}',koUrl).replaceAll('{{KO_PATH}}',koPath).replaceAll('{{NAV}}',navHtml(page.service)).replaceAll('{{IMAGE}}',page.image).replaceAll('{{EYEBROW}}',page.eyebrow).replaceAll('{{HEADING}}',page.heading).replaceAll('{{INTRO}}',page.intro).replaceAll('{{CONTENT}}',featureHtml(page)).replaceAll('{{SERVICE_JSON}}',JSON.stringify(page.nav));await writeFile(path.join(enDir,page.file),`<!-- Generated from src/english-template.html. Run: npm run build -->\n${html}`)}

const sitemapUrls = [...pages.map(page=>({...page,prefix:''})),...englishPages.map(page=>({...page,prefix:'en/'}))].map(page => {
  const url = `https://localtourchina.com/${page.prefix}${page.file === 'index.html' ? '' : page.file}`;
  const priority = page.service === 'home' ? '1.0' : '0.8';
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-28</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');

await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`);

console.log(`Built ${pages.length} Korean pages, ${englishPages.length} English pages and sitemap.xml`);
