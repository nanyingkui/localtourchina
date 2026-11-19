/** Presentation-only additions to the existing local inquiry and manual chat handoff. */
const WORDS = {
  ko: {
    eyebrow: '예약 전, 우리 조건부터',
    title: '상담에서 함께 확인할 것',
    trip: ['항공편에 맞는 일정과 걷는 정도', '호텔·객실과 포함·별도 항목', '1인 금액과 일행 전체 금액', '예약 가능 여부와 변경·취소 조건'],
    service: ['만날 날짜·장소와 서비스 범위', '인원·짐에 맞는 차량 또는 가이드', '전체 금액과 추가 비용이 생기는 조건', '예약 가능 여부와 변경·취소 조건'],
    note: '정해진 내용만 알려주세요. 상담으로 조건을 확인한 뒤, 예약 여부를 결정합니다.',
    stages: ['여행 조건 정리', '대화로 일정·비용 확인', '서면 조건 확인 후 예약 결정'],
    direct: '먼저 질문하고 싶다면, 카카오톡으로',
    pending: '아직 보내지 않은 문의입니다',
    pendingText: '내용을 복사한 뒤 카카오톡 채팅창에 붙여넣고 보내주세요. 이 화면만으로 문의가 전달되거나 예약이 확정되지는 않습니다.',
    fullText: '문의 내용 전체 · 아래에서 스크롤해 확인할 수 있어요',
    handoffTitle: '카카오톡에서 보내기까지',
    handoff: ['문의 내용을 복사하고 채널을 열어요.', '채팅창에 붙여넣고 직접 보내주세요.', '대화로 일정·금액을 확인한 다음 예약을 결정해요.'],
    fallback: '앱이 열리지 않으면 내용을 복사한 상태에서 채널을 다시 열어주세요.',
  },
  zh: {
    eyebrow: '预订之前，先确认你们的需求',
    title: '咨询时一起确认这些',
    trip: ['适配航班的行程与步行安排', '酒店、房型及包含与另付项目', '每人费用与同行人总费用', '可预订情况及更改、取消条件'],
    service: ['会面日期、地点与服务范围', '适配人数、行李的车辆或导游', '总费用及产生额外费用的条件', '可预订情况及更改、取消条件'],
    note: '先告诉我们已经确定的信息。通过沟通确认具体条件后，再决定是否预订。',
    stages: ['整理旅行需求', '沟通行程与费用', '确认书面条件后决定预订'],
    direct: '想先问个问题？通过微信联系',
    pending: '这份咨询还没有发送',
    pendingText: '复制内容后，请在微信聊天窗口粘贴并发送。停留在这个页面，不代表对方已收到咨询，也不代表预订已确认。',
    fullText: '完整咨询内容 · 可在下方滚动查看',
    handoffTitle: '还需要在聊天窗口发送',
    handoff: ['复制咨询内容，并打开联系页面。', '在微信聊天窗口粘贴并手动发送。', '沟通确认行程与费用后，再决定是否预订。'],
    fallback: '如果没有打开微信，请保留复制的内容，再打开联系页面。',
  },
  en: {
    eyebrow: 'Your plans first. Booking comes later.',
    title: 'What we will confirm together',
    trip: ['An itinerary and walking pace suited to your flights', 'Hotel, room type, inclusions and separate costs', 'The price per person and for your whole group', 'Availability and change or cancellation conditions'],
    service: ['Meeting date, location and service scope', 'A vehicle or guide suited to your group and luggage', 'The total price and when extra charges may apply', 'Availability and change or cancellation conditions'],
    note: 'Share what you already know. Discuss the details before deciding whether to book.',
    stages: ['Outline your plans', 'Discuss itinerary and costs', 'Review written terms, then decide'],
    direct: 'Have a question first? Contact us on WhatsApp',
    pending: 'This inquiry has not been sent yet',
    pendingText: 'Copy the text, paste it into your WhatsApp chat and send it yourself. Viewing this page does not deliver an inquiry or confirm a booking.',
    fullText: 'Your complete inquiry · scroll inside to review all of it',
    handoffTitle: 'Finish sending in your chat',
    handoff: ['Copy your inquiry and open the contact page.', 'Paste the text into WhatsApp and send it yourself.', 'Discuss the itinerary and price before deciding to book.'],
    fallback: 'If the app does not open, keep your copied text and reopen the contact page.',
  },
};

