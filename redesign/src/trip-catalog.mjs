/**
 * LocalTour's independently written Zhangjiajie catalog. Reference prices require a final quotation.
 * Factual provenance: official package pages listed below, checked 2026-10-09.
 * The 30 price points below are the verified adult package reference prices plus
 * exactly one KRW 80,000 addition per adult, per complete package, never per day.
 * Official source pages: pandatour.co.kr/theme/pandatour_v2/html/business/
 * 01.php, 02.php, 03.php, 01t.php, 02t.php, 03t.php (each ?cate=1).
 * Source hotels, booking terms, discounts, brand assets and affiliation claims
 * are deliberately not carried over. Hotel substitutions have not been costed.
 */

export const PARTY_TIERS = Object.freeze([2, 4, 6, 8, 10]);
export const CATALOG_LANGUAGES = Object.freeze(['ko', 'zh', 'en']);
export const catalogLanguage = lang => CATALOG_LANGUAGES.includes(lang) ? lang : 'ko';

export const catalogCopy = {
  ko: {
    kicker: 'LocalTour · 장가계 여행', title: '여행 일수부터 골라 보세요.',
    intro: '산과 호수, 오래된 마을까지. 마음에 드는 코스를 고른 뒤 날짜와 인원에 맞는 견적을 확인하세요.',
    regularTitle: '장가계를 만나는 기본 코스',
    regularIntro: '대표 명소를 중심으로 구성한 여행입니다. 코스별 걷는 거리도 함께 확인해 주세요.',
    trekkingTitle: '걷는 여행을 좋아한다면',
    trekkingIntro: '장거리 도보와 계단이 포함된 고강도 트레킹 코스입니다. 일행 모두의 체력과 보행 가능 여부를 먼저 확인하세요.',
    regularBadge: '대표 명소', trekkingBadge: '고강도 트레킹',
    party: '함께 여행하는 성인 인원', pax: n => `${n}명`, custom: '다른 인원', customLabel: '실제 여행 인원',
    customHelp: '1–30명까지 입력할 수 있습니다. 홀수·1인·11인 이상 및 아동 동반은 별도 견적입니다.',
    reference: '조건부 참고가', unit: '성인 1인 · 전체 일정', quote: '별도 견적',
    basis: '성인 2인 1실 · 비성수기 기준',
    priceNote: '확정 판매가가 아닙니다. 날짜·호텔·객실·예약 가능 여부 확인 후 최종 견적을 안내합니다.',
    includedLabel: '견적에 구성하는 항목',
    included: '호텔 숙박 · 인원에 맞춘 차량 · 현지 가이드 · 표시된 관광 일정',
    excludedLabel: '불포함', excluded: '항공권 · 비자 · 여행자보험',
    inclusionNote: '입장권·체험·식사별 포함 범위는 최종 견적서에서 확인해 주세요.',
    details: '일별 일정 보기', day: n => `${n}일차`,
    itineraryNote: '일정 예시입니다. 항공편·계절·날씨·입장권·교통 상황에 따라 순서와 진행 여부가 달라질 수 있습니다.',
    action: '이 코스로 견적 문의',
    termsTitle: '예약 전에 함께 확인해요',
    hotelTitle: '숙소 선택',
    hotels: '머큐어(Mercure/美居) · 오렌지(Orange/桔子) · 홈 인 셀렉티드(Home Inn Selected/如家精选) 중 희망 브랜드를 알려 주세요. 실제 지점·객실·예약 가능 여부와 차액은 견적 시 확인합니다.',
    vehicleTitle: '이동과 식사',
    vehicle: '차량은 실제 인원과 수하물에 맞춰 배정하며 특정 브랜드나 차종을 확약하지 않습니다.',
    meals: '식사 횟수와 구성은 항공편·동선에 따라 달라집니다. 점심은 간편식으로 진행될 수 있습니다.',
    quoteTitle: '별도 확인이 필요한 조건',
    seasons: '춘절, 5월 1–5일, 7–8월, 10월 1–7일 등 성수기는 별도 견적입니다.',
    special: '아동 동반, 1인실, 홀수 인원과 일정 변경은 별도 문의해 주세요. 참고가만으로 예약이 확정되지 않습니다.',
    selection: '선택 코스', partyLine: '여행 인원', itineraryLabel: '일정 예시', walkingLabel: '도보 안내',
  },
  zh: {
    kicker: 'LocalTour · 张家界之旅', title: '从旅行天数开始选择。',
    intro: '山峰、溪谷与古镇。先找到喜欢的路线，再按日期和人数确认专属报价。',
    regularTitle: '初见张家界的经典路线',
    regularIntro: '以代表景点串联行程。请同时留意各条路线的步行距离。',
    trekkingTitle: '喜欢徒步，就走得更深入',
    trekkingIntro: '高强度徒步路线，包含长距离步行与阶梯。请先确认每位同行者的体力和步行能力。',
    regularBadge: '经典景点', trekkingBadge: '高强度徒步',
    party: '同行成人人数', pax: n => `${n}人`, custom: '其他人数', customLabel: '实际出行人数',
    customHelp: '可填写1–30人。奇数人数、单人、11人以上及携儿童出行需另行报价。',
    reference: '附条件参考价', unit: '每位成人 · 全程', quote: '单独报价',
    basis: '成人双人入住一间 · 非旺季',
    priceNote: '此价格并非确认售价。日期、酒店、房型及余位核实后提供最终报价。',
    includedLabel: '报价拟包含',
    included: '酒店住宿 · 按人数安排的车辆 · 当地导游 · 所列游览行程',
    excludedLabel: '不含', excluded: '机票 · 签证 · 旅行保险',
    inclusionNote: '各项门票、体验与餐食的包含范围以最终报价单确认为准。',
    details: '查看每日行程', day: n => `第${n}天`,
    itineraryNote: '以下为参考行程。顺序及能否安排会受航班、季节、天气、门票和交通情况影响。',
    action: '咨询这条路线',
    termsTitle: '预订前，一起确认这些细节',
    hotelTitle: '住宿选择',
    hotels: '可提出美居（Mercure）、桔子（Orange）或如家精选（Home Inn Selected）的品牌偏好。具体门店、房型、余房及差价在报价时确认。',
    vehicleTitle: '交通与用餐',
    vehicle: '根据实际出行人数和行李安排车辆，不承诺特定品牌或车型。',
    meals: '用餐次数和安排取决于航班与路线，午餐可能为简餐。',
    quoteTitle: '需要单独确认的条件',
    seasons: '春节、5月1–5日、7–8月、10月1–7日等旺季需另行报价。',
    special: '儿童、单人房、奇数人数及路线调整请单独咨询。参考价格不代表预订已确认。',
    selection: '所选路线', partyLine: '出行人数', itineraryLabel: '参考行程', walkingLabel: '步行提示',
  },
  en: {
    kicker: 'LocalTour · Zhangjiajie', title: 'Start with your time away.',
    intro: 'Mountain peaks, quiet valleys and old towns. Choose a route, then check a quote for your dates and party.',
    regularTitle: 'The classic Zhangjiajie routes',
    regularIntro: 'Journeys connecting the region’s landmark sights. Check the walking notes for each route before choosing.',
    trekkingTitle: 'For those who love to walk',
    trekkingIntro: 'Strenuous routes with long walks and many steps. Check that everyone in your party is comfortable with the physical demands.',
    regularBadge: 'Classic sights', trekkingBadge: 'Strenuous trekking',
    party: 'Adults travelling together', pax: n => `${n} adults`, custom: 'Other size', customLabel: 'Actual party size',
    customHelp: 'Enter 1–30 guests. Odd-numbered parties, solo travel, 11+ guests and children need a separate quote.',
    reference: 'Conditional guide price', unit: 'per adult · entire package', quote: 'Quote required',
    basis: 'Two adults sharing a room · off-peak',
    priceNote: 'This is not a confirmed sale price. Final pricing follows checks of dates, hotel, room type and availability.',
    includedLabel: 'Proposed package scope',
    included: 'Hotel stay · vehicle suited to party size · local guide · listed sightseeing route',
    excludedLabel: 'Excluded', excluded: 'Flights · visas · travel insurance',
    inclusionNote: 'Confirm individual admissions, activities and meal inclusions in the final quotation.',
    details: 'View the day-by-day route', day: n => `Day ${n}`,
    itineraryNote: 'Sample itinerary. Order and availability may change with flights, season, weather, tickets and traffic.',
    action: 'Ask about this route',
    termsTitle: 'A few details to confirm together',
    hotelTitle: 'Your hotel preference',
    hotels: 'Choose a preferred brand: Mercure, Orange or Home Inn Selected. The actual branch, room type, availability and any price difference will be confirmed with your quote.',
    vehicleTitle: 'Getting around and meals',
    vehicle: 'Vehicles are matched to actual party size and luggage. No particular vehicle brand or model is guaranteed.',
    meals: 'Meal counts and arrangements depend on flights and routing; lunch may be a light meal.',
    quoteTitle: 'When a separate quote is needed',
    seasons: 'Peak dates, including Lunar New Year, May 1–5, July–August and October 1–7, require a separate quote.',
    special: 'Ask about children, single rooms, odd-numbered parties and route changes. A guide price does not confirm a booking.',
    selection: 'Selected route', partyLine: 'Party size', itineraryLabel: 'Sample itinerary', walkingLabel: 'Walking note',
  },
};

