// Product comparisons describe the reviewed public catalogue; they never calculate a new price.
const copy = {
  ko: {
    eyebrow: 'FIND YOUR JOURNEY', title: '같은 장가계, 우리에게 맞는 여행은?',
    intro: '대표 풍경부터 숲길, 오래된 마을의 밤까지. 무엇을 더하고 덜어낼지 비교해 보세요.',
    all: '전체 9개', core: '대표 풍경', forest: '산과 숲길', town: '고성의 밤', trek: '트레킹',
    filters: '원하는 여행 장면', filterStatus: n => `${n}개 여행을 볼 수 있어요.`,
    duration: (n,d) => `${n}박 ${d}일`, walking: '걷기', stay: '숙박', difference: '이 코스의 차이',
    detail: '일정·포함·요금 보기', select: '비교에 담기', selected: '비교 항목',
    hint: '2~3개를 골라 나란히 비교할 수 있어요.', compare: '선택한 여행 비교', clear: '선택 지우기',
    selectedStatus: n => `${n}개 선택 · 최대 3개`, maximum: '한 번에 3개까지 비교할 수 있어요. 다른 여행의 선택을 먼저 해제해 주세요.',
    minimum: '비교할 여행을 2개 이상 골라주세요.', empty: '이 조건의 여행이 없어요. 전체 여행에서 다시 골라보세요.',
    reset: '전체 여행 보기', table: '선택한 여행의 차이', scroll: '표가 넓으면 좌우로 넘겨 비교하세요.', close: '비교 닫기',
    price: '날짜·인원·객실에 따른 요금은 각 상세 페이지에서 확인해요. 항공권은 별도입니다.',
    note: '모든 코스에 도보와 계단이 있습니다. 실제 걸음, 휴식 지점과 방문 순서는 체력·항공편·운영 상황에 맞춰 확인합니다.',
    fullCatalog: '하루투어·이동·가이드도 함께 보기',
  },
  zh: {
    eyebrow: 'FIND YOUR JOURNEY', title: '同样的张家界，哪一种适合你们？',
    intro: '从代表风景、森林溪谷，到古城的夜晚，比较每条路线增加和舍去的体验。',
    all: '全部9条', core: '代表风景', forest: '山景与森林', town: '古城夜色', trek: '徒步',
    filters: '按想要的体验选择', filterStatus: n => `可查看${n}条旅行线路。`,
    duration: (n,d) => `${n}晚${d}天`, walking: '步行', stay: '住宿', difference: '这条线的区别',
    detail: '查看行程、包含与费用', select: '加入对比', selected: '对比项目',
    hint: '选择2至3条线路，可以并排比较。', compare: '比较所选线路', clear: '清空选择',
    selectedStatus: n => `已选${n}条 · 最多3条`, maximum: '一次最多比较3条，请先取消一条已选线路。',
    minimum: '请至少选择2条线路进行比较。', empty: '没有符合此条件的线路，可以返回全部旅行重新选择。',
    reset: '查看全部旅行', table: '所选线路的区别', scroll: '表格较宽时，可左右滑动比较。', close: '关闭对比',
    price: '按日期、人数和房型计算的费用，请在各详情页查看。机票另计。',
    note: '所有线路均有步行和台阶。实际步行、休息点与游览顺序，需结合体力、航班和现场运营确认。',
    fullCatalog: '同时查看一日游、交通与导游服务',
  },
  en: {
    eyebrow: 'FIND YOUR JOURNEY', title: 'The same Zhangjiajie. A journey that fits you.',
    intro: 'Landmark views, forest paths or an old town after dark. Compare what each itinerary adds and leaves out.',
    all: 'All 9 trips', core: 'Landmark views', forest: 'Peaks and forest', town: 'Old-town nights', trek: 'Trekking',
    filters: 'Choose your travel experience', filterStatus: n => `${n} itineraries to explore.`,
    duration: (n,d) => `${n} nights / ${d} days`, walking: 'Walking', stay: 'Stays', difference: 'What makes it different',
    detail: 'Itinerary, inclusions and price', select: 'Add to comparison', selected: 'Compare by',
    hint: 'Select 2–3 trips to compare them side by side.', compare: 'Compare selected trips', clear: 'Clear selection',
    selectedStatus: n => `${n} selected · maximum 3`, maximum: 'Compare up to 3 trips at a time. Remove one selection before adding another.',
    minimum: 'Select at least 2 trips to compare.', empty: 'No trips match this filter. Return to all trips to choose again.',
    reset: 'Show all trips', table: 'Compare your selected trips', scroll: 'Swipe horizontally if the table is wider than your screen.', close: 'Close comparison',
    price: 'See each detail page for prices based on dates, party size and rooms. Flights are separate.',
    note: 'Every itinerary includes walking and steps. Walking length, rest points and the final order depend on fitness, flights and operating conditions.',
    fullCatalog: 'Explore day tours, transport and guides too',
  },
};

