# 여행 중 문제 해결 / 上线交接

Public page: https://localtourchina.com/travel-help.html
Homepage: reviews → problem-solving entry → existing travel information.

Runtime content is read only from the existing `knowledge_items` table. No static case fallback and no local copy of customer data. Existing public RLS limits reads to published records. No schema or permission changes.

- `travel-case:Sxxx`: 77 Korean editorial summaries of directly read Naver originals; covers 195 primary issue nodes, plus linked supplementary evidence. These are individual experiences, not validated current policy or a count of unique travelers.
- `naver-problem:Qxxx`: 368 private research drafts, status `needs_review`, module `travel_research`; cannot be published by the admin editor without creating an editorial case.
- `redesign/content/travel-help-reviewed.json` and `.tsv`: frozen release review inputs, not live content masters. Never reimport over edited records. Future edits belong to the existing admin library.

## Maintenance

Open the existing `/admin.html` → 资料库. Search `travel-help` to edit the Korean title, situation, outcome, next checks, limitations, Chinese request sentence and separate source/travel dates. Check the verification box only after reviewing the changes. Saving uses existing optimistic version checks. Archive a case to remove it from the public page; do not delete research nodes. Search `研究底稿` for unpublished original Chinese research. The Korean page links Naver originals rather than copying full posts or photos.

Public filters: region, eight problem categories, outcome and keyword. Each case supports a direct share URL and a Chinese request phrase. Naver sources and dates stay visible inside the expanded case. API failures show retry guidance; unpublished cases never come from local fallback data.

## Validation

Run `npm run build`, `npm run check`, `npm test`; browser QA covers desktop/mobile, region and text filters, details, copy/link controls, published-only access and loading failure. Database import inserts drafts first, then publishes only the reviewed case IDs. Import is idempotent and never overwrites pre-existing rows.