const content = (tagline, highlights, walking, itinerary) => ({ tagline, highlights, walking, itinerary });
const photo = (name, width, height, ko, zh, en) => ({
  src: `/assets/media/attractions/${name}-jpg-960.webp`,
  srcSet: [320, 640, 960].map(size => `/assets/media/attractions/${name}-jpg-${size}.webp ${size}w`).join(', '),
  width, height, alt: { ko, zh, en },
});
const prices = values => values.map((priceKRW, i) => ({ pax: PARTY_TIERS[i], priceKRW }));

export const tripCatalog = [
  {
    id: 'regular34', kind: 'regular', nights: 3, days: 4,
    names: { ko: '장가계 핵심 3박 4일', zh: '张家界精华 · 4天3晚', en: 'Zhangjiajie Essentials · 4 days, 3 nights' },
    prices: prices([970000, 870000, 840000, 820000, 800000]),
    image: photo('tianmen-cliff', 960, 1280, '천문산 절벽을 따라 이어지는 길', '沿天门山峭壁延伸的栈道', 'A walkway along the cliffs of Tianmen Mountain'),
    copy: {
      ko: content('짧은 휴가에 담는 장가계의 대표 풍경.', ['천문산', '원가계·천자산', '대협곡·황룡동굴'], '관광지 안에서 걷는 구간과 계단이 있습니다. 보행이 불편한 일행이 있다면 상담 시 알려 주세요.', ['공항에서 만나 대협곡을 둘러본 뒤 숙소로 이동합니다.', '천문산과 황룡동굴을 방문하고 지역 공연을 관람합니다.', '십리화랑, 백룡엘리베이터, 원가계와 천자산을 둘러본 뒤 80분 마사지를 진행합니다.', '항공 시간에 맞춰 자유시간 후 공항으로 이동합니다.']),
      zh: content('用一次短假，走进张家界的代表风景。', ['天门山', '袁家界·天子山', '大峡谷·黄龙洞'], '景区内有步行和台阶。如同行者行动不便，请在咨询时说明。', ['机场会合，游览大峡谷后前往酒店。', '游览天门山、黄龙洞，观看当地演出。', '游览十里画廊，乘百龙天梯前往袁家界、天子山，随后安排80分钟按摩。', '按航班时间安排自由活动后送往机场。']),
      en: content('A short escape through Zhangjiajie’s signature scenery.', ['Tianmen Mountain', 'Yuanjiajie & Tianzi Mountain', 'Grand Canyon & Huanglong Cave'], 'Sightseeing includes walking and steps. Tell us about any mobility needs before choosing this route.', ['Meet at the airport, visit the Grand Canyon and continue to the hotel.', 'Visit Tianmen Mountain and Huanglong Cave, followed by a local performance.', 'Explore Ten-Mile Gallery, take the Bailong Elevator to Yuanjiajie and Tianzi Mountain, then enjoy an 80-minute massage.', 'Free time as flight timings allow, followed by an airport transfer.']),
    },
  },
  {
    id: 'regular45', kind: 'regular', nights: 4, days: 5,
    names: { ko: '장가계 산과 호수 4박 5일', zh: '张家界山水 · 5天4晚', en: 'Zhangjiajie Peaks & Water · 5 days, 4 nights' },
    prices: prices([1130000, 970000, 950000, 930000, 910000]),
    image: photo('golden-whip', 960, 720, '숲을 따라 흐르는 금편계곡', '林间的金鞭溪', 'Golden Whip Stream beneath the forest'),
    copy: {
      ko: content('대표 명소에 계곡 길과 호수 풍경을 더해요.', ['천문산·원가계', '금편계곡', '보봉호수'], '금편계곡 약 7.5km, 약 3시간 도보가 포함됩니다. 도보량이 적은 코스는 아닙니다.', ['공항에서 만나 대협곡을 둘러봅니다.', '천문산과 황룡동굴을 방문하고 지역 공연을 관람합니다.', '십리화랑, 원가계와 천자산을 둘러본 뒤 마사지를 진행합니다.', '금편계곡 약 7.5km를 약 3시간 걷고 보봉호수를 방문합니다.', '항공 시간에 맞춰 자유시간 후 공항으로 이동합니다.']),
      zh: content('在经典景点之外，多留一天给溪谷与湖光。', ['天门山·袁家界', '金鞭溪', '宝峰湖'], '包含金鞭溪约7.5公里、约3小时步行，并非低步行量路线。', ['机场会合，游览大峡谷。', '游览天门山、黄龙洞，观看当地演出。', '游览十里画廊、袁家界、天子山，随后安排按摩。', '沿金鞭溪步行约7.5公里、约3小时，游览宝峰湖。', '按航班时间安排自由活动后送往机场。']),
      en: content('Add a valley walk and lakeside scenery to the landmark sights.', ['Tianmen Mountain & Yuanjiajie', 'Golden Whip Stream', 'Baofeng Lake'], 'Includes about 7.5 km / 3 hours of walking at Golden Whip Stream. This is not a low-walking route.', ['Meet at the airport and visit the Grand Canyon.', 'Visit Tianmen Mountain and Huanglong Cave, followed by a local performance.', 'Explore Ten-Mile Gallery, Yuanjiajie and Tianzi Mountain, followed by a massage.', 'Walk about 7.5 km / 3 hours along Golden Whip Stream and visit Baofeng Lake.', 'Free time as flight timings allow, followed by an airport transfer.']),
    },
  },
  {
    id: 'regular56', kind: 'regular', nights: 5, days: 6,
    names: { ko: '장가계와 부용진 5박 6일', zh: '张家界与芙蓉镇 · 6天5晚', en: 'Zhangjiajie & Furong Town · 6 days, 5 nights' },
    prices: prices([1360000, 1130000, 1110000, 1090000, 1060000]),
    image: photo('furong-town', 960, 720, '폭포 위에 자리한 부용진', '瀑布之上的芙蓉镇', 'Furong Town above its waterfall'),
    copy: {
      ko: content('장가계의 산수부터 폭포 곁 고진의 야경까지.', ['장가계 대표 명소', '칠성산', '부용진 야경'], '금편계곡 약 7.5km, 약 3시간 도보에 더해, 5일차에는 칠성산과 부용진 관광이 이어집니다. 추가 도보량은 확정 동선에 따라 달라지며, 도보량이 적은 코스는 아닙니다.', ['공항에서 만나 대협곡을 둘러봅니다.', '천문산과 황룡동굴을 방문하고 지역 공연을 관람합니다.', '십리화랑, 원가계와 천자산을 둘러본 뒤 마사지를 진행합니다.', '금편계곡 약 7.5km를 약 3시간 걷고 보봉호수를 방문합니다.', '칠성산을 둘러보고 부용진의 폭포와 야경을 감상합니다.', '항공 시간에 맞춰 자유시간 후 공항으로 이동합니다.']),
      zh: content('从张家界山水，走到瀑布古镇的夜色。', ['张家界经典景点', '七星山', '芙蓉镇夜景'], '除金鞭溪约7.5公里、约3小时步行外，第5天还安排七星山与芙蓉镇游览。额外步行量取决于最终确认的游览路线，并非低步行量路线。', ['机场会合，游览大峡谷。', '游览天门山、黄龙洞，观看当地演出。', '游览十里画廊、袁家界、天子山，随后安排按摩。', '沿金鞭溪步行约7.5公里、约3小时，游览宝峰湖。', '游览七星山，欣赏芙蓉镇瀑布与夜景。', '按航班时间安排自由活动后送往机场。']),
      en: content('From mountain scenery to an old town glowing beside a waterfall.', ['Zhangjiajie landmarks', 'Qixing Mountain', 'Furong Town at night'], 'Includes about 7.5 km / 3 hours of walking at Golden Whip Stream, plus sightseeing at Qixing Mountain and Furong Town on day 5. Additional walking depends on the confirmed route. This is not a low-walking route.', ['Meet at the airport and visit the Grand Canyon.', 'Visit Tianmen Mountain and Huanglong Cave, followed by a local performance.', 'Explore Ten-Mile Gallery, Yuanjiajie and Tianzi Mountain, followed by a massage.', 'Walk about 7.5 km / 3 hours along Golden Whip Stream and visit Baofeng Lake.', 'Visit Qixing Mountain and see the waterfall and evening lights of Furong Town.', 'Free time as flight timings allow, followed by an airport transfer.']),
    },
  },
  {
    id: 'trek34', kind: 'trekking', nights: 3, days: 4,
    names: { ko: '장가계 트레킹 3박 4일', zh: '张家界徒步 · 4天3晚', en: 'Zhangjiajie Trek · 4 days, 3 nights' },
    prices: prices([1070000, 970000, 940000, 920000, 900000]),
    image: photo('forest-east', 960, 798, '장가계의 숲과 바위 봉우리', '张家界的森林与石峰', 'Forested sandstone peaks in Zhangjiajie'),
    copy: {
      ko: content('짧지만 밀도 높은, 걷는 사람을 위한 코스.', ['황석채 도보 하산', '금편계곡 7.5km', '천문산 999계단'], '고강도 도보 코스입니다. 대협곡 3.5km, 십리화랑 2.5km, 금편계곡 7.5km와 천문산 999계단이 포함됩니다.', ['공항에서 만나 대협곡에서 약 3.5km 걷는 구간을 둘러봅니다.', '백룡엘리베이터, 원가계, 천자산을 방문하고 십리화랑에서 편도 모노레일과 2.5km 도보를 진행합니다. 마사지와 72기루 방문이 이어집니다.', '황석채는 케이블카로 올라 걸어서 내려옵니다. 금편계곡 7.5km와 천문산 999계단, 지역 공연을 진행하는 일정입니다.', '황룡동굴을 방문한 뒤 항공 시간에 맞춰 공항으로 이동합니다.']),
      zh: content('节奏紧凑，适合愿意深入行走的旅人。', ['黄石寨步行下山', '金鞭溪7.5公里', '天门山999级台阶'], '高强度徒步，包含大峡谷3.5公里、十里画廊2.5公里、金鞭溪7.5公里及天门山999级台阶。', ['机场会合，游览大峡谷，包含约3.5公里步行。', '乘百龙天梯，游览袁家界、天子山；十里画廊安排单程小火车与2.5公里步行，随后按摩并游览七十二奇楼。', '黄石寨乘索道上山、步行下山；安排金鞭溪7.5公里步行、天门山999级台阶及当地演出。', '游览黄龙洞，按航班时间送往机场。']),
      en: content('A compact, demanding route for keen walkers.', ['Walk down Huangshizhai', 'Golden Whip Stream: 7.5 km', 'Tianmen’s 999 steps'], 'Strenuous walking: 3.5 km in the Grand Canyon, 2.5 km at Ten-Mile Gallery, 7.5 km at Golden Whip Stream and Tianmen’s 999 steps.', ['Meet at the airport and explore the Grand Canyon, including about 3.5 km on foot.', 'Take the Bailong Elevator, visit Yuanjiajie and Tianzi Mountain, then combine a one-way sightseeing train and 2.5 km walk at Ten-Mile Gallery. Continue with a massage and the 72 Wonder Tower.', 'Take the cable car up Huangshizhai and walk down. The sample day also includes 7.5 km at Golden Whip Stream, Tianmen’s 999 steps and a local performance.', 'Visit Huanglong Cave, then transfer to the airport for your flight.']),
    },
  },
  {
    id: 'trek45', kind: 'trekking', nights: 4, days: 5,
    names: { ko: '장가계 능선 트레킹 4박 5일', zh: '张家界山径徒步 · 5天4晚', en: 'Zhangjiajie Mountain Trails · 5 days, 4 nights' },
    prices: prices([1230000, 1070000, 1050000, 1030000, 1010000]),
    image: photo('tianmen-cave', 960, 1707, '천문산 천문동으로 이어지는 계단', '通往天门洞的阶梯', 'The steps leading up to Tianmen Cave'),
    copy: {
      ko: content('요자채 산길을 더해 장가계를 깊이 걸어요.', ['요자채 왕복 트레킹', '황석채·공중전원', '천문산 999계단'], '고강도 도보 코스입니다. 요자채 왕복 약 5시간 트레킹, 황석채 도보 하산과 천문산 999계단이 포함됩니다.', ['공항에서 만나 대협곡을 둘러봅니다.', '칠성산과 요자채 왕복 약 5시간 트레킹을 진행한 뒤 마사지와 지역 공연을 즐깁니다.', '황석채는 케이블카로 올라 걸어서 내려옵니다. 백룡엘리베이터, 원가계, 공중전원과 천자산을 방문합니다.', '황룡동굴, 천문산 999계단과 72기루를 둘러봅니다.', '항공 시간에 맞춰 자유시간 후 공항으로 이동합니다.']),
      zh: content('加入鹞子寨山径，深入张家界的山林。', ['鹞子寨往返徒步', '黄石寨·空中田园', '天门山999级台阶'], '高强度徒步，包含鹞子寨往返约5小时徒步、黄石寨步行下山及天门山999级台阶。', ['机场会合，游览大峡谷。', '游览七星山，安排鹞子寨往返约5小时徒步，随后按摩并观看当地演出。', '黄石寨乘索道上山、步行下山，再乘百龙天梯游览袁家界、空中田园和天子山。', '游览黄龙洞、天门山999级台阶及七十二奇楼。', '按航班时间安排自由活动后送往机场。']),
      en: content('Go deeper into the mountains on Yaozizhai’s trails.', ['Yaozizhai round-trip hike', 'Huangshizhai & Sky Garden', 'Tianmen’s 999 steps'], 'Strenuous: a roughly 5-hour round-trip hike at Yaozizhai, the walk down Huangshizhai and Tianmen’s 999 steps.', ['Meet at the airport and visit the Grand Canyon.', 'Visit Qixing Mountain and hike the roughly 5-hour round trip at Yaozizhai, followed by a massage and local performance.', 'Take the cable car up Huangshizhai and walk down. Continue via the Bailong Elevator to Yuanjiajie, the Sky Garden and Tianzi Mountain.', 'Visit Huanglong Cave, Tianmen’s 999 steps and the 72 Wonder Tower.', 'Free time as flight timings allow, followed by an airport transfer.']),
    },
  },
  {
    id: 'trek56', kind: 'trekking', nights: 5, days: 6,
    names: { ko: '장가계 트레킹과 부용진 5박 6일', zh: '张家界徒步与芙蓉镇 · 6天5晚', en: 'Zhangjiajie Trails & Furong · 6 days, 5 nights' },
    prices: prices([1460000, 1230000, 1210000, 1190000, 1160000]),
    image: photo('golden-whip', 960, 720, '금편계곡 숲길과 계곡', '金鞭溪林间步道与溪谷', 'The wooded trail beside Golden Whip Stream'),
    copy: {
      ko: content('긴 산길과 계곡, 고진의 밤을 한 여행에.', ['요자채·양가계', '금편계곡 7.5km', '부용진 야경'], '고강도 도보 코스입니다. 요자채 왕복 약 5시간, 금편계곡 7.5km, 십리화랑 2.5km와 천문산 999계단이 포함됩니다.', ['공항에서 만나 대협곡을 방문하고 지역 공연을 관람합니다.', '칠성산과 요자채 왕복 약 5시간 트레킹을 진행한 뒤 마사지를 즐깁니다.', '황석채는 케이블카로 올라 걸어서 내려옵니다. 금편계곡 7.5km 도보 후 부용진 야경을 감상합니다.', '황룡동굴, 천문산 999계단과 72기루를 둘러봅니다.', '백룡엘리베이터, 원가계, 양가계와 천자산을 방문합니다. 십리화랑 편도 모노레일과 2.5km 도보, 마사지가 이어집니다.', '항공 시간에 맞춰 자유시간 후 공항으로 이동합니다.']),
      zh: content('把山径、溪谷与古镇夜色串成一次旅行。', ['鹞子寨·杨家界', '金鞭溪7.5公里', '芙蓉镇夜景'], '高强度徒步，包含鹞子寨往返约5小时、金鞭溪7.5公里、十里画廊2.5公里及天门山999级台阶。', ['机场会合，游览大峡谷并观看当地演出。', '游览七星山，安排鹞子寨往返约5小时徒步，随后按摩。', '黄石寨乘索道上山、步行下山，沿金鞭溪步行7.5公里后欣赏芙蓉镇夜景。', '游览黄龙洞、天门山999级台阶及七十二奇楼。', '乘百龙天梯，游览袁家界、杨家界、天子山；十里画廊安排单程小火车与2.5公里步行，随后按摩。', '按航班时间安排自由活动后送往机场。']),
      en: content('Mountain trails, valley walks and an evening in the old town.', ['Yaozizhai & Yangjiajie', 'Golden Whip Stream: 7.5 km', 'Furong Town at night'], 'Strenuous: roughly 5 hours at Yaozizhai, 7.5 km at Golden Whip Stream, 2.5 km at Ten-Mile Gallery and Tianmen’s 999 steps.', ['Meet at the airport, visit the Grand Canyon and watch a local performance.', 'Visit Qixing Mountain and hike the roughly 5-hour Yaozizhai round trip, followed by a massage.', 'Take the cable car up Huangshizhai and walk down. Walk 7.5 km at Golden Whip Stream, then see Furong Town’s evening lights.', 'Visit Huanglong Cave, Tianmen’s 999 steps and the 72 Wonder Tower.', 'Take the Bailong Elevator and visit Yuanjiajie, Yangjiajie and Tianzi Mountain. Combine a one-way sightseeing train with a 2.5 km walk at Ten-Mile Gallery, followed by a massage.', 'Free time as flight timings allow, followed by an airport transfer.']),
    },
  },
];

