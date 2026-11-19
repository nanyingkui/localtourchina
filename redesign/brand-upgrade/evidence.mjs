import fs from 'node:fs';

// Editorial summaries are grounded in the maintained, permission-cleared public
// review archive. They are not presented as quotations or verified-booking stats.
const reviews = new Map(JSON.parse(fs.readFileSync(new URL('../../src/reviews.json', import.meta.url), 'utf8')).map(review => [review.id, review]));
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const locale = lang => String(lang).startsWith('zh') ? 'zh' : String(lang).startsWith('en') ? 'en' : 'ko';
const localPath = (lang, page) => `/${locale(lang) === 'ko' ? '' : locale(lang) + '/'}${page}`;
const asset = (base, file) => `${String(base || '/assets/notebook/bfeacd45dd7d/').replace(/\/$/, '')}/photos/${file}`;

const copy = {
  ko: {
    standards: {
      eyebrow: '로투차가 여행을 대하는 방식',
      title: '여행의 선택권은, 여행하는 사람에게.',
      intro: '잘 안내하고, 먼저 설명하고, 함께 결정합니다.',
      items: [
        ['원하지 않는 소비를 권하지 않아요', '쇼핑이나 추가 관광을 강요하지 않습니다. 구매나 추가 항목을 거절해도 약속한 안내는 그대로 이어갑니다.'],
        ['추가 비용은, 선택하기 전에', '추가 방문이나 시간 연장 등 변경이 필요하면 가능 여부와 비용을 먼저 확인하고 결정합니다.'],
        ['걷는 양과 식사부터 들어요', '계단 부담, 쉬는 시간, 먹기 어려운 재료를 미리 듣습니다. 정한 일정을 바탕으로 현장 대안을 상의해요.'],
        ['불편한 점은 로투차에 알려주세요', '가이드의 안내나 태도에 불편을 느끼면 로투차 상담 채널로 알려주세요. 상황을 확인하고 가능한 해결 방법을 함께 찾습니다.'],
      ],
      note: '날씨·관광지 운영과 예약 변경은 현장 상황 및 실제 제공업체의 조건을 확인합니다.',
    },
    evidence: {
      eyebrow: '여행자가 남긴 실제 이야기',
      title: '좋았다는 말 뒤에, 이런 시간이 있었어요.',
      intro: '어떤 여행이었고, 무엇을 함께 조율했는지 원문과 함께 읽어보세요.',
      source: '원문 읽기',
      all: '여행 이야기 더 보기',
      note: '작성자의 당시 경험을 편집 요약했습니다. 각 사례는 별도의 여행이며, 같은 일정·가이드 배정이나 무료 변경을 보장하지 않습니다. 원문은 한국어이며 Cafe 로그인·가입이 필요할 수 있어요.',
      cases: [
        {id:'128', kind:'부모님 환갑 · 데이투어', title:'원하던 명소를, 부담을 덜고.', body:'원하는 명소 중심의 데이투어와 쇼핑·선택 관광 강요가 없었던 점을 좋게 평가한 생신 여행입니다.', detail:'처음에는 작은 Cafe 규모 때문에 망설였다는 솔직한 걱정도 남겼습니다.'},
        {id:'245', kind:'부모님과 성인 자녀 · 4인 가족', title:'날씨와 식사에 맞춰 조율한 여행.', body:'짙은 운무에 맞춰 일정을 바꾸고, 식당과 메뉴를 가족에게 맞춘 경험을 소개합니다.', detail:'재방문 입장권의 추가 비용과 가이드 설명 방식에 대한 호불호도 담긴 후기입니다.'},
        {id:'212', kind:'가족 여행 · 4박 5일', title:'부용진은 더하고, 공연은 빼고.', body:'보고 싶은 야경을 위해 부용진을 더하고 공연을 빼는 등 가족의 뜻을 반영한 여행을 이야기합니다.', detail:'작성 당시 조건에서 이루어진 조정입니다. 변경 가능 여부와 비용은 예약 때 다시 확인합니다.'},
      ],
    },
    booking: {
      eyebrow: '마음이 정해지기 전, 확인할 것',
      title: '일정도, 비용도. 확인하고 결정하세요.',
      intro: '상담에서 일행의 조건을 맞추고, 예약 전에는 중요한 약속을 문서로 확인합니다.',
      steps: [
        ['정해진 것부터 알려주세요', '날짜가 아직 미정이어도 괜찮아요. 인원과 보고 싶은 풍경, 걷는 정도부터 이야기합니다.'],
        ['일정과 견적을 함께 확인해요', '호텔·객실, 포함·별도 항목과 1인 금액·일행 총액을 실제 조건으로 맞춥니다.'],
        ['예약 조건을 확인한 뒤 결정해요', '제공·수금 주체, 예약금·잔금과 변경·취소 조건을 확인하고 예약 여부를 정합니다.'],
      ],
      sampleLabel: '확인 내용 예시 · 실제 예약 문서가 아닙니다',
      sampleTitle: '예약 전 확인 목록',
      fields: [
        ['여행·일행', '날짜·항공편, 성인·어린이 인원과 이동 조건'],
        ['호텔·현장 안내', '호텔 지점·객실·침대 조건, 배정 가이드와 연락 방법'],
        ['총액·서비스 범위', '1인 금액·일행 총액, 포함·별도 항목과 추가 요금 발생 조건'],
        ['제공·결제', '계약·현지 접대·수금 주체, 예약금·잔금과 결제 방법'],
        ['변경·취소', '변경 가능 여부, 취소 기준·이미 발생한 비용과 환불 처리'],
      ],
      note: '위 항목은 무엇을 확인하는지 보여주는 예시입니다. 실제 예약은 해당 여행의 최종 안내·확인 문서를 기준으로 진행합니다.',
      action: '우리 일정으로 상담하기',
    },
    team: {
      title: '한국어 상담부터 현지 가이드 배정까지',
      body: '여행 날짜와 인원, 걷기 편한 정도를 알려주시면 동선과 쉬는 시간, 필요한 예약을 함께 확인합니다.',
      guideBody: '가이드가 포함된 일정은 날짜, 안내 언어, 동선과 요청 사항을 확인한 뒤 담당 가이드를 배정합니다.',
      imageAlt: '장가계 금편계 숲길과 계곡',
      action: '가이드 서비스와 배정 안내',
    },
  },
  zh: {
    standards: {
      eyebrow: '罗途查看待旅行的方式',
      title: '旅行的选择权，交给旅行的人。',
      intro: '认真带领，事先说明，一起决定。',
      items: [
        ['不强迫不想要的消费', '不强迫购物或增加游览项目。拒绝购买、拒绝加项后，约定的服务照常继续。'],
        ['额外费用，先确认再选择', '增加停留地点、延长服务时间等变动，先核对能否安排和相应费用，再由您决定。'],
        ['先了解步行和饮食需求', '提前听取台阶负担、休息需要和难以接受的食材，在约定行程基础上商量现场替代方案。'],
        ['遇到问题，联系罗途查', '若对导游的讲解或态度感到不适，请通过罗途查的咨询渠道联系我们。我们会了解情况，共同寻找可行的处理方式。'],
      ],
      note: '天气、景区运营及预订变更，需要按现场情况和实际服务提供方的条件确认。',
    },
    evidence: {
      eyebrow: '旅行者留下的真实经历',
      title: '一句满意背后，是这些被照顾的时刻。',
      intro: '当时是怎样的旅行，又一起调整了什么？可以结合原文了解。',
      source: '阅读原文',
      all: '查看更多旅行故事',
      note: '以下为作者当时经历的编辑摘要，各自属于不同旅行，不代表同样的行程、指定导游或免费变更承诺。原文为韩语，Cafe 可能需要登录或加入。',
      cases: [
        {id:'128', kind:'父母六十岁生日 · 一日游', title:'围绕想看的景点，减少消费压力。', body:'这趟生日旅行选择了以心仪景点为主的一日游，作者特别认可没有强迫购物或选择额外项目。', detail:'作者也坦诚记录了最初因 Cafe 规模较小而犹豫的心情。'},
        {id:'245', kind:'父母与成年子女 · 四人家庭', title:'根据天气和口味，商量着调整。', body:'作者介绍了浓雾中调整行程、为家人调整餐厅和菜单的经历。', detail:'这篇后记也保留了再次入园的额外票费，以及对导游讲解方式的不同感受。'},
        {id:'212', kind:'家庭旅行 · 四晚五天', title:'增加芙蓉镇，舍去演出。', body:'为了想看的夜景增加芙蓉镇、减少演出，作者记录了按家人意愿调整旅行的过程。', detail:'这些调整是在当时条件下完成的；能否变更及相关费用，仍需预订时重新确认。'},
      ],
    },
    booking: {
      eyebrow: '做决定前，把重要的事说清楚',
      title: '行程和费用，确认后再决定。',
      intro: '咨询时匹配同行人的需求，预订前把重要约定落实到书面确认中。',
      steps: [
        ['先说已经确定的部分', '日期未定也没关系。从人数、想看的风景和步行能力开始沟通。'],
        ['一起确认行程与报价', '按实际条件核对酒店和房型、包含与不包含、每人金额及团队总额。'],
        ['了解预订条件后再决定', '核对服务与收款主体、定金与尾款、变更和取消条件，再决定是否预订。'],
      ],
      sampleLabel: '确认内容示意 · 并非实际订单文件',
      sampleTitle: '付款前确认清单',
      fields: [
        ['行程与同行人', '日期与航班、成人与儿童人数、交通需求'],
        ['酒店与现场接待', '酒店具体分店、房型与床铺条件、导游安排及联系方法'],
        ['总额与服务范围', '每人金额、团队总额、包含与不包含、额外收费的触发条件'],
        ['服务与付款', '签约、当地接待和收款主体，定金、尾款及付款方式'],
        ['变更与取消', '能否变更、取消标准、已经发生的费用与退款处理'],
      ],
      note: '以上仅示意需要核对哪些内容。实际预订以该次旅行的最终说明及确认文件为准。',
      action: '咨询我们的行程',
    },
    team: {
      title: '旅行咨询与当地导游安排',
      body: '告诉我们出行日期、人数和步行需求，我们会一起确认游览路线、休息时间和需要预订的项目。',
      guideBody: '告诉我们需要的导游语言。我们会按日期和行程确认能否安排及费用。',
      imageAlt: '张家界金鞭溪的林间步道与溪流',
      action: '了解导游服务与安排',
    },
  },
  en: {
    standards: {
      eyebrow: 'How we approach travel',
      title: 'Your trip. Your choices.',
      intro: 'We guide carefully, explain first and decide together.',
      items: [
        ['No pressure to buy or add activities', 'Shopping and extra visits are optional. Declining a purchase or an extra does not change the service we have agreed to provide.'],
        ['Extra costs, explained before you choose', 'For an additional stop, more guide time or another change, we check what is possible and the cost before you decide.'],
        ['Walking and food needs come first', 'Tell us about stairs, rest breaks and ingredients you find difficult. We discuss practical alternatives within the agreed itinerary.'],
        ['Contact us if something goes wrong', 'If the guiding or attitude makes you uncomfortable, contact LocalTourChina through the enquiry channel. We will understand the situation and discuss workable next steps.'],
      ],
      note: 'Weather, attraction operations and booking changes remain subject to actual conditions and the service provider’s terms.',
    },
    evidence: {
      eyebrow: 'Real travellers, real experiences',
      title: 'The moments behind a good trip.',
      intro: 'See what the trip involved, what was adjusted, and what the travellers actually wrote.',
      source: 'Read the original',
      all: 'More traveller stories',
      note: 'These are edited summaries of separate trips, not promises of the same itinerary, a particular guide or free changes. Originals are in Korean; Cafe login or membership may be required.',
      cases: [
        {id:'128', kind:'A parent’s 60th birthday · day tour', title:'The sights they wanted, without sales pressure.', body:'For a birthday trip, the writer chose a day tour focused on their preferred sights and appreciated the absence of pressure to shop or add activities.', detail:'The account also admits an initial hesitation about the Cafe’s small membership.'},
        {id:'245', kind:'Parents and adult children · four travellers', title:'Adjusting the day, and what was on the table.', body:'This family describes itinerary changes in heavy mist, alongside adjustments to restaurants and dishes.', detail:'The review also discusses extra admission costs for a repeat visit and differing views on the guide’s explanation style.'},
        {id:'212', kind:'Family trip · four nights, five days', title:'Adding Furong, leaving out a show.', body:'The writer describes adding the night views of Furong and removing a performance to reflect the family’s preferences.', detail:'Those changes were possible under that trip’s conditions. Availability and costs must be checked again when booking.'},
      ],
    },
    booking: {
      eyebrow: 'Before you make your decision',
      title: 'Know the plan. Understand the price.',
      intro: 'We discuss your group’s needs first, then put the important booking details in writing.',
      steps: [
        ['Start with what you know', 'Dates can still be undecided. Tell us your group size, the scenery you want to see and your walking preferences.'],
        ['Review the itinerary and quote', 'Check the hotel and room, inclusions and exclusions, per-person price and group total for your actual requirements.'],
        ['Decide after checking the terms', 'Confirm who provides and collects payment for the services, deposits and balances, and change and cancellation conditions.'],
      ],
      sampleLabel: 'Illustrative checklist · not an actual booking document',
      sampleTitle: 'Before-payment checklist',
      fields: [
        ['Trip and travellers', 'Dates and flights, adult and child numbers, and transport requirements'],
        ['Hotel and local support', 'The exact hotel, room and bed arrangements, guide assignment and contact method'],
        ['Total and service scope', 'Per-person price and group total, inclusions, exclusions and what triggers an extra charge'],
        ['Providers and payment', 'Contracting, local reception and payment recipients; deposit, balance and payment method'],
        ['Changes and cancellation', 'What can be changed, cancellation terms, costs already incurred and refund handling'],
      ],
      note: 'This shows the information to check. An actual reservation follows the final information and confirmation documents for that trip.',
      action: 'Discuss our trip',
    },
    team: {
      title: 'Travel advice and local guide arrangements',
      body: 'Tell us your travel dates, group size and walking needs. We’ll help work out the route, rest stops and what needs booking.',
      guideBody: 'Tell us your preferred guide language. We’ll check availability and cost for your dates and itinerary.',
      imageAlt: 'A forest path beside Golden Whip Stream in Zhangjiajie',
      action: 'Guide services and assignment',
    },
  },
};

