(() => {
  const params = new URLSearchParams(location.search);
  const checkbox = document.querySelector('#agree');
  const button = document.querySelector('#continue');
  const confirm = document.querySelector('.confirm');
  const language = document.documentElement.lang;
  const names = {kakao:'KakaoTalk',wechat: language === 'ko' ? '위챗' : language === 'zh' ? '微信' : 'WeChat',whatsapp:'WhatsApp'};
  const allowed = {
    kakao:['pf.kakao.com','open.kakao.com','talk.kakao.com','kakao.com','www.kakao.com'],
    whatsapp:['wa.me','api.whatsapp.com','web.whatsapp.com','www.whatsapp.com','chat.whatsapp.com'],
  };
  let target;
  try {
    const value = new URL(new URLSearchParams(location.hash.slice(1)).get('next') || params.get('next'));
    if (value.protocol === 'https:' && !value.username && !value.password) target = value;
  } catch {}
  const channel = params.get('channel') || Object.keys(allowed).find(name=>allowed[name].includes(target?.hostname));
  if (channel !== 'wechat' && !allowed[channel]?.includes(target?.hostname)) {
    confirm.hidden = true;
    return;
  }
  const name = names[channel];
  button.textContent = language === 'zh' ? '同意并继续使用 ' + name :
    language === 'en' ? 'Agree and continue to ' + name : '동의하고 ' + name + ' 상담 계속하기';
  checkbox.checked = false;
  button.disabled = true;
  document.querySelector('#wechat-contact').hidden = true;
  checkbox.addEventListener('change', () => {
    button.disabled = !checkbox.checked;
    if (!checkbox.checked) document.querySelector('#wechat-contact').hidden = true;
  });
  button.addEventListener('click', () => {
    if (!checkbox.checked) return;
    if (channel !== 'wechat') {
      location.assign(target.href);
      return;
    }
    const contact = document.querySelector('#wechat-contact');
    contact.hidden = false;
    contact.focus();
  });
  document.querySelector('#copy-wechat').addEventListener('click', async () => {
    if (!checkbox.checked) return;
    try { await navigator.clipboard.writeText('nanyingkui'); }
    catch { document.querySelector('#wechat-id').select(); }
    document.querySelector('#wechat-id').focus();
  });
})();
