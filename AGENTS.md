# LocalTourChina source and release instructions

- Korean/Chinese service calculators and content remain centralized in src/site-template.html. English service content comes from src/english-template.html. Continue maintaining src/restaurants.json, src/reviews.json and other original data sources.
- Apple storefront and inquiry source: redesign/src/. Shared service theme and transfer logic: redesign/public/assets/redesign.css and redesign.js. Status and privacy documents: redesign/public/.
- Do not edit generated root HTML directly. Run npm run build: it builds current legacy sources, transforms them through redesign/scripts/sync-legacy.mjs, builds/prerenders the three storefront languages and copies the deployable files to the root.
- Install frontend dependencies with npm --prefix redesign ci. Run npm run build, npm run check and npm test before release.
- Image variants and original-to-optimized mappings are maintained in redesign/public/assets and redesign/reports. Original assets remain available so existing image URLs and future content operations keep working.
- User direction: Apple Store white/light gray/black/blue, detailed customization as primary conversion path, recommendation as secondary. Preserve pricing, room/food/pace/route/transport selections and full inquiry text.
- Use existing public Supabase RPCs and public anon key only. Never place service-role keys or private inquiry tokens in tracked files.
- Do not modify files under parent sources/.
