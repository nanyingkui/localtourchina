import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(path.join(root, 'src/site-template.html'), 'utf8');

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
  html = `<!-- Generated from src/site-template.html. Run: npm run build -->\n${html}`;
  await writeFile(path.join(root, page.file), html);
}

const sitemapUrls = pages.map(page => {
  const url = `https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}`;
  const priority = page.service === 'home' ? '1.0' : '0.8';
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-27</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');

await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`);

console.log(`Built ${pages.length} pages and sitemap.xml`);
