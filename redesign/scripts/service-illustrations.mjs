/** Presentation only: replace the existing hero on two service routes.
 * Keep all original heading, progress, inquiry and calculator content unchanged.
 * Artwork is explicitly AI-labelled; it is never a guide, guest or vehicle photo.
 */
const routes = {
  'private-tour.html': { kind: 'planning', asset: 'trip-planning', panel: 'private', target: 'privateModeChooser', width: 1672, height: 940 },
  'vehicles.html': { kind: 'airport', asset: 'airport-welcome', panel: 'vehicle', target: 'vehicleService', width: 1672, height: 941 }
};
const copy = {
  ko: { label: 'AI 브랜드 일러스트', planning: '여행을 계획하는 주황 모자 브랜드 캐릭터의 AI 일러스트', airport: '공항에서 맞이하는 주황 모자 브랜드 캐릭터의 AI 일러스트', planningAction: '여행 일정 선택하기', airportAction: '차량 비용 확인하기' },
  zh: { label: 'AI 品牌插画', planning: '橙帽品牌角色规划行程的 AI 插画', airport: '橙帽品牌角色在机场迎接旅客的 AI 插画', planningAction: '选择旅行行程', airportAction: '查看车辆费用' },
  en: { label: 'AI brand illustration', planning: 'AI illustration of the orange-hat brand character planning a journey', airport: 'AI illustration of the orange-hat brand character at an airport welcome', planningAction: 'Choose your itinerary', airportAction: 'Check vehicle options' }
};

export function decorateServiceIllustrationHtml(source, { filename = '', locale = '', version = '' } = {}) {
  const route = routes[filename];
  if (!route || /data-brand-illustration=/.test(source) || /id=["']root["']/.test(source)) return source;
  const lang = locale === 'zh' ? 'zh' : locale === 'en' ? 'en' : 'ko';
  const text = copy[lang];
  const prefix = locale ? '../' : '';
  const base = `${prefix}assets/brand/illustrations/${route.asset}`;
  const media = `<figure class="service-illustration-art"><img src="${base}-800.webp" srcset="${base}-480.webp 480w, ${base}-800.webp 800w, ${base}-1200.webp 1200w" sizes="(max-width:760px) 64vw, (max-width:1280px) 70vw, 880px" width="${route.width}" height="${route.height}" alt="${text[route.kind]}" decoding="async" fetchpriority="high"><figcaption>${text.label}</figcaption></figure>`;
  const wrap = content => `<div class="service-illustration-copy">${content}</div>${media}`;
  let changed = false;
  let html;
  if (lang === 'en') {
    // English has one existing service hero and already provides #inquiry CTA.
    html = source.replace(/<section class="hero" style="--hero:[^"]*"><div>([\s\S]*?)<\/div><\/section>/, (_, content) => {
      changed = true;
      return `<section class="service-illustration-hero" data-brand-illustration="${route.kind}">${wrap(content)}</section>`;
    });
  } else {
    const pattern = new RegExp(`<header class="module-head media-head ${route.panel === 'private' ? 'private' : 'vehicle'}-head">([\\s\\S]*?)<\\/header>`);
    html = source.replace(pattern, (_, content) => {
      changed = true;
      const action = `<a class="button service-illustration-action" href="#${route.target}">${text[`${route.kind}Action`]} <span aria-hidden="true">→</span></a>`;
      return `<header class="service-illustration-hero" data-brand-illustration="${route.kind}">${wrap(content + action)}</header>`;
    });
  }
  if (!changed) throw new Error(`Service illustration hero not found: ${locale || 'ko'}/${filename}`);
  const suffix = version ? `?v=${encodeURIComponent(version)}` : '';
  return html.replace('</head>', `<link rel="stylesheet" href="${prefix}assets/service-illustrations.css${suffix}"></head>`);
}