function heading(eyebrow, title, intro = '') {
  return `<div class="ed-section-head"><p class="ed-eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2>${intro ? `<p class="ed-section-intro">${esc(intro)}</p>` : ''}</div>`;
}

export function renderStandards(lang = 'ko') {
  const text = copy[locale(lang)].standards;
  return `<section class="ed-standards ed-section" id="service-standards" aria-labelledby="ed-standards-title">${heading(text.eyebrow, text.title, text.intro).replace('<h2>', '<h2 id="ed-standards-title">')}<ol class="ed-standard-list">${text.items.map(([title, body]) => `<li><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join('')}</ol><p class="ed-section-note">${esc(text.note)}</p></section>`;
}

export function renderEvidence(lang = 'ko', {assetBase} = {}) {
  const text = copy[locale(lang)].evidence;
  // assetBase is intentionally accepted for the shared renderer contract. Case
  // summaries do not reuse unrelated guest photographs as if they were evidence.
  void assetBase;
  const cases = text.cases.map(item => {
    const review = reviews.get(item.id);
    if (!review || review.kind !== 'review' || review.classification !== 'guest_travel_story') throw new Error(`Missing public traveller story: ${item.id}`);
    return `<article class="ed-case" data-review-id="${esc(item.id)}"><p class="ed-case-kind">${esc(item.kind)}</p><h3>${esc(item.title)}</h3><p class="ed-case-body">${esc(item.body)}</p><p class="ed-case-context">${esc(item.detail)}</p><div class="ed-case-source"><time datetime="${esc(review.publishedAt)}">${esc(review.publishedAt.replaceAll('-', '.'))}</time><a href="${esc(review.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(text.source)}</a></div></article>`;
  }).join('');
  return `<section class="ed-evidence ed-section" id="real-stories" aria-labelledby="ed-evidence-title">${heading(text.eyebrow, text.title, text.intro).replace('<h2>', '<h2 id="ed-evidence-title">')}<div class="ed-case-grid">${cases}</div><div class="ed-evidence-foot"><p class="ed-section-note">${esc(text.note)}</p><a class="ed-text-link" href="${localPath(lang, 'reviews.html')}">${esc(text.all)}</a></div></section>`;
}

