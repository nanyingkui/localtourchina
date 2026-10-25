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
