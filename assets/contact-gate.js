(() => {
  const channels = {
    kakao: 'https://pf.kakao.com/_hvrmn/chat',
    whatsapp: 'https://wa.me/821055722601',
  };
  function language() {
    const code = document.documentElement.lang.toLowerCase();
    return code.startsWith('zh') ? 'zh' : code.startsWith('en') ? 'en' : 'ko';
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
      location.assign(safetyUrl(channel, channels[channel]));
      return;
    }
    const anchor = event.target.closest('a[href]');
    if (anchor) rewrite(anchor);
  }, true);

  const open = window.open.bind(window);
  window.open = (url, ...options) => open(route(url) || url, ...options);
  window.ltcContactSafetyUrl = (channel, target) => safetyUrl(channel, target || channels[channel]);
})();
