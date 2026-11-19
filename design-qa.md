# Brand and conversion release QA — 2026-11-19

final result: passed

## Visual truth and captured implementation

- Source direction: `../generated_images/exec-e870f21f-2970-4e50-b9d6-fb614e0cb0bf.png` (946 × 1663 pixels).
- Rendered implementation: `http://127.0.0.1:8793/`, Korean homepage, anonymous visitor; desktop 1280 × 900 and 946 × 900 CSS pixels, mobile 390 × 844, device pixel ratio 1.
- Browser captures: `/tmp/localtourchina-upgrade-qa/home-desktop-full-final.jpg` (1280 × 7687), `home-946-full.jpg` (946 × 7418), `home-mobile-top.jpg` (390 × 844).
- Combined full-view evidence: `/tmp/localtourchina-upgrade-qa/qa-same-width.jpg`. Source and browser content share 946-pixel width without density scaling. The browser's first 1663 pixels are compared with the concept's complete 1663-pixel direction sheet; they are not claimed to show identical content depth.
- Additional combined composition: `qa-combined.jpg`, both sides scaled to 700 pixels wide. Focused original-resolution evidence: `home-desktop-top.jpg`, `team-desktop.jpg`, `all-nine-desktop.jpg`, `comparison-desktop.jpg`, `comparison-mobile.jpg`, `inquiry-mobile.jpg`.

## Findings and accepted product differences

No outstanding actionable P0/P1/P2 findings.

The source is an art-direction concept, not a factual product specification. The implementation deliberately uses the existing real destination photographs, existing orange-hat brand assets, real anonymized guest/guide photograph, actual product names, actual prices and real review sources. Generated guide portraits, invented walking scores and conceptual prices are excluded.

The concept's white canvas, forest-green hierarchy, editorial photographs, paper photo edges, handwritten blue note and yellow accent are retained. The actual page adds preference filters, party-size pricing controls and the complete nine-trip directory before guide evidence. This increases section depth intentionally to fix product discovery and explain costs. At 946 pixels the existing responsive header uses its compact menu; at 1280 it shows the full navigation. Real guide photographs replace the concept's staged collage. No graphic asset was recreated as SVG or CSS artwork.

### Required fidelity surfaces

- **Fonts/typography:** inspected desktop/mobile Korean text and Chinese/English page wrapping. Bold display hierarchy, readable body text, restrained handwritten accent; visible button labels and fallback fonts confirmed. Initial captures immediately after resize/font loading were rejected and recaptured after the visible page stabilized.
- **Spacing/layout:** inspected same-width concept composition and 1280/390 responsive states. Clear section rhythm, three-column desktop cards, single-column phone cards, 44–50 px action controls, visible focus rules. No page-level horizontal overflow in the tested homepage, trip directory, detail, comparison or inquiry states. The phone comparison table intentionally scrolls within its own 350-pixel container (620-pixel table).
- **Colors/tokens:** white and light neutral surfaces with forest-green actions/text, blue handwriting and restrained yellow evidence/action accents. Text/button labels remain legible in the captured states.
- **Image quality:** real misty peaks, forest stream, cliff walkway, Furong riverside and anonymized group image load successfully. Preserve the portrait walkway photograph rather than stretching it to manufacture a landscape. The group photograph was inspected after lazy loading; blank in-flight captures were rejected.
- **Copy/content:** nine real multi-day itinerary IDs, qualitative walking descriptions, explicit inclusions/omissions, real case sources 128/245/212, date-dependent price language, unsubmitted inquiry status, no fabricated training/certification/ratings or performance claims. Korean, Chinese and English use locale-appropriate consultation/contact destinations.

## Primary interactions verified

1. Homepage: visible consultation + all-nine itinerary entry, preference navigation, all nine direct detail links, guide/service/case/booking sections and phone handoff bar.
2. Trip selection: default nine, old-town filter four, trekking filter three, reset nine; two-item comparison, maximum three guard and clear selection. Old `#choose` anchor opens the preserved featured-tour details.
3. Price detail: experience45 two adults gives ₩1,220,000 per person / ₩2,440,000 group; four gives ₩1,040,000 / ₩4,160,000. Existing exclusions and room counts persist.
4. Inquiry: adult count plus explicit zero children generates a complete local draft. The review screen explicitly says it has not been sent. Full editable text and copy/chat handoff actions remain available on mobile. No real inquiry, message, booking or payment was submitted.
5. Languages: Chinese homepage consultation points to `/zh/consultation.html`; English trip filter and status are localized; all three languages covered by regression checks.
6. Console: browser warning/error logs checked on the tested local routes; none recorded.

## Comparison history

The combined visual comparison found no actionable P0/P1/P2 design issues. No visual fixes were made in response to this pass. Earlier incomplete screenshots during async font/image rendering and immediately after viewport changes were rejected; the accepted stable captures are listed above. These capture retries are not presented as design iterations.

## Release validation

- 380/380 automated regression checks passed, including real build idempotence, all-nine discovery, comparison controls, price hashes, case-source accuracy and inquiry boundaries.
- Six original inquiry forms and six groups of original business scripts are byte-identical to the reviewed baseline, excluding the added presentation runtime tag.
- Release checks: 171 HTML pages, 86 inline scripts, zero missing local references, three server-visible locales, public-key checks passed.
- Package: 2699 allowlisted public files; no extra files. Superseded task-only editorial assets removed.
- Pricing/catalogue, review source data, admin, customer and authentication boundaries unchanged.

## Limits and follow-up

This verifies the visible presentation and local interaction path, not a measured conversion-rate increase or full accessibility conformance. Real message receipt remains in the conversation channel; intent analytics do not claim a received enquiry or sale. Recheck the deployed site after Pages reports success. New customer evidence or a documented guide-training programme can replace current copy when those materials exist.
