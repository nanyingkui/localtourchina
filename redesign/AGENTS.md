# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

# Agreed redesign brief

- User delegated visual choice and authorized building from the agreed brief, source code and real photos despite blocked browser capture.
- Selected visual target: outputs/redesign/selected-direction.png (first displayed image, Mountain editorial).
- Korean first-stage preview; navy body color, orange primary actions, warm and reliable tone.
- Use real existing photographs and documented reviews; never reproduce fictional mockup reviews or prices.
- This preview persists only locally and uses PREVIEW identifiers. Do not connect to production databases or publish over localtourchina.com without a separate rollout request.
- Browser launch currently aborts under sandbox. Keep visual QA marked blocked until real browser capture succeeds.

# Full-site expansion (2026-10-08)
- User requested all mobile and child pages and explicitly delegated all design decisions, imagery, layout and routine checks. Do not ask again for those choices.
- The preview now contains public detail pages under public/details, using genuine existing content, images and price calculators. Shared override: public/details/assets/redesign.css; preview transfer/status logic: redesign.js.
- Korean React landing is the chosen split mountain direction. Chinese/English existing home pages and service pages are localized and use the shared navy/orange design. Core consultation, success and copy text support ko/zh/en.
- Fix legacy mixed-language Chinese strings rather than leaving them behind. Preserve publicly attributed reviewer nicknames in their original language.
- Production credentials/submission scripts are excluded. Records remain PREVIEW/local. This is a full-site design preview; live database integration, payment and formal release are a separate delivery stage.
- Native in-app browser now works. Actual browser verification is mandatory; earlier sandbox blocker is no longer current.

# Latest direction (2026-10-08)
- Overrides previous navy/orange split hero: use selected-apple-direction.png, Apple Store white/light gray/black/blue palette.
- Detailed customization is the primary conversion path. Recommendation inquiry is secondary. Preserve calculators and every selection in handoff; never truncate configuration into notes.

# Production delivery authorization
The user requested a fully launchable delivery and delegated all routine decisions. This release is distinct from the local preview. Preserve canonical original public URLs and existing service calculators. Use existing public Supabase RPCs; never expose secret keys. Keep original source photos archived outside public.

# Direct selection feedback (2026-10-11)
- Required preparation statuses, traveller counts and package adjustments must be directly visible and clickable. Do not hide primary selection controls behind disclosures. Remove redundant entry layers; keep optional explanatory details collapsible. Preserve all saved selections, quote rules and inquiry handoff.
