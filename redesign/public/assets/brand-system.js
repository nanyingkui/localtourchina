/* Shared brand presentation. No booking, network, pricing, or submission behavior is modified. */
(() => {
  'use strict';
  if (window.__LTC_BRAND_SYSTEM__) return;
  window.__LTC_BRAND_SYSTEM__ = true;
  const language = document.documentElement.lang.toLowerCase();
  const lang = language.startsWith('zh') ? 'zh' : language.startsWith('en') ? 'en' : 'ko';
  const copy = {
    ko: { name:'로투차', home:'로투차 홈', menu:'메뉴', close:'닫기', local:'현지에서, 더 가까이.', services:'여행 서비스', footer:'중국 여행, 현지의 시선으로.', tickets:'입장권', vehicles:'전용차량', guide:'현지 가이드', day:'하루 투어', custom:'맞춤 여행', support:'온라인 지원', company:'회사 소개', reviews:'여행 후기', prep:'여행 준비', privacy:'개인정보 안내' },
    zh: { name:'罗途查', home:'罗途查首页', menu:'菜单', close:'关闭', local:'旅行，更懂当地。', services:'旅行服务', footer:'从当地视角，发现中国。', tickets:'景区门票', vehicles:'专车接送', guide:'当地导游', day:'一日游', custom:'定制旅行', support:'在线支持', company:'公司介绍', reviews:'旅行评价', prep:'出行准备', privacy:'隐私说明' },
    en: { name:'LocalTour China', home:'LocalTour China home', menu:'Menu', close:'Close', local:'A little closer to local.', services:'Travel services', footer:'China, through a local lens.', tickets:'Tickets', vehicles:'Vehicles', guide:'Local guide', day:'Day tours', custom:'Private tours', support:'Online support', company:'Company', reviews:'Reviews', prep:'Travel guide', privacy:'Privacy information' }
  }[lang];

  const enhance=()=>{
    if(document.getElementById('root') || document.body.dataset.brandSystem!=='true')return;
    document.body.classList.add('ltc-brand-page');
    const page=location.pathname.split('/').pop()||'index.html';
    const locale=lang==='ko'?'':`/${lang}`;
    const home=lang==='ko'?'/':`/?lang=${lang}`;
    const route=name=>`${locale}/${name}`;
    const iconPaths={
      ticket:'<path d="M5 8h22v6a3 3 0 0 0 0 6v5H5v-5a3 3 0 0 0 0-6V8Z"/><path class="brand-icon-accent" d="M21 11v2m0 4v2m0 3v1"/>',
      vehicle:'<path d="m7 12 3-6h12l3 6M5 13h22v11H5V13Zm3 11v3m16-3v3"/><path class="brand-icon-accent" d="M9 18h3m8 0h3M10 9h12"/>',
      guide:'<circle cx="13" cy="10" r="4"/><path d="M5 26v-3a8 8 0 0 1 16 0v3M24 26V5"/><path class="brand-icon-accent" d="m24 5 6 3-6 3"/>',
      day:'<path d="m3 26 8-12 6 8 4-6 8 10H3Z"/><circle class="brand-icon-accent" cx="23" cy="8" r="4"/><path d="m8 18 3 2 2-2"/>',
      custom:'<path d="M6 7h20M6 16h20M6 25h20"/><circle class="brand-icon-accent" cx="12" cy="7" r="3" fill="white"/><circle cx="22" cy="16" r="3" fill="white"/><circle class="brand-icon-accent" cx="10" cy="25" r="3" fill="white"/>',
      support:'<path d="M5 16v-2a11 11 0 0 1 22 0v6a6 6 0 0 1-6 6h-3"/><rect x="3" y="14" width="5" height="9" rx="2"/><rect x="24" y="14" width="5" height="9" rx="2"/><path class="brand-icon-accent" d="M13 14h6m-6 4h4M16 26h3"/>'
    };
    const icon=kind=>`<svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[kind]}</svg>`;
    const mark=()=>`<span class="brand-avatar"><img src="/assets/brand/orange-hat-portrait.png" width="44" height="44" alt="" decoding="async"></span><span class="brand-wordmark"><strong>${copy.name}</strong><span>${lang==='en'?'LOCAL KNOWLEDGE · CHINA':'LOCALTOUR CHINA'}</span></span>`;
    let header=document.querySelector('.topbar,.site-header');
    if(!header){
      header=document.querySelector('body>header:not(.hero),.status-head');
      if(!header){header=document.createElement('header');document.body.prepend(header);}
      header.classList.add('brand-simple-header');
    }
    header.classList.add('brand-header');
    let logo=header.querySelector('.topbar-brand,.brand,.brand-home');
    if(!logo){logo=document.createElement('a');header.prepend(logo);}
    logo.classList.add('brand-home');logo.href=home;logo.setAttribute('aria-label',copy.home);logo.innerHTML=mark();
    if(!header.querySelector('.language-switch')){
      const langs=document.createElement('nav');langs.className='language-switch';langs.setAttribute('aria-label','Language');
      for(const [key,label]of [['ko','KO'],['en','EN'],['zh','中文']]){
        const a=document.createElement('a');a.textContent=label;a.lang=key==='zh'?'zh-CN':key;
        a.href=(key==='ko'?'':`/${key}`)+'/'+(page==='flights.html'&&key==='en'?'travel-info.html':page==='food-map.html'&&key==='en'?'travel-info.html':page==='booking.html'&&key==='en'?'multi-booking.html':page);
        if(key===lang){a.className='active';a.setAttribute('aria-current','page');}langs.append(a);
      }
      // Reviews already have language links. Keep one language selector, preserving all content below.
      if(page==='reviews.html')header.querySelector('nav')?.remove();
      header.append(langs);
    }
    const serviceRoutes=[['custom','private-tour.html',copy.custom],['ticket','tickets.html',copy.tickets],['vehicle','vehicles.html',copy.vehicles],['guide','local-guide.html',copy.guide],['day','day-tours.html',copy.day],['support','online-guide.html',copy.support]];
    const rail=document.createElement('nav');rail.className='brand-service-rail';rail.setAttribute('aria-label',copy.services);
    for(const [kind,name,label]of serviceRoutes){const a=document.createElement('a');a.href=route(name);a.innerHTML=icon(kind);const text=document.createElement('span');text.textContent=label;a.append(text);if(name===page){a.classList.add('is-current');a.setAttribute('aria-current','page');}rail.append(a);}
    header.after(rail);
    const serviceKind={'tickets.html':'ticket','vehicles.html':'vehicle','local-guide.html':'guide','day-tours.html':'day','private-tour.html':'custom','online-guide.html':'support','multi-booking.html':'custom','booking.html':'custom'}[page];
    if(serviceKind){
      const livePanel=document.querySelector('.service-panel:not([hidden])');
      const title=livePanel?.querySelector('h1,h2')||document.querySelector('main h1');
      if(title){const badge=document.createElement('span');badge.className='brand-heading-icon';badge.innerHTML=icon(serviceKind);title.before(badge);title.parentElement.classList.add('brand-section-heading');}
    }
    // Keep canonical service links on the current host and preserve language.
    document.querySelectorAll('a[href]').forEach(a=>{
      const raw=a.getAttribute('href');
      if(/^https?:\/\/(?:www\.)?localtourchina\.com(?:\/|$)/i.test(raw)){const u=new URL(raw);a.href=u.pathname+u.search+u.hash;}
      else if(/^(?:\.\/)?index\.html(?:[#?]|$)/.test(raw)){const tail=raw.slice(raw.indexOf('index.html')+10);a.href=home+(tail.startsWith('?')&&home.includes('?')?'&'+tail.slice(1):tail);}
    });
    document.querySelectorAll('.mobile-nav-toggle,.redesign-menu').forEach(button=>{
      const menu=document.getElementById(button.getAttribute('aria-controls'));
      if(!menu)return;
      button.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){button.click();button.focus();}});
      menu.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){button.click();button.focus();}});
    });
    let footer=document.querySelector('footer');
    if(!footer){footer=document.createElement('footer');document.body.append(footer);}
    footer.classList.add('brand-footer');
    const footerTop=document.createElement('div');footerTop.className='brand-footer-top';
    const title=document.createElement('div');title.innerHTML=`<strong class="brand-footer-name"><span aria-hidden="true"></span>${copy.name}</strong><p>${copy.footer}</p>`;
    const nav=document.createElement('nav');nav.setAttribute('aria-label',copy.services);
    for(const [name,label]of [['private-tour.html',copy.custom],['reviews.html',copy.reviews],['travel-info.html',copy.prep],['company.html',copy.company],['privacy.html',copy.privacy]]){const a=document.createElement('a');a.href=route(name);a.textContent=label;nav.append(a);}
    footerTop.append(title,nav);footer.prepend(footerTop);
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content='#11223D';
    const measure=()=>document.documentElement.style.setProperty('--sticky-header-height',getComputedStyle(header).position==='sticky'?Math.ceil(header.getBoundingClientRect().height)+'px':'0px');
    measure();if(window.ResizeObserver)new ResizeObserver(measure).observe(header);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
