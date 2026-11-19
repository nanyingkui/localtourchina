import {esc} from './home.mjs';

const core = ['tianmen','yuanjiajie','tianzi','cave','canyon'];
const forestWalks = ['huangshi','goldenwhip','yuanjiajie','tianzi'];
const destinations = ['tianmen','yuanjiajie','furong','fenghuang','canyon','cave','lake'];
const stay = ['rooms','breakfast','food','vehicle'];

const productScenes = {
  34: [...core,...stay],
  45: [...forestWalks,...core,...stay],
  56: ['furong','huangshi',...core,...stay],
  '56fh': ['fenghuang',...core,...stay],
  '45furong': ['furong',...core,...stay],
  experience45: ['goldenwhip','huangshi','tianmen','yuanjiajie','tianzi',...stay],
  trek34: forestWalks,
  trek45: ['qixing',...forestWalks],
  trek56: ['furong','qixing',...forestWalks],
  canyon: ['canyon','cave'],
  forest: ['yuanjiajie','tianzi','forest'],
  furong: ['furong'],
  fenghuang: ['fenghuang'],
  tianmen: ['tianmen'],
  tickets: destinations,
  'local-guide': destinations,
  'online-guide': destinations,
  'private-tour': [...destinations,...stay],
  vehicles: ['vehicle'],
  'day-charter': ['vehicle'],
  'airport-pickup': ['vehicle'],
  'airport-dropoff': ['vehicle'],
  'station-transfer': ['vehicle'],
  'vehicles:furong-transfer': ['vehicle'],
  'vehicles:changsha-transfer': ['vehicle'],
  'vehicles:fenghuang-transfer': ['vehicle'],
};

const pageScenes = {
  'trips.html': destinations,
  'zhangjiajie-4days.html': productScenes[34],
  'zhangjiajie.html': productScenes.experience45,
  'zhangjiajie-6days.html': productScenes[56],
  'airport-transfer.html': productScenes.vehicles,
  'day-charter.html': productScenes['day-charter'],
  'korean-guide.html': productScenes['local-guide'],
  'travel-library.html': destinations,
  'travel-help.html': ['tianmen','goldenwhip','vehicle'],
  'travel-care.html': ['goldenwhip','food','vehicle','rooms','breakfast'],
};

const labels = {
  ko: {scenes:'여행 사진',vehicles:'차량 참고 사진',more:'사진 더 보기',open:'사진 크게 보기',scope:'사진 속 서비스는 참고용입니다. 실제 이용 조건은 예약 확인 내용에 따릅니다.'},
  zh: {scenes:'旅行实景',vehicles:'车辆参考照片',more:'查看更多照片',open:'查看大图',scope:'照片中的服务安排供参考，实际以预订确认为准。'},
  en: {scenes:'Travel photos',vehicles:'Vehicle reference photos',more:'More photos',open:'View full-size photo',scope:'Service photos are examples. Check your booking confirmation for the actual arrangements.'},
};

export function renderArchiveGallery(name,lang,photos,productId,used=new Set()) {
  const page = name.replace(/^(?:zh|en)\//,'');
  const groups = [...new Set(pageScenes[page] ?? productScenes[productId] ?? [])];
  const sets = groups.map(key=>({key,images:(photos[key] ?? []).filter(image=>!used.has(image.src))}));
  const items = new Map();
  const limit = 12;
  const maxGroupSize = Math.max(0,...sets.map(set=>set.images.length));

  // Show different places or service details before additional photos of the same scene.
  for(let index=0; index<maxGroupSize && items.size<limit; index++){
    for(const {key,images} of sets){
      const item = images[index];
      if(!item?.src || !item.alt?.[lang]) continue;
      if(!items.has(item.src)) items.set(item.src,{...item,key});
      if(items.size===limit) break;
    }
  }
  if(!items.size) return '';

  const label = labels[lang];
  const title = groups.length===1 && groups[0]==='vehicle' ? label.vehicles : label.scenes;
  const selected = [...items.values()];
  const scope = selected.some(item=>stay.includes(item.key)) ? `<p class="ed-archive-scope">${label.scope}</p>` : '';
  const links = selected.map(({src,alt,width,height})=>{
    const caption = alt[lang];
    return `<a href="${esc(src)}" aria-label="${esc(label.open+' · '+caption)}"><img src="${esc(src)}" alt="${esc(caption)}" width="${esc(width)}" height="${esc(height)}" loading="lazy" decoding="async"></a>`;
  });
  const grid = items=>`<div class="ed-archive-grid">${items.join('')}</div>`;
  const more = links.length>3 ? `<details><summary>${label.more} (${links.length-3})</summary>${grid(links.slice(3))}</details>` : '';
  return `<section class="ed-archive-gallery" aria-labelledby="ed-archive-title"><h2 id="ed-archive-title">${title}</h2>${scope}${grid(links.slice(0,3))}${more}</section>`;
}

const scenePages = new Set(['zhangjiajie-4days.html','zhangjiajie.html','zhangjiajie-6days.html']);
const servicePages = new Set(['airport-transfer.html','day-charter.html']);
const scenesByImage = {
  'tianmen-cave.webp':['tianmen','tianmen-21'],
  'huangshiview.webp':['huangshi','huangshi-10'],
  'cliff-privacy.png':['tianmen','tianmen-13'],
  'underground-clean.png':['cave','cave-08'],
  'glasswalk-privacy.png':['canyon','canyon-05'],
  'canyon.webp':['canyon','canyon-11'],
  'route-furong-daytime.webp':['furong','furong-07'],
  'furong-riverside-evening.jpg':['furong','furong-10'],
  'hotel-orange-breakfast.webp':['breakfast','breakfast-05'],
};

export function placeNotebookPhotos(html,name,lang,photos) {
  const page=name.replace(/^(?:zh|en)\//,'');
  const substitutions=scenePages.has(page)?scenesByImage:servicePages.has(page)
    ? {'vehicle-nine-exterior.jpg':['vehicle','vehicle-11']} : null;
  if(!substitutions) return html;
  const label=labels[lang];
  const origin={ko:'로투차 사진 자료',zh:'罗途查照片档案',en:'LocalTourChina photo archive'}[lang];
  const used=new Set();
  return html.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/g,figure=>{
    const match=figure.match(/(<button\b[^>]*\bdata-(?:scene-photo|media-photo|photo)(?=\s|=|>)[^>]*>[\s\S]*?)<img\b[^>]*\bsrc="\/assets\/notebook\/[0-9a-f]+\/photos\/([^"]+)"[^>]*>/);
    if(!match) return figure;
    const [scene,id]=substitutions[match[2]]??[];
    const image=photos[scene]?.find(item=>item.src.startsWith('/assets/archive-photos/'+id+'-'));
    if(!image||used.has(image.src)) return figure;
    used.add(image.src);
    const alt=esc(image.alt[lang]);
    const credit=scene==='breakfast'||scene==='vehicle'?origin+' · '+label.scope:origin;
    const button=match[1].replace(/<button\b[^>]*>/,tag=>{
      const clean=tag.replace(/\s(?:aria-label|data-credit|data-source|data-archive-scene)="[^"]*"/g,'');
      return clean.slice(0,-1)+` aria-label="${esc(label.open)} · ${alt}" data-archive-scene="" data-credit="${esc(credit)}" data-source="">`;
    });
    const photo=`<img src="${esc(image.src)}" alt="${alt}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">`;
    return figure.replace(match[0],()=>button+photo).replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/,
      scene==='breakfast'||scene==='vehicle'?'<figcaption>'+alt+'</figcaption>':'');
  });
}
