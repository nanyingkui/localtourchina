(() => {
  const list = document.querySelector('[data-independent]');
  if (!list) return;
  const buttons = [...list.querySelectorAll('[data-ind-filter]')];
  const places = [...list.querySelectorAll('[data-ind-place]')];
  const status = list.querySelector('[data-ind-status]');
  const empty = list.querySelector('[data-ind-empty]');
  const selection = {area:'all',category:'all'};

  function render() {
    let count = 0;
    for (const place of places) {
      const inArea = selection.area === 'all' || place.dataset.area === selection.area;
      const inCategory = selection.category === 'all' || place.dataset.type === selection.category;
      place.hidden = !inArea || !inCategory;
      if (!place.hidden) count++;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(selection[button.dataset.indFilter] === button.dataset.value));
    }
    status.textContent = count+' '+list.dataset.countLabel;
    empty.hidden = count !== 0;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      selection[button.dataset.indFilter] = button.dataset.value;
      render();
    });
  }
  list.querySelector('[data-ind-reset]').addEventListener('click', () => {
    selection.area = selection.category = 'all';
    render();
    buttons[0].focus();
  });
})();