export const catalog = tripCatalog;
export const findTrip = id => tripCatalog.find(product => product.id === id) ?? null;
const resolveTrip = product => typeof product === 'string' ? findTrip(product) : product;
export const packageTitle = (product, lang = 'ko') => resolveTrip(product)?.names[catalogLanguage(lang)] ?? '';
export const validPartySize = value => {
  if (typeof value !== 'number' && typeof value !== 'string') return false;
  if (typeof value === 'string' && !/^\d+$/.test(value)) return false;
  const pax = Number(value);
  return Number.isSafeInteger(pax) && pax >= 1 && pax <= 30;
};

/** Restore only the explicitly selected card when returning from consultation. */
export function partyFromSearch(product, search = '') {
  const trip = resolveTrip(product);
  const params = new URLSearchParams(search);
  const pax = params.get('pax');
  return trip && params.get('product') === trip.id && validPartySize(pax) ? Number(pax) : 4;
}

/** Exact verified tiers only. Never interpolate, round, or multiply per-day. */
export function getTripPrice(product, pax) {
  if (!validPartySize(pax)) return null;
  return resolveTrip(product)?.prices.find(tier => tier.pax === Number(pax))?.priceKRW ?? null;
}

export function formatTripPrice(priceKRW, lang = 'ko') {
  if (!Number.isFinite(priceKRW)) return catalogCopy[catalogLanguage(lang)].quote;
  const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(priceKRW);
  return lang === 'ko' ? `${amount}원` : `KRW ${amount}`;
}