const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const language = lang => String(lang).startsWith('zh') ? 'zh' : String(lang).startsWith('en') ? 'en' : 'ko';
const contact = {ko:'https://pf.kakao.com/_hvrmn/chat', zh:'/zh/travel-safety.html?channel=wechat', en:'https://wa.me/821055722601'};
const block = (name, markup) => `<!-- ed-inquiry:${name}:start -->${markup}<!-- ed-inquiry:${name}:end -->`;

function intro(lang, service) {
  const words = WORDS[lang];
  const items = service ? words.service : words.trip;
  return block('intro', `<aside class="ed-inquiry-expect" aria-labelledby="ed-inquiry-expect-title"><p class="ed-inquiry-eyebrow">${escape(words.eyebrow)}</p><h2 id="ed-inquiry-expect-title">${escape(words.title)}</h2><ul>${items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul><p class="ed-inquiry-note">${escape(words.note)}</p><ol class="ed-inquiry-stages" aria-label="${escape(words.eyebrow)}">${words.stages.map(stage=>`<li>${escape(stage)}</li>`).join('')}</ol><a class="ed-inquiry-direct" data-contact href="${contact[lang]}">${escape(words.direct)}</a></aside>`);
}

function pending(lang) {
  const words = WORDS[lang];
  return block('pending', `<aside class="ed-inquiry-pending" aria-labelledby="ed-inquiry-pending-title"><p id="ed-inquiry-pending-title"><strong>${escape(words.pending)}</strong></p><p>${escape(words.pendingText)}</p></aside>`);
}

function instructions(lang) {
  const words = WORDS[lang];
  return block('handoff', `<aside class="ed-inquiry-handoff" aria-labelledby="ed-inquiry-handoff-title"><h2 id="ed-inquiry-handoff-title">${escape(words.handoffTitle)}</h2><ol>${words.handoff.map(item=>`<li>${escape(item)}</li>`).join('')}</ol><p>${escape(words.fallback)}</p></aside>`);
}

/**
 * Enhance an already generated consultation document without changing its form,
 * calculation, validation, message generation, state or contact-gate handlers.
 * Applying this function twice produces the same document.
 */
export function enhanceInquiry(html, lang = 'ko') {
  if (typeof html !== 'string') throw new TypeError('enhanceInquiry expects an HTML string');
  if (!/\bid="(?:consult-form|service-inquiry-form)"/.test(html)) return html;
  const locale = language(lang);
  const service = /\bid="service-inquiry-form"/.test(html);
  let document = html.replace(/<!-- ed-inquiry:([\w-]+):start -->[\s\S]*?<!-- ed-inquiry:\1:end -->/g, '');
  document = document.replace(/<body\b([^>]*)>/i, (whole, attributes) => {
    if (/\bclass="/.test(attributes)) return '<body' + attributes.replace(/\bclass="([^"]*)"/, (_, classes) => 'class="' + [...new Set((classes + ' ed-inquiry-page').split(/\s+/).filter(Boolean))].join(' ') + '"') + '>';
    return '<body class="ed-inquiry-page"' + attributes + '>';
  });
  const formId = service ? 'service-inquiry-form' : 'consult-form';
  const form = new RegExp('<form\\b(?=[^>]*\\bid="' + formId + '")[^>]*>');
  document = document.replace(form, match => intro(locale, service) + match);

  if (service) {
    document = document.replace(/(<section\b[^>]*\bid="service-review"[^>]*>)/, '$1' + pending(locale));
    document = document.replace(/(<textarea\b[^>]*\bid="service-message"[^>]*>)/, block('message-label', `<p class="ed-inquiry-message-label">${escape(WORDS[locale].fullText)}</p>`) + '$1');
    document = document.replace(/(<p\b[^>]*\bclass="copy-hint"[^>]*>)/, instructions(locale) + '$1');
  } else {
    document = document.replace(/(<div\b[^>]*\bclass="review-message"[^>]*>)/, pending(locale) + '$1');
    document = document.replace(/(<textarea\b[^>]*\bid="inquiry-message"[^>]*>)/, block('message-label', `<p class="ed-inquiry-message-label">${escape(WORDS[locale].fullText)}</p>`) + '$1');
    document = document.replace(/(<div\b[^>]*\bclass="review-help"[^>]*>)/, instructions(locale) + '$1');
  }
  return document;
}

