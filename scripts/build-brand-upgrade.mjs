import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {renderHome,esc} from '../redesign/brand-upgrade/home.mjs';
import {renderComparison} from '../redesign/brand-upgrade/comparison.mjs';
import {renderStandards,renderBooking} from '../redesign/brand-upgrade/evidence.mjs';
import {enhanceInquiry} from '../redesign/brand-upgrade/inquiry.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'redesign/brand-upgrade');
const dist=path.join(root,'redesign/dist/client');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('catalog-site/catalog.json'));
const manifest=new Set(JSON.parse(read('public-release-manifest.json')));
const hash=crypto.createHash('sha256');
for(const name of fs.readdirSync(source).filter(n=>/\.(mjs|js|css)$/.test(n)).sort())hash.update(name).update(fs.readFileSync(path.join(source,name)));
hash.update(read('src/reviews.json'));
const base='/assets/editorial/'+hash.digest('hex').slice(0,12)+'/';
const publicAssets=['editorial.css','comparison.css','comparison.js','inquiry.css','client.js'];
function write(relative,content){for(const parent of [root,dist]){const target=path.join(parent,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}manifest.add(relative);}
for(const name of publicAssets)write(base.slice(1)+name,fs.readFileSync(path.join(source,name)));
const languages=['ko','zh','en'];
const languageFor=name=>name.startsWith('zh/')?'zh':name.startsWith('en/')?'en':'ko';
const local=(lang,file)=>(lang==='ko'?'/':'/'+lang+'/')+file;
const words=(lang,ko,zh,en)=>({ko,zh,en})[lang];
const removeBlock=(html,name)=>html.replace(new RegExp('<!-- editorial:'+name+':start -->[\\s\\S]*?<!-- editorial:'+name+':end -->','g'),'');
const block=(name,html)=>`<!-- editorial:${name}:start -->${html}<!-- editorial:${name}:end -->`;
function sectionSpan(html,id){
 const start=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>').exec(html);if(!start)return null;
 let depth=0;const tail=html.slice(start.index);
 for(const item of tail.matchAll(/<\/?section\b[^>]*>/g)){depth+=item[0].startsWith('</')?-1:1;if(!depth)return [start.index,start.index+item.index+item[0].length];}
 throw Error('Unclosed section: '+id);
}
function replaceSection(html,id,replacement){const range=sectionSpan(html,id);if(!range)throw Error('Missing section '+id);return html.slice(0,range[0])+replacement+html.slice(range[1]);}
function sharedAssetBase(html){const match=html.match(/\/assets\/notebook\/[a-f0-9]+\//);if(!match)throw Error('Published notebook assets missing');return match[0];}
function localizeContacts(html,lang){const target={ko:'https://pf.kakao.com/_hvrmn/chat',zh:'/zh/travel-safety.html?channel=wechat',en:'https://wa.me/821055722601'}[lang];return html.replace(/<a\b[^>]*>/g,tag=>{tag=tag.replace(/\bdata-contact(?:\s+data-contact)+/g,'data-contact');if(!tag.includes('href="https://pf.kakao.com/_hvrmn/chat"'))return tag;tag=tag.replace('href="https://pf.kakao.com/_hvrmn/chat"','href="'+target+'"');return /\bdata-contact(?:\s|=|>)/.test(tag)?tag:tag.replace('<a','<a data-contact');});}

// The original calculators, public catalogue, contact boundary and ledgers remain
// in their generated documents. This layer owns presentation and decision aids.
for(const lang of languages){
 const prefix=lang==='ko'?'':lang+'/';
 const homePath=prefix+'index.html';let html=read(homePath);const assetBase=sharedAssetBase(html);
 const directory=read('redesign/notebook/ko/multiday-directory.html.inc');
 // Reuse the already localized published compact directory when available.
 const old=sectionSpan(html,'all-trips');
 const compact=old?html.slice(old[0],old[1]):directory;
 html=html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,renderHome(lang,{assetBase,directory:compact}));
 const description=words(lang,'장가계의 풍경을 우리 일행의 속도로. 한국어 현지 안내, 모든 숙박여행 비교, 실제 여행 이야기와 비용 확인까지.','按同行人的节奏，认识张家界。韩语当地陪同、全部多日游比较、真实旅行记录与清楚的费用说明。','Experience Zhangjiajie at your own group’s pace. Korean-speaking local support, every multi-day itinerary, real traveller stories and clear costs.');
 html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(description)}">`);
 write(homePath,html);

 const tripsPath=prefix+'trips.html';html=read(tripsPath);
 html=replaceSection(html,'all-trips',renderComparison(lang,{catalog,assetBase}));
 if(!html.includes('id="featured-comparison"')){
  const start=html.indexOf('<figure class="landscape">'),end=html.indexOf('<section class="concern-section');
  if(start>=0&&end>start){const label=words(lang,'주요 3개 코스의 사진·기본요금 더 살펴보기','展开查看3条主推线路的照片与基础报价','Explore photos and base prices for 3 featured itineraries');html=html.slice(0,start)+`<details class="ed-featured-deepdive" id="featured-comparison"><summary>${label}</summary><div>`+html.slice(start,end)+'</div></details>'+html.slice(end);}
 }
 write(tripsPath,html);

 const catalogPath=prefix+'products.html';html=removeBlock(read(catalogPath),'catalog-guide');
 const band=`<aside class="ed-catalog-guide"><p>${words(lang,'어떤 코스가 맞을지 고민된다면, 걷기·숙박·추가되는 경험을 나란히 비교해 보세요.','还在犹豫选哪条？可以并排比较步行、住宿，以及各条路线增加或舍去的体验。','Still deciding? Compare walking, stays, and what each itinerary adds or leaves out.')}</p><a href="${local(lang,'trips.html#all-trips')}">${words(lang,'9가지 숙박여행 비교하기','比较全部9条多日游','Compare all 9 multi-day tours')}</a></aside>`;
 html=html.replace(/(<main\b[^>]*>)/,'$1'+block('catalog-guide',band));write(catalogPath,html);

 // Existing detail pages receive a succinct, product-specific decision bridge.
 for(const [file,trip] of [['zhangjiajie-4days.html','regular34'],['zhangjiajie.html','experience45'],['zhangjiajie-6days.html','regular56']]){
  const relative=prefix+file;html=removeBlock(read(relative),'confidence');
  const confidence=`<section class="ed-product-confidence"><h2>${words(lang,'좋은 여행은, 미리 나눈 약속에서.','好的旅行，从提前说清楚开始。','A good trip starts with clear expectations.')}</h2><p>${words(lang,'걷는 정도와 쉬는 지점, 호텔·객실과 포함 항목을 일행에게 맞춰 확인합니다. 추가 방문이나 시간 연장이 필요하면 가능 여부와 비용을 먼저 확인해요.','按同行人的需求确认步行、休息点、酒店房型与包含项目。若需要增加地点或延长服务，先确认能否安排及费用。','We confirm walking, rest points, hotel rooms and inclusions for your group. Additional visits or more service time are discussed with the cost before you choose.')}</p><a class="ed-text-link" href="${local(lang,'consultation.html?trip='+trip)}">${words(lang,'우리 조건으로 일정·금액 확인하기','按我们的条件确认行程与金额','Check the itinerary and cost for our group')}</a><a class="ed-text-link" href="${local(lang,'index.html#service-standards')}">${words(lang,'로투차의 서비스 원칙 읽기','了解罗途查的服务原则','Read our service principles')}</a></section>`;
  html=html.replace(/(<section\b[^>]*\bid="ask"[^>]*>)/,block('confidence',confidence)+'$1');write(relative,html);
 }
 for(const file of ['consultation.html','service-consultation.html']){const relative=prefix+file;write(relative,enhanceInquiry(read(relative),lang));}
 // Guide and support pages make the operator's values inspectable without
 // claiming a training programme or a guarantee that has not been documented.
 for(const file of ['korean-guide.html','travel-care.html']){const relative=prefix+file;html=removeBlock(read(relative),'principles');html=html.replace(/<\/main>/,block('principles',`<div class="ed-shell">${renderStandards(lang)}</div>` )+'</main>');write(relative,html);}
}

for(const name of [...manifest]){
 if(!name.endsWith('.html')||/^(?:admin|app\/|travel-planner\/)|(?:^|\/)(?:account|login|status|inquiry-status|configure|legacy-flow)\.html/.test(name))continue;
 let html=read(name);if(/http-equiv=["']refresh/i.test(html))continue;
 html=html.replace(/<link\b[^>]*data-editorial-style[^>]*>/g,'').replace(/<script\b[^>]*data-editorial-runtime[^>]*><\/script>/g,'');
 html=html.replace(/<body\b([^>]*)>/,(all,attrs)=>/class="/.test(attrs)?'<body'+attrs.replace(/class="([^"]*)"/,(_,v)=>'class="'+[...new Set((v+' ed-public').split(/\s+/))].join(' ')+'"')+'>':'<body class="ed-public"'+attrs+'>');
 html=html.replace('</head>',`<link data-editorial-style rel="stylesheet" href="${base}editorial.css"><link data-editorial-style rel="stylesheet" href="${base}comparison.css">${/consultation\.html$/.test(name)?`<link data-editorial-style rel="stylesheet" href="${base}inquiry.css">`:''}</head>`);
 html=html.replace('</body>',`<script data-editorial-runtime defer src="${base}comparison.js"></script><script data-editorial-runtime defer src="${base}client.js"></script></body>`);
 write(name,localizeContacts(html,languageFor(name)));
}
fs.writeFileSync(path.join(root,'public-release-manifest.json'),JSON.stringify([...manifest].sort(),null,2)+'\n');
console.log(JSON.stringify({editorialAssets:base,languages:3,publicFiles:manifest.size,pricingChanged:false,customerWrites:false}));
