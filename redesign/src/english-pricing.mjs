/** English reference prices only. Never apply to existing quotes or payment records. */
export const ENGLISH_PRICING = Object.freeze({
  currency: 'USD',
  effectiveDate: '2026-10-10',
  rateDate: '2026-10-09',
  source: 'European Central Bank euro reference exchange rates',
  sourceUrl: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
  usdPerEur: 1.1206,
  krwPerEur: 1503.27,
  markupPercent: 10,
  rounding: 'nearest USD cent',
});

export function englishUsdCents(priceKRW) {
  if (!Number.isFinite(priceKRW) || priceKRW < 0) throw new RangeError('A non-negative KRW reference price is required');
  // KRW / (KRW per USD) × 1.10, rounded once to the nearest cent.
  return Math.round(priceKRW * ENGLISH_PRICING.usdPerEur / ENGLISH_PRICING.krwPerEur * (1 + ENGLISH_PRICING.markupPercent / 100) * 100);
}

export function formatEnglishPrice(priceKRW) {
  return 'USD ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(englishUsdCents(priceKRW) / 100);
}

export const englishPricingNote = 'USD reference prices use the ECB rates dated 9 October 2026, with a 10% adjustment, rounded to the nearest cent. Final availability, total, deposit, balance, payment fees and cancellation terms are confirmed in your written quote.';
export const onlineSupportInquiry = () => `Online travel support: ${formatEnglishPrice(50000)} per group, up to 7 days. Support 08:00–20:00 China time; language and availability to confirm.`;