const details = {
  '34': {
    tags: ['core'], photo: null,
    ko: ['짧은 휴가에 핵심 풍경', '천문산·원가계·천자산 중심', '전망대와 동굴·협곡의 도보·계단', '선택 호텔 3박 · 지점은 예약 전 확인', '황석채·금편계·부용진은 제외'],
    zh: ['短假期看核心风景', '以天门山、袁家界、天子山为主', '观景台、洞穴与峡谷有步行和台阶', '所选酒店3晚，门店预订前确认', '不含黄石寨、金鞭溪及芙蓉镇'],
    en: ['Core views on a short break', 'Tianmen, Yuanjiajie and Tianzi', 'Walking and steps at viewpoints, cave and canyon', '3 nights in the selected hotel; confirm the property', 'Leaves out Huangshizhai, Golden Whip Stream and Furong'],
  },
  '45': {
    tags: ['core','forest'], photo: 'photos/golden-whip-owner-real.webp',
    ko: ['산 위에서, 숲길까지', '황석채·금편계 하루를 더한 구성', '전망길과 계곡길 · 길이는 체력에 맞춰 확인', '시내 호텔 4박 · 지점·객실은 확인', '매력상서 공연 포함 · 부용진 제외'],
    zh: ['从山顶风景走到森林溪谷', '增加黄石寨与金鞭溪一天', '观景路与溪谷步道，长度按体力确认', '市区酒店4晚，门店和房型需确认', '含魅力湘西演出，不含芙蓉镇'],
    en: ['From the peaks into the forest', 'Adds a day for Huangshizhai and Golden Whip Stream', 'Viewpoint and valley walks; agree the length to suit fitness', '4 city-hotel nights; confirm property and room', 'Includes Charming Xiangxi; no Furong Town'],
  },
  'experience45': {
    tags: ['forest'], photo: 'photos/golden-whip-owner-real.webp',
    ko: ['풍경과 숲길, 쉬는 시간도', '삼림공원 이틀과 시내 커피·마사지', '금편계 구간 산책 · 계단 부담은 사전 상담', '같은 시내 호텔 4박', '공연 미포함 · 늦은 도착·늦은 귀국 기준'],
    zh: ['山景、森林，也留出休息', '森林公园两天，加市区咖啡与按摩', '金鞭溪部分步道，台阶负担需提前沟通', '同一家市区酒店4晚', '不含演出，以晚到、晚归航班为基础'],
    en: ['Peaks, forest paths and time to pause', 'Two Forest Park days, city coffee and massage', 'Part of Golden Whip Stream; discuss concerns about steps', '4 nights in the same city hotel', 'No show; based on late arrival and a late flight home'],
  },
  '45furong': {
    tags: ['core','town'], photo: 'photos/furong-riverside-evening.jpg',
    ko: ['산 풍경과 폭포 마을의 밤', '4박 5일에 부용진 야경을 넣은 구성', '산 전망길과 마을 계단 · 야경 후 늦게 복귀', '시내 호텔 4박 · 부용진 숙박 없음', '황석채·금편계 하루 대신 부용진'],
    zh: ['山景加上瀑布古镇夜色', '4晚5天安排芙蓉镇夜景', '山地观景路、古镇台阶，夜景后较晚返回', '市区酒店4晚，不住芙蓉镇', '以芙蓉镇替代黄石寨、金鞭溪一天'],
    en: ['Mountain views and waterfall lights', 'Furong Town after dark within five days', 'Mountain paths and town steps; a later return after the lights', '4 city-hotel nights; no Furong overnight', 'Uses the Huangshizhai and stream-walking day for Furong'],
  },
  '56': {
    tags: ['core','forest','town'], photo: 'photos/furong-riverside-evening.jpg',
    ko: ['산의 낮, 부용진의 밤', '황석채 뒤 호텔 휴식과 부용진 야경', '전망길·마을 계단 · 금편계 산책은 제외', '시내 호텔 5박 · 부용진 숙박 없음', '부용진은 오후 출발, 야경 후 장가계 복귀'],
    zh: ['白天看山，夜晚看芙蓉镇', '黄石寨后留酒店休息，再安排芙蓉镇夜景', '观景路和古镇台阶，不安排金鞭溪步行', '市区酒店5晚，不住芙蓉镇', '下午前往芙蓉镇，夜景后返回张家界'],
    en: ['Mountain days and Furong after dark', 'Hotel rest after Huangshizhai, then Furong after dark', 'Viewpoint paths and town steps; no Golden Whip Stream walk', '5 city-hotel nights; no Furong overnight', 'Afternoon departure to Furong; return to Zhangjiajie after dark'],
  },
  '56fh': {
    tags: ['town'], photo: null,
    ko: ['봉황고성에서 하룻밤', '장가계에서 봉황으로, 마지막 밤은 고성에서', '산 전망길과 고성 골목·강변 걷기', '장가계 숙박 후 마지막 밤 봉황 · 호텔 이동', '봉황 체크아웃 뒤 공항 직행 · 항공편 확인'],
    zh: ['在凤凰古城住一晚', '先游张家界，最后一晚留给凤凰', '山地观景路、古城街巷和河边步行', '张家界住宿后，末晚换住凤凰', '凤凰退房后直送机场，需确认航班适配'],
    en: ['Stay a night in Fenghuang', 'Zhangjiajie first, with the final night in the old town', 'Mountain viewpoints, old-town lanes and riverside walking', 'Zhangjiajie stays, then a hotel change for the final night in Fenghuang', 'Direct airport transfer after Fenghuang checkout; confirm flight fit'],
  },
  'trek34': {
    tags: ['trek','forest'], photo: 'photos/golden-whip-owner-real.webp',
    ko: ['짧은 일정에도 숲길 걷기', '황석채·금편계 트레킹을 중심에', '관광일에 연속 걷기 · 휴식·회차 지점 상담', '시내 호텔 3박 · 지점·객실은 확인', '늦은 도착형은 황룡동·대협곡 제외'],
    zh: ['短行程也留给森林徒步', '以黄石寨、金鞭溪步行为重点', '游览日连续步行，休息和折返点需沟通', '市区酒店3晚，门店和房型需确认', '晚到方案不含黄龙洞、大峡谷'],
    en: ['Forest walking on a shorter trip', 'A focus on Huangshizhai and Golden Whip Stream', 'Walking on consecutive sightseeing days; agree rests and turnarounds', '3 city-hotel nights; confirm property and room', 'Late-arrival plans omit the cave and canyon'],
  },
  'trek45': {
    tags: ['trek','forest'], photo: null,
    ko: ['칠성산까지 이어지는 걷기', '황석채·금편계에 칠성산 하루 추가', '연속 산길 일정 · 평소 걷는 정도를 먼저 상담', '시내 호텔 4박 · 지점·객실은 확인', '늦은 도착형은 황룡동·대협곡 제외'],
    zh: ['一路走到七星山', '黄石寨、金鞭溪之外增加七星山一天', '连续山地步行，先沟通平时步行能力', '市区酒店4晚，门店和房型需确认', '晚到方案不含黄龙洞、大峡谷'],
    en: ['Keep walking, all the way to Qixing Mountain', 'Adds a Qixing Mountain day to Huangshizhai and Golden Whip Stream', 'Consecutive mountain-walking days; discuss your usual activity first', '4 city-hotel nights; confirm property and room', 'Late-arrival plans omit the cave and canyon'],
  },
  'trek56': {
    tags: ['trek','town','forest'], photo: 'photos/furong-riverside-evening.jpg',
    ko: ['충분히 걷고, 부용진의 밤까지', '황석채·금편계·칠성산과 부용진', '연속 산길과 마을 계단 · 야경 뒤 늦은 복귀', '시내 호텔 5박 · 부용진 숙박 없음', '트레킹에 야경 추가 · 늦은 도착형은 동굴·협곡 제외'],
    zh: ['走进山路，也看到芙蓉镇夜色', '黄石寨、金鞭溪、七星山，再加芙蓉镇', '连续山路和古镇台阶，夜景后较晚返回', '市区酒店5晚，不住芙蓉镇', '徒步加夜景，晚到方案不含洞穴、峡谷'],
    en: ['Walk the trails, then see Furong after dark', 'Huangshizhai, Golden Whip Stream, Qixing Mountain and Furong', 'Consecutive mountain paths and town steps; a later return after dark', '5 city-hotel nights; no Furong overnight', 'Trekking plus the old-town lights; late-arrival plans omit cave and canyon'],
  },
};

