(() => {
  const {read, save} = window.Journey;
  let state = read();
  const key = 'experience45';
  if(new URLSearchParams(location.search).get('view')==='full')document.body.classList.add('full-view');
  const inputs = [...document.querySelectorAll('input[name="moments"]')];
  inputs.forEach(input => input.checked = (state.moments[key] || []).includes(input.value));
  function update() {
    state.moments[key] = inputs.filter(x => x.checked).map(x => x.value);
    save(state);
    const moments = state.moments[key];
    const list = document.querySelector('#chosen-list');
    list.replaceChildren(...moments.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    document.querySelector('#chosen').hidden = moments.length === 0;
    document.querySelector('#selection-count').textContent = moments.length ? `期待的体验 ${moments.length}项已选` : "带上已选体验，一起咨询";
    inputs.forEach(input => input.closest('label').querySelector('small').textContent = input.checked ? "已加入咨询 · 再点一次可取消" : "加入咨询");
  }
  inputs.forEach(input => input.addEventListener('change',update));
  document.querySelectorAll('[data-question]').forEach(button => {
    button.addEventListener('click',() => { const q = button.dataset.question; const selected = state.concerns.includes(q); state.concerns = selected ? state.concerns.filter(x => x !== q) : [...state.concerns,q]; save(state); button.setAttribute('aria-pressed',String(!selected)); button.classList.toggle('is-selected',!selected); document.querySelector('#question-status').textContent = selected ? "已移除这个问题。" : "已加入问题，可在咨询准备页面一起查看。"; });
    button.setAttribute('aria-pressed',String(state.concerns.includes(button.dataset.question)));
    button.classList.toggle('is-selected',state.concerns.includes(button.dataset.question));
  });
  document.querySelectorAll('[data-consult]').forEach(link => link.addEventListener('click',() => { const latest=read(); state={...latest,moments:{...latest.moments,[key]:inputs.filter(x=>x.checked).map(x=>x.value)}}; state.route=key; save(state); }));
  window.addEventListener('pageshow',event => { state = read(); inputs.forEach(input => input.checked = (state.moments[key] || []).includes(input.value)); document.querySelectorAll('[data-question]').forEach(button => {const selected=state.concerns.includes(button.dataset.question);button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-selected',selected);}); update(); window.Product45.mount(); });
  window.Product45.mount();
  document.addEventListener('price45:changed',()=>{state=read();});
  update();
})();
