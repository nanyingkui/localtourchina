import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ENGLISH_PRICING, englishUsdCents, formatEnglishPrice, onlineSupportInquiry } from '../src/english-pricing.mjs';
import { tripCatalog, PARTY_TIERS, getTripPrice, formatTripPrice, catalogInquiry } from '../src/trip-catalog.mjs';
import { initialDraft, inquiryText } from '../src/consultation.mjs';

test('dated ECB cross-rate and 10 percent uplift round once to cents', () => {
  assert.equal(ENGLISH_PRICING.rateDate, '2026-10-09');
  assert.equal(ENGLISH_PRICING.effectiveDate, '2026-10-10');
  assert.equal(englishUsdCents(970000), 79539);
  assert.equal(formatEnglishPrice(970000), 'USD 795.39');
  for (const [krw, usd] of [[148900,'122.10'],[148800,'122.01'],[119800,'98.23'],[45000,'36.90'],[33000,'27.06'],[50000,'41.00']]) assert.equal(formatEnglishPrice(krw), 'USD '+usd);
  assert.equal(englishUsdCents(0), 0);
  for (const invalid of [-1, NaN, Infinity, null, '50000']) assert.throws(() => englishUsdCents(invalid), RangeError);
});

test('all 30 package tiers show and hand off USD without changing Korean or Chinese amounts', () => {
  let tiers=0;
  for (const trip of tripCatalog) for (const pax of PARTY_TIERS) {
    const krw=getTripPrice(trip,pax); tiers++;
    const usd=formatEnglishPrice(krw);
    assert.equal(formatTripPrice(krw,'en'),usd);
    assert.equal(formatTripPrice(krw,'ko'),krw.toLocaleString('en-US')+'원');
    assert.equal(formatTripPrice(krw,'zh'),'KRW '+krw.toLocaleString('en-US'));
    const text=catalogInquiry(trip,pax,'en');
    assert.ok(text.includes(usd)); assert.doesNotMatch(text,/KRW|₩/);
    const draft={...initialDraft(),contact:'TEST',configuration:{inquiryText:text}};
    assert.ok(inquiryText(draft,'','en',true).includes(usd));
  }
  assert.equal(tiers,30);
  assert.equal(formatTripPrice(null,'en'),'Quote required');
  assert.equal(getTripPrice(tripCatalog[0],3),970000);
});

test('existing saved KRW inquiry text is preserved rather than silently repriced', () => {
  const original='Existing quote: KRW 970,000';
  const draft={...initialDraft(),contact:'TEST',configuration:{inquiryText:original}};
  assert.ok(inquiryText(draft,'','en',true).includes(original));
});

test('reviewed pages use conditional current prices and language-specific channels', async () => {
  for (const name of ['local-guide','online-guide']) {
    const html=await readFile(new URL('../../en/'+name+'.html',import.meta.url),'utf8');
    assert.match(html,/catalog-current/);assert.match(html,/catalog-date/);assert.match(html,/WhatsApp/);
    assert.doesNotMatch(html,/USD 41\.00|9 October 2026|fluent English-speaking local guide/);
  }
  for(const lang of ['ko','zh','en']){
    const prefix=lang==='ko'?'':lang+'/';const html=await readFile(new URL('../../'+prefix+'index.html',import.meta.url),'utf8');
    assert.match(html,/products.html/);assert.match(html,/data-contact/);
    assert.ok(html.includes(lang==='ko'?'카카오톡 상담':lang==='zh'?'微信咨询':'WhatsApp'));
  }
});
