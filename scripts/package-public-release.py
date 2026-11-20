from pathlib import Path
import json, re, shutil
root=Path(__file__).resolve().parent.parent
out=root/'_site';out.mkdir(exist_ok=True)
files=json.loads((root/'public-release-manifest.json').read_text())
measurement_id = 'G-232N1VVFP5'
head = re.compile(rb'</head\s*>', re.IGNORECASE)
title = re.compile(rb'<title(?:\s[^>]*)?>', re.IGNORECASE)
redirect = re.compile(rb'<meta\s+http-equiv=["\']refresh["\']', re.IGNORECASE)
analytics = rf"""<script async src="https://www.googletagmanager.com/gtag/js?id={measurement_id}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag() {{ window.dataLayer.push(arguments); }}
const analyticsPage = new URL(location.pathname, location.origin);
const campaign = new URLSearchParams(location.search);
for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id',
                   'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid']) {{
  if (campaign.has(key)) analyticsPage.searchParams.set(key, campaign.get(key));
}}
gtag('js', new Date());
const embeddedSafety = /^(?:\/(?:zh|en))?\/travel-safety\.html$/.test(location.pathname)
  && window.parent !== window && campaign.get('dialog') === '1';
gtag('config', '{measurement_id}', {{ page_location: analyticsPage.href, send_page_view: !embeddedSafety }});
</script>
""".encode()

for name in files:
    path = Path(name)
    if (
        path.is_absolute()
        or '..' in path.parts
        or any(part in path.parts for part in ['server', 'outputs', 'tests', 'node_modules'])
        or path.suffix in ['.sqlite', '.db', '.sql', '.py', '.map', '.env']
    ):
        raise ValueError('Non-public path')

    source = root / path
    if not source.is_file():
        raise ValueError('Missing public file: ' + name)
    dest = out / path
    dest.parent.mkdir(parents=True, exist_ok=True)

    if path.suffix != '.html':
        shutil.copy2(source, dest)
        continue

    document = source.read_bytes()
    if not redirect.search(document) and measurement_id.encode() not in document:
        insertion = head.search(document) or title.search(document)
        if insertion is None:
            raise ValueError('Missing analytics insertion point: ' + name)
        offset = insertion.start()
        document = document[:offset] + analytics + document[offset:]
    dest.write_bytes(document)

print('Packaged', len(files), 'public files')
