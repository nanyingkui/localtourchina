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
    document.querySelector('#selection-count').textContent = moments.length ? `Moments to look forward to ${moments.length} saved` : "Ask about your saved moments";
    inputs.forEach(input => input.closest('label').querySelector('small').textContent = input.checked ? "Saved for your inquiry · tap again to remove" : "Save for my inquiry");
  }
  inputs.forEach(input => input.addEventListener('change',update));
  document.querySelectorAll('[data-question]').forEach(button => {
    button.addEventListener('click',() => { const q = button.dataset.question; const selected = state.concerns.includes(q); state.concerns = selected ? state.concerns.filter(x => x !== q) : [...state.concerns,q]; save(state); button.setAttribute('aria-pressed',String(!selected)); button.classList.toggle('is-selected',!selected); document.querySelector('#question-status').textContent = selected ? "Question removed." : "Question saved. You can review it when preparing your inquiry."; });
    button.setAttribute('aria-pressed',String(state.concerns.includes(button.dataset.question)));
    button.classList.toggle('is-selected',state.concerns.includes(button.dataset.question));
  });
  document.querySelectorAll('[data-consult]').forEach(link => link.addEventListener('click',() => { const latest=read(); state={...latest,moments:{...latest.moments,[key]:inputs.filter(x=>x.checked).map(x=>x.value)}}; state.route=key; save(state); }));
  window.addEventListener('pageshow',event => { state = read(); inputs.forEach(input => input.checked = (state.moments[key] || []).includes(input.value)); document.querySelectorAll('[data-question]').forEach(button => {const selected=state.concerns.includes(button.dataset.question);button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-selected',selected);}); update(); window.Product45.mount(); });
  window.Product45.mount();
  document.addEventListener('price45:changed',()=>{state=read();});
  update();
})();
