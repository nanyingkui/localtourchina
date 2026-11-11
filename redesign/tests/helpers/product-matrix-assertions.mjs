import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CUSTOMER_CHAT_URL} from '../../src/chat-handoff.mjs';

const data=JSON.parse(readFileSync(new URL('../../src/data/products.json',import.meta.url),'utf8'));
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[char]));

// These callers render the initial SSR state: four adults, regular season.
export function assertProductMatrix(html){
 assert.match(html,/<section class="product-matrix" id="zhangjiajie-trips"/);
 const cards=html.match(/<article class="pm-card"[^>]*>[\s\S]*?<\/article>/g)||[];
 assert.equal(data.products.length,10);
 assert.equal(cards.length,10);
 for(const product of data.products){
  const card=cards.find(markup=>markup.includes(`id="matrix-${product.id}"`));
  assert.ok(card,product.id);
  assert.ok(card.includes(`<h4>${escapeHtml(product.name_ko)}</h4>`),`${product.id}: name`);
  const price=`${data.ui_ko.per_person} ₩${product.price_per_person_krw.regular['4'].toLocaleString('ko-KR')}${data.ui_ko.from}`;
  assert.ok(card.includes(`<div class="pm-price"><strong>${escapeHtml(price)}</strong>`),`${product.id}: JSON price`);
  assert.ok(card.includes(escapeHtml(product.walking_ko)),`${product.id}: walking`);
  for(const highlight of product.highlights_ko) assert.ok(card.includes(`<li>${escapeHtml(highlight)}</li>`),`${product.id}: highlight`);
  const details=card.indexOf(`<details><summary>${escapeHtml(data.ui_ko.details)}</summary>`);
  const actions=card.indexOf('class="pm-actions"');
  assert.ok(details>card.indexOf('class="pm-price"') && actions>details,`${product.id}: price before collapsed details and consultation`);
  assert.ok(card.includes(`<a class="button primary" href="${CUSTOMER_CHAT_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.ui_ko.consult)}</a>`),`${product.id}: Kakao consultation`);
  assert.ok(card.includes(`<button type="button">${escapeHtml(data.ui_ko.copy)}</button>`),`${product.id}: copy`);
 }
}
