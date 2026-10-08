# LocalTourChina production website

The 2026-10-08 release uses a white, light gray, graphite and blue storefront inspired by Apple Store. Detailed travel configuration remains the main path. Visitors who are undecided can use the shorter recommendation inquiry.

## Build and content updates

Install dependencies with `npm --prefix redesign ci`, then run `npm run build` at repository root. This regenerates original service/content pages from `src/site-template.html`, `src/english-template.html` and existing JSON data, applies shared styling and responsive image variants, builds the React storefront, prerenders Korean/Chinese/English homepages and writes the deployable site to the repository root for existing GitHub Pages hosting.

Edit source templates/data, `redesign/src`, or authoritative shared files in `redesign/public`. Root HTML files are generated. Original asset URLs remain available for external links and existing content operations.

Run `npm test` and `npm run check`. Optional render smoke test: `cd redesign && node scripts/render-smoke.mjs`.

## Production integration

The existing public Supabase RPC `create_public_inquiry` receives the complete configuration and returns an LTC reference and private access token. The private status page uses the existing read RPC. Public files contain only the existing anonymous public key. No schema, privileges, payment or messaging automation was added.

Failed or uncertain submissions never show a successful receipt. Configurations over the existing backend 12,000-character limit are preserved and can be copied for manual consultation. A consultation is not a confirmed booking. Private-trip pricing remains subject to manual quotation; existing ticket/vehicle/service calculations remain source-driven.

## Verification and rollback

See `redesign/design-qa.md` and `redesign/reports`. The previous production revision is `e1d53015759c3128d60b6378eb4c725cbd892bcd`. A rollback restores the site from that revision without changing consultation data.

Two clearly labeled synthetic acceptance inquiries were created: LTC-20261008-B18AEC and LTC-20261008-C68EA5. They are not customer bookings; no customer data, payment or external messages were sent. Private tokens are excluded from this repository and deliverables.
