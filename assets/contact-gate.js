(() => {
  const channels = {
    kakao: 'https://pf.kakao.com/_hvrmn/chat',
    whatsapp: 'https://wa.me/821055722601',
  };
  const placements = ['home_hero', 'home_sticky', 'consult_intro', 'quote_review', 'footer', 'other'];
  function language() {
    const code = document.documentElement.lang.toLowerCase();
    return code.startsWith('zh') ? 'zh' : code.startsWith('en') ? 'en' : 'ko';
  }
  function placement(trigger) {
    const explicit = trigger?.getAttribute('data-contact-placement');
    if (placements.includes(explicit)) return explicit;
    if (trigger?.closest('#copy-open, #service-copy-open, #chat-fallback')) return 'quote_review';
    if (trigger?.closest('footer')) return 'footer';
    return 'other';
  }
  function track(name, dimensions) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, {page_language:language(), ...dimensions});
    } catch {}
  }
  function safetyUrl(channel, target) {
    const lang = language();
    const query = new URLSearchParams({ channel });
    const destination = target ? '#' + new URLSearchParams({next:target}) : '';
    return (lang === 'ko' ? '' : '/' + lang) + '/travel-safety.html?' + query + destination;
  }
  function route(value) {
    try {
      const url = new URL(value, location.href);
      if (url.protocol === 'weixin:' || url.hostname === 'weixin.qq.com' || url.hostname === 'work.weixin.qq.com') return safetyUrl('wechat');
      if (url.protocol === 'whatsapp:' || ['wa.me','api.whatsapp.com','web.whatsapp.com','www.whatsapp.com','chat.whatsapp.com'].includes(url.hostname)) {
        return safetyUrl('whatsapp', url.protocol === 'https:' ? url.href : channels.whatsapp);
      }
      if (url.protocol === 'kakaotalk:' || ['pf.kakao.com','open.kakao.com','talk.kakao.com'].includes(url.hostname)) {
        return safetyUrl('kakao', url.protocol === 'https:' ? url.href : channels.kakao);
      }
    } catch {}
    return null;
  }
  function rewrite(anchor) {
    const destination = route(anchor.getAttribute('href'));
    if (destination) anchor.setAttribute('href', destination);
  }
  function scan(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches('a[href]')) rewrite(node);
    node.querySelectorAll('a[href]').forEach(rewrite);
  }

  let dialog, frame, trigger;
  function openSafety(path, opener = document.activeElement) {
    const url = new URL(path, location.href);
    const channel = url.searchParams.get('channel');
    const ctaPlacement = placement(opener);
    url.searchParams.set('dialog','1');
    url.searchParams.set('placement', ctaPlacement);
    if (!dialog) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/assets/contact-modal.css';
      document.head.append(stylesheet);
      const labels = {ko:['여행 안전과 예약 지원 안내','닫기'],zh:['旅行安全与服务说明','关闭'],en:['Travel safety and booking support','Close']};
      const [title, close] = labels[language()];
      dialog = document.createElement('dialog');
      dialog.className = 'ltc-contact-modal';
      dialog.setAttribute('aria-label', title);
      const heading = document.createElement('header');
      heading.className = 'ltc-contact-modal-bar';
      const text = document.createElement('span');
      text.textContent = title;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = close;
      button.addEventListener('click', () => dialog.close());
      heading.append(text, button);
      frame = document.createElement('iframe');
      frame.title = title;
      dialog.append(heading, frame);
      document.body.append(dialog);
      dialog.addEventListener('close', () => {
        frame.removeAttribute('src');
        if (trigger instanceof HTMLElement) trigger.focus();
      });
    }
    trigger = opener;
    frame.src = url.href;
    if (!dialog.open) {
      dialog.showModal();
      if (['kakao', 'wechat', 'whatsapp'].includes(channel)) {
        track('ltc_contact_safety_open', {channel, cta_placement:ctaPlacement});
      }
    }
  }
  function isSafetyLink(anchor) {
    const url = new URL(anchor.href, location.href);
    return url.origin === location.origin && /^(\/(zh|en))?\/travel-safety\.html$/.test(url.pathname);
  }

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target.matches('a[href]')) rewrite(record.target);
      for (const node of record.addedNodes) scan(node);
    }
  });
  observer.observe(document.documentElement, {childList:true,subtree:true,attributes:true,attributeFilter:['href']});
  scan(document.documentElement);

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const contact = event.target.closest('[data-contact], [data-copy-contact="nanyingkui"], [data-safety-wechat]');
    if (contact) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const channel = contact.hasAttribute('data-contact')
        ? {ko:'kakao',zh:'wechat',en:'whatsapp'}[language()] : 'wechat';
      track('ltc_direct_contact_intent', {channel, cta_placement:placement(contact)});
      openSafety(safetyUrl(channel, channels[channel]), contact);
      return;
    }
    const anchor = event.target.closest('a[href]');
    if (anchor) {
      rewrite(anchor);
      if (isSafetyLink(anchor) && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        openSafety(anchor.href, anchor);
      } else if (/^\/(?:(?:zh|en)\/)?independent-(?:travel|city)\.html$/.test(location.pathname)
        && anchor.origin === location.origin
        && /^\/(?:(?:zh|en)\/)?(?:service-)?consultation\.html$/.test(anchor.pathname)) {
        track('ltc_inquiry_entry', {entrypoint:'independent_guide', product_id:'unspecified'});
      }
    }
  }, true);

  const open = window.open.bind(window);
  window.open = (url, ...options) => {
    const path = route(url);
    if (!path) return open(url, ...options);
    openSafety(path);
    return null;
  };
  window.ltcOpenContactSafety = (channel, target) => openSafety(safetyUrl(channel, target || channels[channel]));
  window.ltcContactSafetyUrl = (channel, target) => safetyUrl(channel, target || channels[channel]);
})();