const order = ['34','45','experience45','45furong','56','56fh','trek34','trek45','trek56'];
const canonical = {'34':'zhangjiajie-4days.html','56':'zhangjiajie-6days.html',experience45:'zhangjiajie.html'};
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function comparisonRecords(lang, {catalog,assetBase='/assets/notebook/bfeacd45dd7d/'} = {}) {
  const language = copy[lang] ? lang : 'ko';
  const base = assetBase.endsWith('/') ? assetBase : assetBase + '/';
  return order.map(id => {
    const record = catalog?.[id];
    if (!record || record.archived) throw new Error('Reviewed multi-day product is missing or archived: ' + id);
    const meta = details[id], [heading,focus,walking,stay,difference] = meta[language];
    const nights = Number(record.pricing?.nights);
    if (!Number.isInteger(nights) || nights < 1) throw new Error('Invalid itinerary duration: ' + id);
    const href = canonical[id] ? '/' + (language === 'ko' ? '' : language + '/') + canonical[id] : record.paths[language];
    // Existing real photos are retained. A catalogue photo is the fallback for destinations not in the notebook photo set.
    const image = meta.photo ? base + meta.photo : record.discovery?.image;
    if (!href?.startsWith('/') || !image?.startsWith('/')) throw new Error('Missing public itinerary asset: ' + id);
    return {id,tags:meta.tags,title:record.locales[language].title,heading,focus,walking,stay,difference,nights,days:nights+1,href,image};
  });
}

