"""Business-registration presentation for public entry and booking pages."""
from functools import lru_cache
from pathlib import Path
import json
import re


@lru_cache(maxsize=1)
def _content():
    return json.loads(Path(__file__).with_name('business-registration.json').read_text())


def apply_business_registration(path, html, lang, catalog):
    home = path == ('/index.html' if lang == 'ko' else f'/{lang}/index.html')
    if home:
        slot = re.search(r'<section[^>]+aria-labelledby="promise-title"[^>]*>.*?</section>', html, re.S)
        pos = slot.end() if slot else html.index('</main>')
    elif path in {record['paths'][lang] for record in catalog.values()}:
        slot = re.search(r'<(?:section|div|form)\b[^>]*\bid="quote"[^>]*>', html, re.I)
        if not slot:
            slot = re.search(r'<(?:section|div)\b[^>]*\bid="service-(?:tickets|private)"[^>]*>', html, re.I)
        pos = slot.end() if slot and ' hidden' not in slot[0] else re.search(r'<main\b[^>]*>', html, re.I).end()
    else:
        return html

    data = _content()
    block = data[lang]['home' if home else 'booking']
    html = html[:pos] + block + html[pos:]
    return html.replace('</head>', data['style'] + '</head>', 1)
