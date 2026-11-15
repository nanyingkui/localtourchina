"""Multilingual booking guidance and photography for reviewed product pages."""
from functools import lru_cache
from pathlib import Path
import json
import re


@lru_cache(maxsize=1)
def _presentations(lang):
    filename = 'ko-product-presentation.json' if lang == 'ko' else 'localized-product-presentation.json'
    return json.loads(Path(__file__).with_name(filename).read_text())


def apply_product_presentation(path, html, lang):
    entry = _presentations(lang).get(path)
    if entry is None:
        return html
    intro = re.search(r'<section class="jd-detail-intro".*?</section>', html, re.S)
    if intro:
        opening = intro[0].removesuffix('</section>')
        opening, replaced = re.subn(r'<figure class="jd-detail-photo">.*?</figure>',
                                    lambda _: entry['cover'], opening, count=1, flags=re.S)
        if not replaced:
            opening += entry['cover']
        html = html[:intro.start()] + opening + '</section>' + entry['detail'] + html[intro.end():]
    else:
        main = re.search(r'<main\b[^>]*>', html, re.I)
        if not main:
            raise ValueError(f'Missing main landmark: {path}')
        html = html[:main.end()] + entry['cover'] + entry['detail'] + html[main.end():]
    if 'credit' in entry:
        html = html.replace('</main>', entry['credit'] + '</main>', 1)
    return html.replace('</head>', '<link rel="stylesheet" href="/product-presentation.css"></head>', 1)
