# Four intent service requests — 2026-10-18

## Implemented
- Homepage four visible intents: tailored trip / vehicle / Korean guide / tickets.
- Direct, single-screen forms at `?view=request&service=private|vehicle|guide|ticket` in ko/zh/en.
- Date and party come from shared trip choices; optional private departure date; use dates required for individual services.
- Private: date, party, duration, reply contact. Detailed itinerary is discussed with staff.
- Vehicle: date, party, type, pickup, destination; flight and pickup time optional.
- Guide: date, party, area, duration.
- Ticket: attraction, date, total party, child count; ages required when children are present.
- Optional name and notes are collapsed. No automatic paid items or generated quotes.
- Contact persists only within this tab session and is reused when changing request type. Never in shared trip storage or URL.
- Existing public inquiry submission and notification channel reused. Every service-specific field included in inquiry text.
- All receipt paths remove the compulsory copy/paste/Kakao handoff. Reference, contact, status link and next steps retained. Chat remains optional for corrections.
- Existing product descriptions/calculators remain on secondary detail links; scenery and weather information unchanged.

## Verification
- 181 automated tests passed (service validation, conditional rendering in three languages, mock API payload preservation, receipt, existing site regression tests).
- Full production build passed. Release checker: 48 pages, 135 inline scripts, zero missing local references.
- Browser testing blocked: Chrome feature-gate load fails twice; Chrome installed/running, extension enabled and native host manifest valid. In-app browser unavailable. Permission requested for a fresh Chrome window according to browser plugin instructions.
- Mobile visual acceptance and actual UI submissions remain pending. No production test request sent in this task, and no claimed Gmail delivery verification for the changed form.
- Do not claim this report establishes mobile layout, focus/keyboard behavior or production delivery.

## Local preview
http://127.0.0.1:61949/?review=service-request

## Mobile acceptance still required
At 390px and 320px: inspect all four entries and forms, no horizontal overflow/overlap; edit home date, length and party then verify transfer; change service and verify contact retained; children/ages and vehicle subtype fields; invalid/past date and missing required fields; successful preview submit with complete receipt, no compulsory Kakao action; back/edit without lost draft. Inspect desktop layout and browser console too.
