# Release verification — 2026-10-08

- 46 actual HTML routes checked in browser at 320px mobile and 1280px desktop: no horizontal overflow, visible broken images, or missing main heading. Reports list each route separately.
- Chinese legacy UI wording repaired across configuration steps, policies and generated inquiry summaries; original reviewer/guide names remain unchanged. Five-step Chinese private configuration retains stage and preferences after refresh.
- 17 logic/packaging tests passed. Render smoke checks passed. Static release scan found zero missing local resources; inline scripts parsed successfully; three homepages contain server-visible content, canonical links and language alternates.
- Complete mobile private-trip flow submitted a labeled synthetic inquiry through the production backend. Server-issued LTC reference and private status retrieval confirmed. Room preference, dietary preference and attraction priority survived.
- Original flight filtering and flight-to-itinerary prefilling retained on dedicated Korean/Chinese pages. A newly selected December flight supersedes old draft dates while retaining room preferences; browser verified.
- Ticket configuration handoff retained two booking dates, time slots, gate/course, ticket type and the three-person adult/senior mixture. Vehicle handoff retained 34 passengers and the selected bus; final common fields are locked to prevent contradictory selections.
- 147 raster assets optimized into responsive WebP variants; two new explicitly illustrative service assets; four black originals repaired from genuine existing destination photos. Original public asset URLs retained. Technical encoding preserves documentary images.

No payment, real booking or outgoing customer message was performed. Two labeled synthetic inquiry records remain for operator identification. Existing price policies are retained. Automated route scans do not exhaust every possible calculator combination or constitute legal certification.

Release reports contain no private inquiry access tokens. Raw private acceptance receipt stays outside this repository and public deliverables.
