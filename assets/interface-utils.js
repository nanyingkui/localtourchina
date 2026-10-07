(() => {
  let toastTimer;
  const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  async function copyText(text, source) {
    let copied = false;
    const previousFocus = document.activeElement;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(area);
      try {
        area.select();
        copied = document.execCommand('copy') === true;
      } catch {
        copied = false;
      } finally {
        area.remove();
        previousFocus?.focus({preventScroll:true});
      }
    }
    const zh = document.documentElement.lang.startsWith('zh');
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = copied
        ? (zh ? '咨询内容已复制。' : '문의 내용이 복사되었습니다.')
        : (zh ? '复制失败，请手动复制咨询内容。' : '복사하지 못했습니다. 문의 내용을 직접 복사해 주세요.');
      clearTimeout(toastTimer);
      toast.classList.add('show');
      toastTimer = setTimeout(() => toast.classList.remove('show'), copied ? 2500 : 6000);
    }
    if (!copied) {
      source ||= [...document.querySelectorAll('textarea.inquiry')].find(el => el.value === text && el.getClientRects().length);
      if (source) {
        source.focus();
        source.select();
      }
    }
    return copied;
  }
  const imageDimensions = src => {
    const dimensions = window.LTCImageSizes?.[src.replace(/^\.\.\//, '')];
    return dimensions ? `width="${dimensions[0]}" height="${dimensions[1]}"` : '';
  };
  window.LTCInterface = {scrollBehavior, copyText, imageDimensions};
})();
