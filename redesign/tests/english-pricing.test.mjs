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
  assert.equal(getTripPrice(tripCatalog[0],3),null);
});

test('existing saved KRW inquiry text is preserved rather than silently repriced', () => {
  const original='Existing quote: KRW 970,000';
  const draft={...initialDraft(),contact:'TEST',configuration:{inquiryText:original}};
  assert.ok(inquiryText(draft,'','en',true).includes(original));
});

test('generated English service pages request USD and online support uses shared pricing', async () => {
  for (const name of ['private-tour','tickets','day-tours','local-guide','vehicles','multi-booking']) {
    const html=await readFile(new URL('../../en/'+name+'.html',import.meta.url),'utf8');
    assert.match(html,/deposit and balance in USD/);
    assert.doesNotMatch(html,/KRW|₩|\d[\d,]*원/);
  }
  const html=await readFile(new URL('../../en/online-guide.html',import.meta.url),'utf8');
  assert.match(html,/USD 41\.00 per group/);
  assert.ok(html.includes(onlineSupportInquiry()));
  assert.doesNotMatch(html,/KRW|₩|50,000/);
  assert.match(html,/9 October 2026/);
});


test('WhatsApp is correctly linked in all language storefronts and English contact pages', async () => {
  for (const name of ['index.html','zh/index.html','en/index.html','en/company.html','en/online-guide.html','company.html','zh/company.html']) {
    const html=await readFile(new URL('../../'+name,import.meta.url),'utf8');
    assert.match(html, /href="https:\/\/wa\.me\/821055722601"/);
    assert.match(html, /WhatsApp \+82 10-5572-2601/);
    assert.match(html, /pf\.kakao\.com/);
  }
});
