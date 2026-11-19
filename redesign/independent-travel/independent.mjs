import {esc} from '../brand-upgrade/home.mjs';
import {cityCopy,renderCityCard} from './city.mjs';

const copy = {
  ko: {
    label:'자유여행 정보', title:'장가계 자유여행 정보', intro:'묵을 곳이나 가까운 관광지부터 골라보세요. 식당, 카페와 숙소를 지역별로 모았어요.',
    allAreas:'전체 지역', areas:{wulingyuan:'무릉원',city:'장가계 시내',scenic:'관광지 주변'},
    allTypes:'전체 보기', types:{food:'현지 맛집',coffee:'카페',hotel:'숙소'},
    areaLabel:'지역', typeLabel:'종류', results:'추천 장소', empty:'이 지역에 확인된 정보가 아직 없어요. 다른 지역을 골라보세요.', reset:'초기화',
    count:'곳', map:'지도에서 보기', source:'자세히 보기', example:'참고 사진',
    plannerTitle:'가고 싶은 곳을 정했나요?', plannerText:'추천 일정에서 시작해 장소를 더하거나 순서를 바꿔보세요.',
    plannerAction:'내 일정 만들기', plannerJump:'일정 계획 도구', language:'언어 선택', legacy:'여행 준비 자료', home:'로투차 홈',
  },
  zh: {
    label:'自由行资料', title:'张家界自由行资料', intro:'先选住的区域或要去的景区，再找附近的餐厅、咖啡店和住宿。',
    allAreas:'全部区域', areas:{wulingyuan:'武陵源',city:'张家界市区',scenic:'景区周边'},
    allTypes:'全部类型', types:{food:'本地美食',coffee:'咖啡店',hotel:'酒店与住宿'},
    areaLabel:'区域', typeLabel:'类型', results:'吃喝住推荐', empty:'这一区域暂时没有这类已核对的资料。可以切换到其他区域。', reset:'清除筛选',
    count:'条资料', map:'地图定位', source:'查看详情', example:'参考照片',
    plannerTitle:'想去的地方选好了？', plannerText:'从推荐行程开始，把想去的地点加进去，再调整顺序。规划工具目前为韩文界面。',
    plannerAction:'排我的行程', plannerJump:'行程规划器', language:'语言选择', legacy:'出发前的旅行资料', home:'罗途查首页',
  },
  en: {
    label:'Independent travel', title:'Zhangjiajie on your own', intro:'Pick where you’ll stay or what you’ll visit. Find local food, cafés and accommodation nearby.',
    allAreas:'All areas', areas:{wulingyuan:'Wulingyuan',city:'Zhangjiajie city',scenic:'Near attractions'},
    allTypes:'All categories', types:{food:'Local food',coffee:'Cafés',hotel:'Accommodation'},
    areaLabel:'Area', typeLabel:'Category', results:'Places to eat, drink and stay', empty:'There are no verified entries for this area and category yet. Try another area.', reset:'Clear filters',
    count:'places', map:'Open map', source:'See details', example:'Reference photo',
    plannerTitle:'Ready to plan your days?', plannerText:'Start with a suggested route, then add stops and change their order. The planner interface is currently in Korean.',
    plannerAction:'Plan my itinerary', plannerJump:'Itinerary planner', language:'Language', legacy:'Travel preparation library', home:'LocalTourChina home',
  },
};

function pathFor(lang,file) {
  return (lang === 'ko' ? '/' : '/'+lang+'/')+file;
}

function independentNav(html,lang) {
  const href=pathFor(lang,'independent-travel.html');
  const link=`<a data-independent-nav href="${href}">${copy[lang].label}</a>`;
  return html.replace(/<header class="home-header\b[^"]*"[^>]*>[\s\S]*?<\/header>/,header=>
    header.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g,nav=>
      nav.replace(/<a\b[^>]*data-independent-nav[^>]*>[\s\S]*?<\/a>/g,'')
        .replace(/(<a\b[^>]*href="(?:\/[^/]+\/)?consultation\.html"[^>]*>)/,link+'$1')));
}

export function addIndependentHome(html,lang,styleBase) {
  const hub = pathFor(lang,'independent-travel.html');
  const label = lang==='en'?'Independent travel guide':copy[lang].label;
  const heroLink = `<a class="ed-text-link ed-independent-link" href="${hub}">${label}<span aria-hidden="true"> ↗</span></a>`;
  const style = `<link data-independent-style rel="stylesheet" href="${styleBase}independent.css">`;
  const result = independentNav(html,lang)
    .replace(/<link[^>]*data-independent-style[^>]*>/g,'')
    .replace(/<a class="ed-text-link ed-independent-link"[^>]*>[\s\S]*?<\/a>/g,'')
    .replace(/(<p class="ed-hero-foot">[^<]*<\/p>)/,'$1'+heroLink)
    .replace('</head>',style+'</head>');
  if(!result.includes(heroLink) || (result.match(/data-independent-nav href/g)??[]).length!==2) {
    throw Error('Missing home guide entry point for '+lang);
  }
  return result;
}