export function tripDuration(product, lang = 'ko') {
  const trip = resolveTrip(product);
  if (!trip) return '';
  if (catalogLanguage(lang) === 'zh') return `${trip.days}天${trip.nights}晚`;
  if (catalogLanguage(lang) === 'en') return `${trip.days} days · ${trip.nights} nights`;
  return `${trip.nights}박 ${trip.days}일`;
}

/** Full customer-facing handoff text; no competitor attribution or private source metadata. */
export function catalogInquiry(product, pax, lang = 'ko') {
  const trip = resolveTrip(product);
  if (!trip) return '';
  const language = catalogLanguage(lang);
  const t = catalogCopy[language];
  const c = trip.copy[language];
  const price = getTripPrice(trip, pax);
  return [
    `LocalTour | ${t.selection}: ${packageTitle(trip, language)}`,
    `${t.partyLine}: ${validPartySize(pax) ? t.pax(Number(pax)) : t.quote}`,
    `${t.reference}: ${formatTripPrice(price, language)}${price === null ? '' : ` / ${t.unit}`}`,
    t.basis, t.priceNote,
    `${t.walkingLabel}: ${c.walking}`,
    `${t.includedLabel}: ${t.included}`, t.inclusionNote,
    `${t.excludedLabel}: ${t.excluded}`,
    `${t.hotelTitle}: ${t.hotels}`, t.vehicle, t.meals, t.seasons, t.special,
    `${t.itineraryLabel}:`,
    ...c.itinerary.map((day, index) => `${t.day(index + 1)}: ${day}`),
    t.itineraryNote,
  ].join('\n');
}
