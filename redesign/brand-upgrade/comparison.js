(() => {
  'use strict';
  document.querySelectorAll('[data-trip-comparison]').forEach(section => {
    if (section.dataset.comparisonReady === 'true') return;
    const payload = section.querySelector('[data-trip-comparison-data]');
    if (!payload) return;
    let data;
    try { data = JSON.parse(payload.textContent); } catch { return; }
    const {records,text:t} = data;
    const byId = new Map(records.map(record => [record.id,record]));
    const selected = new Set();
    const cards = [...section.querySelectorAll('[data-compare-trip]')];
    const checks = [...section.querySelectorAll('[data-compare-select]')];
    const filterButtons = [...section.querySelectorAll('[data-trip-filter]')];
    const filterStatus = section.querySelector('[data-trip-filter-status]');
    const selectedStatus = section.querySelector('[data-compare-selected-status]');
    const open = section.querySelector('[data-compare-open]');
    const clear = section.querySelector('[data-compare-clear]');
    const feedback = section.querySelector('[data-compare-feedback]');
    const tableSection = section.querySelector('[data-compare-table-section]');
    const table = section.querySelector('[data-compare-table]');
    const heading = section.querySelector('#trip-compare-table-title');
    const empty = section.querySelector('[data-compare-empty]');
    const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const duration = record => data.lang === 'ko' ? `${record.nights}박 ${record.days}일` : data.lang === 'zh' ? `${record.nights}晚${record.days}天` : `${record.nights} nights / ${record.days} days`;

    function filter(key, updateURL = false) {
      if (!filterButtons.some(button => button.dataset.tripFilter === key)) key = 'all';
      let count = 0;
      cards.forEach(card => {
        const show = key === 'all' || card.dataset.tripTags.split(' ').includes(key);
        card.hidden = !show;
        if (show) count++;
      });
      filterButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.tripFilter===key)));
      filterStatus.textContent = data.filterTemplate.replace('{n}',count);
      empty.hidden = count > 0;
      section.dataset.activeTripFilter = key;
      if (updateURL) {
        const url = new URL(location.href);
        if (key === 'all') url.searchParams.delete('style');
        else url.searchParams.set('style',key);
        history.replaceState(history.state,'',url);
      }
      section.dispatchEvent(new CustomEvent('ltc:trip-filter',{bubbles:true,detail:{filter:key}}));
    }

    function renderTable() {
      const chosen = records.filter(record => selected.has(record.id));
      table.innerHTML = `<thead><tr><th scope="col">${esc(t.selected)}</th>${chosen.map(record=>`<th scope="col"><a href="${esc(record.href)}">${esc(record.title)}</a></th>`).join('')}</tr></thead><tbody>${[
        [data.lang==='ko'?'여행 기간':data.lang==='zh'?'行程天数':'Duration',duration],
        [data.lang==='ko'?'중심 경험':data.lang==='zh'?'主要体验':'Focus',record=>record.focus],
        [t.walking,record=>record.walking],
        [t.stay,record=>record.stay],
        [t.difference,record=>record.difference],
      ].map(([label,value])=>`<tr><th scope="row">${esc(label)}</th>${chosen.map(record=>`<td>${esc(value(record))}</td>`).join('')}</tr>`).join('')}</tbody>`;
    }

    function syncSelection() {
      checks.forEach(check => {
        check.checked = selected.has(check.value);
        check.closest('[data-compare-trip]').classList.toggle('ed-compare-card-selected',check.checked);
      });
      selectedStatus.textContent = data.selectedTemplate.replace('{n}',selected.size);
      open.disabled = selected.size < 2;
      clear.disabled = selected.size === 0;
      if (selected.size < 2) tableSection.hidden = true;
      else if (!tableSection.hidden) renderTable();
    }

    filterButtons.forEach(button=>button.addEventListener('click',()=>filter(button.dataset.tripFilter,true)));
    section.querySelector('[data-trip-filter-reset]').addEventListener('click',()=>filter('all',true));
    window.addEventListener('popstate',()=>filter(new URLSearchParams(location.search).get('style') || 'all'));
    checks.forEach(check=>check.addEventListener('change',()=>{
      feedback.textContent = '';
      if (!byId.has(check.value)) {check.checked=false;return;}
      if (check.checked) {
        if (selected.size >= 3) {check.checked=false;feedback.textContent=t.maximum;return;}
        selected.add(check.value);
      } else selected.delete(check.value);
      syncSelection();
    }));
    open.addEventListener('click',()=>{
      if (selected.size < 2) {feedback.textContent=t.minimum;return;}
      renderTable();tableSection.hidden=false;heading.focus({preventScroll:true});
      heading.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      section.dispatchEvent(new CustomEvent('ltc:trip-compare',{bubbles:true,detail:{product_ids:[...selected]}}));
    });
    clear.addEventListener('click',()=>{selected.clear();feedback.textContent='';syncSelection();});
    section.querySelector('[data-compare-close]').addEventListener('click',()=>{tableSection.hidden=true;open.focus({preventScroll:true});});
    section.dataset.comparisonReady='true';
    filter(new URLSearchParams(location.search).get('style') || 'all');syncSelection();
  });
})();