export function renderBooking(lang = 'ko') {
  const text = copy[locale(lang)].booking;
  return `<section class="ed-booking ed-section" id="before-booking" aria-labelledby="ed-booking-title">${heading(text.eyebrow, text.title, text.intro).replace('<h2>', '<h2 id="ed-booking-title">')}<div class="ed-booking-layout"><div class="ed-booking-process"><ol class="ed-booking-steps">${text.steps.map(([title, body]) => `<li><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join('')}</ol><a class="ed-button" href="${localPath(lang, 'consultation.html')}?trip=custom">${esc(text.action)}</a></div><div class="ed-confirmation-sample"><p class="ed-sample-label">${esc(text.sampleLabel)}</p><details class="ed-confirmation-details"><summary>${esc(text.sampleTitle)}</summary><dl>${text.fields.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p class="ed-section-note">${esc(text.note)}</p></details></div></div></section>`;
}

export function renderTeam(lang = 'ko', {assetBase} = {}) {
  const text = copy[locale(lang)].team;
  const guide = localPath(lang, lang === 'ko' ? 'korean-guide.html' : 'local-guide.html');
  return `<section class="ed-team ed-section" id="people" aria-labelledby="ed-team-title">
    <div class="ed-section-head"><h2 id="ed-team-title">${esc(text.title)}</h2></div>
    <div class="ed-team-layout">
      <div class="ed-team-copy"><p>${esc(text.body)}</p><p>${esc(text.guideBody)}</p><a class="ed-text-link" href="${guide}">${esc(text.action)}</a></div>
      <figure class="ed-team-photo"><img src="${esc(asset(assetBase, 'golden-whip-owner-real.webp'))}" alt="${esc(text.imageAlt)}" width="1672" height="1115" loading="lazy" decoding="async"></figure>
    </div>
  </section>`;
}
