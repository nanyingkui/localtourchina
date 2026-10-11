# Direct selection controls — 2026-10-11

The homepage journey branch and trip-preparation workflow previously required opening disclosures before choosing services or preparation statuses. Primary selection controls now remain visible. Optional day-by-day descriptions, notices, videos and consultation extras remain collapsible.

## Findings and changes

1. Homepage journey entry: live browser inspection confirmed six services were behind “서비스별로 직접 선택”. Service cards now display directly. The decorative three-step labels and duplicate links to the same planning/package paths were removed.
2. Preparation basics: live inspection confirmed destination/date/party fields were collapsed when arriving with a destination URL parameter. These fields now remain visible.
3. Preparation statuses: live inspection confirmed all nine task choices were collapsed. Each task now shows its three status buttons directly; help configuration appears only after selecting help or uncertainty. Unselected tasks show “Choose a status” instead of appearing to have an existing uncertainty selection.
4. Package party size: source inspection found adult-count controls behind a disclosure. Counts are now directly available while optional day-by-day descriptions retain their disclosure.
5. Package adjustments: source inspection found lodging/transport/guide and daily changes inside nested disclosures. These controls now display directly; the unchanged adjustment rules still invalidate the reference quote.
6. Selection feedback: chosen buttons gain a check mark, blue border and text emphasis. Focus restores to the selected task button after rerendering. Removed accordion handlers and styles no longer serve these controls.

## Validation and limits

- Production build completed; root documents generated from canonical source.
- Existing 84 unit checks passed. Updated two obsolete disclosure assertions to verify exposed party controls and retained party selection/invalid-party continuation guard.
- Release checker: 47 pages, 135 inline scripts, zero missing local references, three server-visible locales.
- Additional DOM interaction smoke checks with jsdom and a stub catalogue passed for Korean/Chinese/English: nine task cards and 27 primary buttons; direct basic fields; help/ready transitions; keyboard focus; selection persistence after remount; complete inquiry handoff; and package component/day changes marked for a new quote. These checks created no live inquiries.
- Live cloud-browser capture confirmed the original homepage/preparation friction. The browser could not reach the local preview server (connection refused), so the changed version has not passed visual browser/mobile acceptance. DOM checks are not a substitute for that acceptance.
- Changes are prepared for review on a separate branch. No production publication, real inquiry submission, account change or customer-data deletion was performed.
