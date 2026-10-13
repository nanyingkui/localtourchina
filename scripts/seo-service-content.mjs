import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const services=[
 {file:'local-guide.html',id:'guide',title:'장가계 한국어 가이드 예약·이용 안내 | 로투차',heading:'장가계 한국어 가이드',intro:'공항·역 미팅부터 관광지 동행까지, 필요한 날짜와 일정에 맞춰 한국어 현지가이드를 요청하세요.',items:[['예약 전에 알려 주세요','여행 날짜, 인원, 만나는 장소와 방문할 관광지를 알려 주세요. 가이드 가능 여부와 실제 동행 시간을 확인한 뒤 예약합니다.'],['가이드와 차량은 별도로 확인해요','가이드 요청만으로 차량·입장권·식사가 모두 포함되는 것은 아닙니다. 필요한 서비스를 함께 선택하고 최종 견적서에서 포함 범위를 확인하세요.'],['일정에 맞는 동행','장가계 시내와 무릉원 등 방문 장소와 이동 동선을 상담하세요. 걷는 거리나 계단이 부담되는 일행이 있다면 미리 알려 주세요.']]},
 {file:'vehicles.html',id:'vehicle',title:'장가계 공항 픽업·전용차량 예약 | 로투차',heading:'장가계 공항 픽업·전용차량',intro:'공항 픽업·샌딩 또는 하루 전용차량을 여행 인원, 수하물과 이동 구간에 맞춰 요청하세요.',items:[['공항 픽업에 필요한 정보','도착 날짜, 항공편, 도착 시간, 인원과 숙소를 알려 주세요. 장가계 시내와 무릉원 등 목적지에 맞춰 이동 조건을 확인합니다.'],['인원과 수하물을 함께 확인','좌석 수만으로 차량을 결정하지 않습니다. 캐리어 수와 크기, 아동 동반 여부를 함께 알려 주세요. 실제 배정 차량은 최종 견적에서 확인합니다.'],['최종 금액 확인','편도·왕복, 이용 시간과 구간을 확인한 뒤 견적을 안내합니다. 추가 이동이나 일정 변경에 따른 비용도 확정 전에 확인하세요.']]},
 {file:'tickets.html',id:'ticket',title:'장가계 입장권 예약·천문산 관광 옵션 | 로투차',heading:'장가계 관광지 입장권 예약',intro:'장가계 국가삼림공원, 천문산과 대협곡의 입장 옵션을 비교하고 방문 날짜와 연령에 맞는 예상 금액을 확인하세요.',items:[['방문 날짜와 연령을 먼저 확인','관광지, 방문 날짜, 여행자 연령과 희망 옵션을 선택하세요. 할인 조건과 예약 가능 여부는 확인 후 안내합니다.'],['입장권과 교통 옵션 구분','케이블카·엘리베이터·관광열차 등은 선택한 상품별로 포함 범위가 다릅니다. 필요한 구간을 확인하고 견적서와 예약 안내를 함께 확인하세요.'],['천문산 운영 공지 확인','운영 노선과 판매 옵션은 변경될 수 있습니다. 여행 준비 페이지의 천문산 공지와 예약 시 안내를 확인한 뒤 일정을 정하세요.']]},
 {file:'private-tour.html',id:'private',title:'장가계 프라이빗 투어·맞춤여행 | 로투차',heading:'장가계 프라이빗 투어·맞춤여행',intro:'여행 날짜와 인원, 숙소와 이동 동선을 기준으로 우리 일행에게 맞는 장가계 여행을 구성하세요.',items:[['직접 고르는 여행 일정','희망 관광지, 도착·출발 시간과 여행 속도를 알려 주세요. 이미 준비한 서비스는 제외하고 필요한 숙박·차량·가이드 등을 구성합니다.'],['부모님·가족과 함께라면','보행 상태, 계단 부담과 휴식 시간을 미리 알려 주세요. 관광지별 도보 구간을 확인하고 일행의 체력에 맞춰 일정을 상담합니다.'],['참고가와 최종 견적','표시된 참고가는 조건에 따른 예상 금액입니다. 날짜·호텔·객실·인원과 예약 가능 여부를 확인한 최종 견적 및 포함·불포함 내역을 확인하세요.']]},
 {file:'day-tours.html',id:'daytour',title:'장가계·싼야 하루 투어 일정·예약 | 로투차',heading:'장가계·싼야 하루 투어',intro:'여행지와 원하는 코스를 선택하고 일정, 픽업 조건 및 포함·불포함 내역을 비교하세요.',items:[['여행지와 코스 선택','장가계와 하이난 싼야 상품은 일정과 운영 조건이 다릅니다. 이용할 지역과 코스를 먼저 선택해 주세요.'],['픽업과 포함 내역 확인','집결 장소, 픽업 범위, 식사·입장권·차량·가이드 포함 여부를 상품별로 확인하세요.'],['예약 확정 전 확인','인원별 추가금, 출발 가능 여부와 취소 조건은 상품별 안내 및 최종 견적에서 확인하세요.']]}
];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const page of services){
 const file=path.join(root,page.file);let html=await fs.readFile(file,'utf8');
 html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${page.title}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(page.intro)}">`);
 const overview=`<section class="card seo-service-overview" aria-label="${page.heading} 이용 안내"><h2>${page.heading} 이용 안내</h2><p>${page.intro}</p>${page.items.map(([h,p])=>`<h3>${h}</h3><p>${p}</p>`).join('')}<nav aria-label="관련 여행 서비스">${services.filter(x=>x.id!==page.id).map(x=>`<a href="${x.file}">${x.heading}</a>`).join(' · ')} · <a href="travel-info.html">중국 여행 준비 안내</a></nav></section>`;
 const pattern=new RegExp(`(<(?:section|div)\\b[^>]*id="service-${page.id}"[^>]*>)`);
 if(!pattern.test(html))throw Error('Missing service panel '+page.file);
 html=html.replace(pattern,'$1'+overview);
 const breadcrumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'로투차',item:'https://localtourchina.com/'},{'@type':'ListItem',position:2,name:page.heading,item:'https://localtourchina.com/'+page.file}]};
 html=html.replace('</head>',`<meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.intro)}"><script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script><style>.seo-service-overview{margin:18px 0;padding:24px}.seo-service-overview h2{font-size:24px}.seo-service-overview h3{font-size:17px;margin-top:22px}.seo-service-overview p{line-height:1.8}.seo-service-overview nav{line-height:2;margin-top:20px}</style></head>`);
 await fs.writeFile(file,html);
}
console.log('Added service-specific Korean guidance and breadcrumbs to '+services.length+' pages.');
