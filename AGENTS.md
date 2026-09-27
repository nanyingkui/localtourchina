# Local project instructions

- `src/site-template.html` is the editable source for all public HTML pages.
- Root HTML files are generated output. Do not edit them directly.
- After editing the template, run `npm run build` and commit the regenerated pages and `sitemap.xml`.
- Keep service pricing and inquiry generation centralized in the template until those modules are extracted into shared JavaScript files.
- Do not modify files under the parent project's `sources/` directory.