export function renderIndependent({lang,home,assetBase,editorialBase,styleBase,records,cover,city=false,hasCity=false}) {
  const basic=copy[lang];
  const c=cityCopy[lang];
  const t=city?{...basic,...c,typeLabel:c.category,allTypes:c.all,results:c.foodTitle}:basic;
  const prefix=pathFor(lang,'');
  const file=city?'independent-city.html':'independent-travel.html';
  const page=prefix+file;
  const header=home.match(/<header class="home-header\b[^"]*"[^>]*>[\s\S]*?<\/header>/)?.[0]
    .replaceAll('href="#services"',`href="${prefix}#services"`)
    .replaceAll('data-independent-nav href','data-independent-nav aria-current="page" href')??'';
  const languages=Object.entries({ko:'한국어',zh:'中文',en:'English'}).map(([key,text])=>
    `<a href="${pathFor(key,file)}" hreflang="${key}"${key===lang?' aria-current="page"':''}>${text}</a>`).join('');
  const controls=(dimension,label,all,items)=>`<fieldset class="ind-filter"><legend>${label}</legend><div>
    ${[['all',all],...Object.entries(items)].map(([value,text])=>`<button type="button" data-ind-filter="${dimension}" data-value="${value}" aria-pressed="${value==='all'}">${text}</button>`).join('')}
  </div></fieldset>`;
  const cards=city?records.map(record=>renderCityCard(record,lang)).join(''):records.map(record=>{
    const title=record.title[lang];
    const foodMap=record.sourceHref?.startsWith('/food-map.html');
    const details=foodMap&&lang==='zh'?'/zh'+record.sourceHref:record.sourceHref;
    const detailsLabel=foodMap&&lang==='en'?'Details in Korean':t.source;
    const links=[
      record.map&&`<a class="ind-map" href="${esc(record.map)}">${t.map}<span aria-hidden="true"> ↗</span></a>`,
      details&&`<a href="${esc(details)}">${detailsLabel}<span aria-hidden="true"> ↗</span></a>`,
    ].filter(Boolean).join('');
    const photo=record.image?`<div class="ind-photo"><img src="${esc(record.image)}" alt="${esc(record.imageAlt[lang])}" width="600" height="400" loading="lazy" decoding="async">${record.contextual?`<span>${t.example}</span>`:''}</div>`:'';
    return `<article class="ind-card" data-ind-place data-area="${esc(record.area)}" data-type="${esc(record.category)}">
      ${photo}<div class="ind-card-body">
        <p class="ind-meta">${t.areas[record.area]} · ${t.types[record.category]}</p>
        <h3>${esc(title)}</h3>${record.nameChinese&&lang!=='zh'&&record.nameChinese!==title?`<p class="ind-local-name" lang="zh">${esc(record.nameChinese)}</p>`:''}
        <p>${esc(record.tip[lang])}</p>
        ${links?`<nav class="ind-card-links" aria-label="${esc(title)}">${links}</nav>`:''}
      </div>
    </article>`;
  }).join('');
  const hero=cover?`<img class="ind-cover" src="${esc(cover.src)}" alt="${esc(cover.alt[lang])}" width="${cover.width}" height="${cover.height}" fetchpriority="high">`:'';
  const planner='/travel-planner/'+(lang==='ko'?'':'?lang='+lang);
  return `<!doctype html><html lang="${lang==='zh'?'zh-CN':lang}" class="notebook-white">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.title} | 로투차</title>
<meta name="description" content="${esc(t.intro)}"><link rel="canonical" href="https://localtourchina.com${page}">
${['ko','zh','en'].map(locale=>`<link rel="alternate" hreflang="${locale}" href="https://localtourchina.com${pathFor(locale,file)}">`).join('')}
<link rel="icon" href="/favicon.png" type="image/png"><link rel="stylesheet" href="${assetBase}home.css"><link rel="stylesheet" href="${assetBase}brand-standard.css"><link rel="stylesheet" href="${assetBase}release.css"><link rel="stylesheet" href="${assetBase}white-notebook.css"><link rel="stylesheet" href="${editorialBase}editorial.css"><link rel="stylesheet" href="${styleBase}independent.css"><link rel="stylesheet" href="/assets/contact-modal.css">
<script defer src="${styleBase}independent.js"></script></head>
<body class="nb-home nb-warm ed-public">
<a href="#independent-results" class="skip">${t.results}</a>
${header}
<nav class="notebook-tools ind-languages" aria-label="${t.language}"><div class="notebook-languages">${languages}</div></nav>
<main class="ed-shell ind-main">
<section class="ind-hero"><div><h1>${t.title}</h1><p>${t.intro}</p>${city?`<a class="ind-plan-jump" href="${prefix}independent-travel.html">← ${c.back}</a>`:`${hasCity?`<a class="ind-plan-jump" href="${prefix}independent-city.html">${c.link} ↗</a>`:''}<a class="ind-plan-jump" href="#planner">${t.plannerJump}<span aria-hidden="true"> ↓</span></a>`}</div>${hero}</section>
<section class="ind-list" aria-labelledby="independent-results" data-independent data-count-label="${t.count}">
  <div class="ind-controls">${city?'':controls('area',t.areaLabel,t.allAreas,t.areas)}${controls('category',t.typeLabel,t.allTypes,t.types)}</div>
  <div class="ind-section-heading"><h2 id="independent-results">${t.results}</h2><p data-ind-status role="status">${records.length} ${t.count}</p></div>
  <div class="ind-grid">${cards}</div>
  <div class="ind-empty" data-ind-empty hidden><p>${t.empty}</p><button type="button" data-ind-reset>${t.reset}</button></div>
</section>
<section class="ind-planner" id="planner"><div><h2>${t.plannerTitle}</h2><p>${t.plannerText}</p></div><a class="ed-button" href="${planner}">${t.plannerAction}<span aria-hidden="true"> ↗</span></a></section>
</main><footer class="ind-footer ed-shell"><a href="${prefix}">${t.home}</a><a href="${prefix}travel-library.html">${t.legacy}</a></footer>
<script src="/assets/contact-gate.js"></script></body></html>`;
}
