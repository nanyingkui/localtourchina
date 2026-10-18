# Homepage scenic explorer — 2026-10-18

Request: replace the cropped, fixed Yuanjiajie scene with complete, switchable scenery and an understandable full transition.

Implemented in src/ScenicExplorer.jsx, scenic-explorer.mjs and scenic-explorer.css. Homepage TravelHome uses the new explorer; older ScenicHero callers are unchanged.

- Twelve selectable scenic places, paired existing high-resolution day/night files.
- Full-photo contain fit, including portrait Huanglong Cave; no foreground control overlay or dark gradient masking.
- Desktop controls beside image, tablet/phone controls below. 46px minimum primary controls.
- Direct ten-second, user-triggered day-to-night playback, pause, time slider, four time presets and opt-in scroll linkage. No unsolicited autoplay.
- Scroll interpolation reaches full night while the frame top is still in view, rather than requiring the whole section to pass.
- Enlarge dialog, independent labelled slider, close button and native Escape behavior.
- Asynchronous pair loading keeps the current scene, ignores cancelled scene selections and provides failure/retry status. Night failure keeps day.
- Cave lighting and optional Fenghuang/Furong extensions explicitly labelled; simulation disclosure retained in three languages.

Verification: 184 automated tests passed. All 24 files exist. Source sizes checked using sips: base scenic frames mostly 1448×1086, Tianmen 1800×1013, canyon 2200×1577, Golden Whip 4032×3024, Huanglong portrait 1086×1448. Existing night images are paired compositions with mostly 1448×1086 dimensions. The renderer preserves the entire frame rather than enlarging/cropping.

Production build and release checker passed: 48 pages, 135 inline scripts, zero missing local references. No new image was generated or edited.

Actual browser/mobile QA remains blocked by Chrome feature-gate load error, even after the authorized new-window retry. In-app browser unavailable. No screenshots or visual/mobile acceptance are claimed. Local preview remains unpublished, together with the four intent-based request forms from d5e3e6e. Do not release until actual browser checks are possible.

Preview: http://127.0.0.1:61949/?review=scenery-explorer#home-scene-place

## Release decision update — 2026-10-18
The user subsequently explicitly authorized skipping the blocked Chrome/mobile browser verification and publishing these existing changes together. Earlier release holds above are superseded for this release. Actual mobile/browser interaction and visual QA remain unverified; automated checks and deployed HTTP/resource checks must be reported separately.
