# LocalTourChina release source

Production React storefront and consultation flow, with Korean, Chinese and English homepages. Main palette: #ffffff, #f5f5f7, #1d1d1f and #0071e3. Detailed configurations are retained in full, with browser drafts and a single production inquiry handoff.

Use the repository-root build for current service/content data. To build this snapshot independently: `npm ci && npm run build`. Output: `dist/client`. Development mode uses local preview records; production builds use the existing Supabase consultation RPC.

See `../README.md`, `design-qa.md`, `reports/asset-provenance.md`, and `reports` for verification and operational limits.
