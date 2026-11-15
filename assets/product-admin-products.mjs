import {adminFetch} from './product-admin-access.mjs';
const $ = id => document.getElementById(id);
const editor = $('editor');
let records = {};
let current;
const message = text => { $('message').textContent = text; };
function showList() {
  const q = $('search').value.trim().toLowerCase();
  const filter = $('filter').value;
  $('results').replaceChildren();
  for (const item of Object.values(records)) {
    if (filter !== 'all' && !!item.archived !== (filter === 'archived')) continue;
    const titles = Object.values(item.locales).map(x => x.title);
    if (![item.id,...titles].join(' ').toLowerCase().includes(q)) continue;
    const button = document.createElement('button');
    button.textContent = (item.locales.zh?.title || titles[0]) + ' · ' + item.id;
    button.onclick = () => { current = item; showEditor(); };
    $('results').append(button);
  }
}
function showEditor() {
  const lang = $('language').value;
  const local = current.locales[lang];
  editor.hidden = false;
  $('heading').textContent = current.id + (current.archived ? ' · 已归档' : '');
  $('archive').textContent = current.archived ? '恢复' : '归档';
  $('preview-link').href = current.paths[lang];
  editor.elements.title.value = local.title;
  const doc = new DOMParser().parseFromString(local.sections || '', 'text/html');
  const groups = [[],[],[]];
  let group = 0;
  for (const element of doc.querySelectorAll('h2,h4,p,ol,ul')) {
    if (element.tagName === 'H2') {
      group = /불포함|별도|예약 조건|不包含|另付|exclusion/i.test(element.textContent) ? 2 : /포함|包含|included/i.test(element.textContent) ? 1 : 0;
    } else {
      groups[group].push(element.matches('ol,ul') ? [...element.children].map(li => li.textContent).join('\n') : element.textContent);
    }
  }
  const values = local.editor_fields || groups.map(g => g.join('\n'));
  ['itinerary','included','excluded'].forEach((k,i) => { editor.elements[k].value = values[i]; });
}
async function save(action) {
  const payload = {id:current.id,revision:current.revision || 0,lang:$('language').value,action,...Object.fromEntries(new FormData(editor))};
  try {
    const response = await adminFetch('/api/admin/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data = await response.json();
    if (!response.ok) throw Error(data.error);
    records[data.id] = current = data;
    showList();
    showEditor();
    message(action === 'save' ? '已保存。刷新商品预览即可看到修改。' : '状态已更新。');
  } catch (error) { message(error.message); }
}
editor.onsubmit = event => { event.preventDefault(); save('save'); };
$('archive').onclick = () => { if (current.archived || confirm('归档后会从预览目录和首页隐藏，可恢复。')) save(current.archived ? 'restore' : 'archive'); };
$('language').onchange = showEditor;
$('search').oninput = showList;
$('filter').onchange = showList;
adminFetch('/api/admin/catalog').then(r => { if (!r.ok) throw Error('无法读取产品库'); return r.json(); }).then(data => { records=data;showList(); }).catch(error => message(error.message));
