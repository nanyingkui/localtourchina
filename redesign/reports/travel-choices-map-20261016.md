# Shared travel choices and daily maps · 2026-10-16

- Home and planner use `/assets/trip-preferences.js`: date/days/party only, no contact or receipt tokens. URL values explicitly override shared choices; existing itinerary changes require the existing backup/confirmation flow.
- Existing personal itinerary is not automatically replaced when arriving from the home page. Homepage switches back to the saved basic choices; blank dates and party stay undecided. Four to seven days; seventh day is a custom extension with no invented price.
- Success receipt summary and progress action precede next steps. Full raw inquiry defaults closed. Submitted live requests cannot be resubmitted through an edit button. Green primary and light secondary controls use the existing Travel Light system.
- Per-day map and each timeline location action open one context-specific location list; copy Chinese addresses and external AMap search remain available without an SDK. Explicit lazy map expansion, no fabricated driving line between mountain attractions. Address-search markers are not verified entrances.

## AMap account and activation status

The existing sibling `zhangjiajie-map` prototype has AMap adapter/server proxy scaffolding but both AMAP_KEY and AMAP_SECURITY_CODE are empty. No active production integration found. User reports they are registering an account.

`travel-planner/map-config.json` is deliberately disabled. Enable only after developer account verification, scenario-appropriate commercial authorization confirmation, Web (JS API) key, domain restrictions and a deployed same-origin `/_AMapService` security proxy. The public JSON may contain the public JS key, never securityJsCode. Proxy must inject security code server-side, allowlist required geocoder/map-style paths and enforce origin/rate limits. GitHub Pages cannot execute this proxy; provision the server route before enabling it. Do not reuse a personal development quota as a commercial license. No account, key, payment or DNS change performed in this release.

Remaining live-map verification after credentials: SDK load; actual Zhangjiajie geocoding results; marker→timeline and timeline→map; duplicate/missing addresses; mobile pinch/scroll; API failure fallback. This release does not claim a live AMap basemap is enabled.

## Verification

- 169 unit tests passed; 48 release pages / 135 inline scripts / 0 missing references.
- Browser: home 2026-11-20 / 4 travellers / 5 days → personal planner, dated D1–D5; return home preserved choices.
- Browser: per-day map expansion without credentials retains address list, entrance notes and valid AMap links; no blank fake map.
- Browser: isolated preview inquiry retains five-day date range and party, collapses raw text. No new production inquiry submitted.
- 390px mobile planner and receipt: no horizontal overflow. Screenshots stored outside public source in ../journey-unification-20261016/.
