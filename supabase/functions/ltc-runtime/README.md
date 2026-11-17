# Existing production runtime

Source snapshot of the existing `ltc-runtime` Edge Function. Deploy all four runtime files together with `index.ts` as entrypoint and `deno.json` as import map. Preserve `verify_jwt: false`: public quotations are unauthenticated; administrative endpoints perform their existing administrator checks.

The 2026-11-17 owner-approved standalone vehicle tariff table lives only in the existing private `ltc_runtime_documents` catalog row, under `rules.day_transfer.listed_tariffs`. Keys are route, day/overnight, and car9/car14/shared. Private procurement figures and profit thresholds must not be exported to the static release.

Approved KRW tariffs are per vehicle (shared tariffs per seat). Fleet quotations sum each assigned vehicle's approved tariff; CNY and USD use the quotation's FX snapshot. Guided sightseeing tours retain the original pricing calculation. Cost/FX changes that breach a route's checks require review; the runtime never silently substitutes a higher KRW fare. Existing explicit administrator overrides remain supported.

Pricing revision 7 activates the approved tariffs. The website rejects older standalone quotations and refreshes notebook service quotations before consultation. Keep this source synchronized with any subsequent Edge Function deployment; never restore the pre-tariff engine over active tariff rules.
