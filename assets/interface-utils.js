(() => {
  let toastTimer;
  const buttonStates = new WeakMap();
  const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  const copyLabels = () => {
    const lang = document.documentElement.lang;
    if (lang.startsWith('zh')) return {success:'内容已复制。请粘贴到需要的位置。', failure:'复制失败，请手动复制已选中的内容。', button:'已复制', pending:'正在复制…', manual:'可手动复制的内容'};
    if (lang.startsWith('en')) return {success:'Copied. Paste it where needed.', failure:'Could not copy. Copy the selected text manually.', button:'Copied', pending:'Copying…', manual:'Text to copy manually'};
    return {success:'내용이 복사되었습니다. 필요한 곳에 붙여넣어 주세요.', failure:'복사하지 못했습니다. 선택된 내용을 직접 복사해 주세요.', button:'복사 완료', pending:'복사 중…', manual:'직접 복사할 내용'};
  };
  async function copyText(text, source = null, button = null) {
    const labels = copyLabels();
    let state, request;
    if (button) {
      state = buttonStates.get(button);
      if (!state) {
        const status = document.createElement('span');
        status.className = 'copy-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.setAttribute('aria-atomic', 'true');
        status.style.cssText = 'display:block;grid-column:1 / -1;order:99;flex-basis:100%;font-size:14px;line-height:1.5;margin-top:8px';
        button.insertAdjacentElement('afterend', status);
        state = {label:button.textContent, status, sequence:0, timer:null, manual:null};
        buttonStates.set(button, state);
      }
      if (button.textContent !== labels.pending && button.textContent !== labels.button) {
        state.label = button.textContent;
      }
      request = ++state.sequence;
      clearTimeout(state.timer);
      button.textContent = labels.pending;
      button.setAttribute('aria-busy', 'true');
      button.classList.remove('copy-success');
    }
    let copied = false;
    const previousFocus = document.activeElement;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      if (state && request !== state.sequence) return false;
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
    // An older pending attempt must not overwrite the latest button feedback.
    if (state && request !== state.sequence) return copied;
    const feedback = copied ? labels.success : labels.failure;
    if (state) {
      state.status.textContent = feedback;
      state.status.dataset.copyResult = copied ? 'success' : 'error';
      button.removeAttribute('aria-busy');
      button.textContent = copied ? labels.button : state.label;
      button.classList.toggle('copy-success', copied);
      if (copied) {
        state.manual?.remove();
        state.manual = null;
        state.timer = setTimeout(() => {
          if (request !== state.sequence) return;
          if (button.textContent === labels.button) button.textContent = state.label;
          button.classList.remove('copy-success');
        }, 2500);
      }
    }
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = feedback;
      // The persistent nearby status is the accessible announcement when present.
      if (state) toast.setAttribute('aria-hidden', 'true');
      else toast.removeAttribute?.('aria-hidden');
      clearTimeout(toastTimer);
      toast.classList.add('show');
      toastTimer = setTimeout(() => toast.classList.remove('show'), copied ? 2500 : 6000);
    }
    if (!copied) {
      if (!source || !source.getClientRects().length) {
        source = [...document.querySelectorAll('textarea.inquiry, textarea.message')].find(el => el.value === text && el.getClientRects().length);
      }
      if (!source) {
        source = state?.manual || document.createElement('textarea');
        source.value = text;
        source.readOnly = true;
        source.className = 'copy-manual';
        source.setAttribute('aria-label', labels.manual);
        source.style.cssText = 'display:block;grid-column:1 / -1;order:100;box-sizing:border-box;width:100%;min-height:80px;margin-top:8px;padding:12px;font:inherit';
        if (state) {
          state.status.insertAdjacentElement('afterend', source);
          state.manual = source;
        } else document.body.append(source);
      }
      source.focus();
      source.select();
    }
    return copied;
  }
  const imageDimensions = src => {
    const dimensions = window.LTCImageSizes?.[src.replace(/^\.\.\//, '')];
    return dimensions ? `width="${dimensions[0]}" height="${dimensions[1]}"` : '';
  };
  window.LTCInterface = {scrollBehavior, copyText, imageDimensions};
})();
