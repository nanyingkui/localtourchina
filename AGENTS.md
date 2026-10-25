# LocalTourChina source and release instructions

- Korean/Chinese service calculators and content remain centralized in src/site-template.html. English service content comes from src/english-template.html. Continue maintaining src/restaurants.json, src/reviews.json and other original data sources.
- Apple storefront and inquiry source: redesign/src/. Shared service theme and transfer logic: redesign/public/assets/redesign.css and redesign.js. Status and privacy documents: redesign/public/.
- Do not edit generated root HTML directly. Run npm run build: it builds current legacy sources, transforms them through redesign/scripts/sync-legacy.mjs, builds/prerenders the three storefront languages and copies the deployable files to the root.
- Install frontend dependencies with npm --prefix redesign ci. Run npm run build, npm run check and npm test before release.
- Image variants and original-to-optimized mappings are maintained in redesign/public/assets and redesign/reports. Original assets remain available so existing image URLs and future content operations keep working.
- User direction: Apple Store white/light gray/black/blue, detailed customization as primary conversion path, recommendation as secondary. Preserve pricing, room/food/pace/route/transport selections and full inquiry text.
- Use existing public Supabase RPCs and public anon key only. Never place service-role keys or private inquiry tokens in tracked files.
- Do not modify files under parent sources/.

# Unified production workspace 2026-10-25

- The single operator entry is https://localtourchina.com/admin.html. Extend its original authentication and Supabase project; never create parallel customer/order databases or admin sites.
- Existing inquiries remain the customer inquiry/order ledger, retaining IDs, references, payment metadata, quotes, identity notes, archived records and channel links. Same-contact groups are review candidates, never automatic identity merges.
- All inquiry sources must be accessible from the workspace; do not hide chat-origin records with a website-only base query. Existing reminder delivery scopes remain unchanged unless separately requested.
- Canonical new content and operating prerequisites are public.knowledge_items; version history is public.knowledge_revisions in the same existing Supabase project. New content starts needs_review, with explicit verification before publication. Archive instead of destructive removal.
- Source files and legacy imports are references. The one-time content import must never overwrite later curated edits or import DEMO customer/payment records. The old localtourchina-hub SQLite is historical demo material, not a writable production master.
- Keep customer data behind existing admin authorization. Public travel-library.html reads only published non-internal content; no raw member articles, customer records or internal operational tasks.
- Keep future PWA/native app clients on these same APIs and records. Do not create app-only copies of customers, payments or content.

# Traveler PWA 2026-10-25

- Canonical Korean visitor app: https://localtourchina.com/app/ (source redesign/src/traveler plus redesign/public/app). Build through redesign/scripts/build-traveler.mjs in the existing website release pipeline.
- Reuse existing Supabase Auth (Google/Kakao). The exact OAuth redirect is https://localtourchina.com/app/; preserve the existing admin Site URL and other callbacks. No app-only customer or order database.
- New PWA pickup requests are original inquiries with traveler_user_id, client_request_id, pickup_request_hash, pickup_details; travel_date is still the canonical date. Never infer ownership of legacy records from name/contact or reassign immutable ownership.
- Public traveler RPC wrappers are SECURITY INVOKER and delegate to the non-exposed ltc_private boundary, which checks Auth subject and returns only guest-visible fields. Keep base inquiries SELECT/UPDATE policies admin-only; do not grant visitors access to raw rows containing internal notes, receipt tokens or financial metadata.
- Existing admin edits pickup details through assets/admin-pickup.mjs; preserve row_version compare-and-swap, quote/payment history, supplier-confirmation guard and old customer flows. Guest data is refreshed while the app is open; no push or automatic driver confirmation is implemented.
- PWA worker scope is /app/ only. Cache allowlisted static shell assets only; NEVER cache Auth/RPC/customer responses, tokens, callback URLs or admin pages. Do not queue offline bookings. Retain the same idempotency key across ambiguous submission retries; never manufacture a successful receipt.
- Mobile navigation, one expanded card with peers visible but smaller, minimum46px controls, 16px inputs, reduced motion, Chinese-time arrival scheduling. Logout clears visible private data and temporary pickup drafts.
- Supabase SDK is pinned to2.118.0; keep package-lock.json synchronized. Production files must not contain QA/mock login paths. SQL integration tests roll back synthetic users/orders; never seed real customer tables with demo bookings.