export function renderComparison(lang, options) {
  const language = copy[lang] ? lang : 'ko', t = copy[language], records = comparisonRecords(language,options);
  const path = (language === 'ko' ? '' : '/' + language) + '/products.html';
  const filters = ['all','core','forest','town','trek'].map(key => `<button type="button" data-trip-filter="${key}" aria-pressed="${key==='all'}">${escape(t[key])}</button>`).join('');
  const cards = records.map(r => `<li class="ed-compare-card" data-compare-trip="${r.id}" data-trip-tags="${r.tags.join(' ')}"><a class="ed-compare-detail" href="${escape(r.href)}" data-compare-detail="${r.id}"><div class="ed-compare-photo"><img src="${escape(r.image)}" alt="${escape(r.title)}" loading="lazy" decoding="async"><span>${escape(t.duration(r.nights,r.days))}</span></div><div class="ed-compare-copy"><p class="ed-compare-kicker">${escape(r.title)}</p><h3>${escape(r.heading)}</h3><p class="ed-compare-focus">${escape(r.focus)}</p><dl><div><dt>${t.walking}</dt><dd>${escape(r.walking)}</dd></div><div><dt>${t.difference}</dt><dd>${escape(r.difference)}</dd></div></dl><span class="ed-compare-detail-label">${t.detail}</span></div></a><label class="ed-compare-select"><input type="checkbox" value="${r.id}" data-compare-select><span>${t.select}</span><span class="ed-compare-sr"> · ${escape(r.title)}</span></label></li>`).join('');
  // The JSON payload contains only public presentation metadata, never inquiry/customer data.
  const data = JSON.stringify({lang:language,records,text:{...t,filterStatus:undefined,duration:undefined,selectedStatus:undefined},filterTemplate:t.filterStatus('{n}'),selectedTemplate:t.selectedStatus('{n}')}).replace(/</g,'\\u003c');
  return `<section class="ed-compare" id="all-trips" aria-labelledby="all-trips-title" data-trip-comparison><div class="ed-compare-heading"><div><p class="ed-compare-eyebrow">${t.eyebrow}</p><h2 id="all-trips-title">${t.title}</h2><p>${t.intro}</p></div><a class="ed-compare-catalog" href="${path}">${t.fullCatalog}</a></div><div class="ed-compare-toolbar"><div class="ed-compare-filters" role="group" aria-label="${t.filters}">${filters}</div><p class="ed-compare-status" data-trip-filter-status role="status" aria-live="polite">${t.filterStatus(records.length)}</p></div><p class="ed-compare-note">${t.note}</p><ul class="ed-compare-grid" data-compare-list>${cards}</ul><div class="ed-compare-empty" data-compare-empty hidden><p>${t.empty}</p><button type="button" data-trip-filter-reset>${t.reset}</button></div><div class="ed-compare-bar"><div><p>${t.hint}</p><strong data-compare-selected-status role="status" aria-live="polite">${t.selectedStatus(0)}</strong></div><div class="ed-compare-actions"><button type="button" data-compare-open disabled>${t.compare}</button><button type="button" data-compare-clear disabled>${t.clear}</button></div></div><p class="ed-compare-feedback" data-compare-feedback role="status" aria-live="polite"></p><section class="ed-compare-table-section" data-compare-table-section aria-labelledby="trip-compare-table-title" hidden><div class="ed-compare-table-heading"><h3 id="trip-compare-table-title" tabindex="-1">${t.table}</h3><button type="button" data-compare-close>${t.close}</button></div><p class="ed-compare-table-hint">${t.scroll}</p><div class="ed-compare-table-scroll" role="region" aria-label="${t.table}" tabindex="0"><table data-compare-table></table></div></section><p class="ed-compare-price-note">${t.price}</p><script type="application/json" data-trip-comparison-data>${data}</script></section>`;
}
