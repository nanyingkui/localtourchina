"""Build reviewed public pages from a public-only export, never from internal costs."""
from pathlib import Path
import sys,os,json,re,shutil,hashlib
from html import escape
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'catalog-site'))
from storefront_view import homepage,catalogue,detail,enhance_existing
from catalog_registry import records
C=records();DEST=ROOT/'redesign/dist/client'
assert len(C)==22 and all(set(r['locales'])=={'ko','zh','en'} for r in C.values())
for r in C.values():
    assert set(r)<=set(['id','paths','locales','pricing','discovery','revision','plans','late_departure_plans','archived'])
    assert not any(x in json.dumps(r,ensure_ascii=False) for x in ['采购成本','整团利润','planning_cost','direct_cost'])
VERSION=hashlib.sha256((ROOT/'catalog-site/catalog.json').read_bytes()+b''.join(p.read_bytes() for p in sorted((ROOT/'redesign/src/selections').glob('*')) if p.is_file())+b''.join((ROOT/'redesign/public'/p).read_bytes() for p in ['tour-config.mjs','catalog-choice.js'])).hexdigest()[:12]
ASSET=f'/assets/my-selections/{VERSION}/'
def publish(path,html,lang,alternates):
    html=html.replace('20261113journey',VERSION)
    html=html.replace('<meta name="robots" content="noindex,nofollow">','')
    html=re.sub(r'<link[^>]+rel="(?:canonical|alternate)"[^>]*>','',html)
    seo='<link rel="canonical" href="https://localtourchina.com'+path+'">'+''.join('<link rel="alternate" hreflang="'+k+'" href="https://localtourchina.com'+v+'">' for k,v in alternates.items())
    html=html.replace('</head>',seo+'<script defer src="/catalog-entry.js"></script></head>',1)
    # Cached HTML may keep old assets; content-addressed selection files are retained.
    for base in [DEST,ROOT]:
        target=base/path.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True);target.write_text(html)
# Preserve the original receipts and the separate partner-transfer form.
legacy=(DEST/'index.html').read_text()
legacy=legacy.replace('</head>', '<script>if(!new URLSearchParams(location.search).has("reference")&&new URLSearchParams(location.search).get("view")!=="furong")location.replace("/products.html")</script></head>')
legacy=legacy.replace('</body>', '<script type="application/json" id="catalog-current">'+json.dumps(C['vehicles'],ensure_ascii=False).replace('</','<\\/')+'</script></body>')
for base in [ROOT,DEST]:(base/'legacy-flow.html').write_text(legacy)
public_pages=[]
for lang in ['ko','zh','en']:
    prefix='' if lang=='ko' else '/'+lang
    home=prefix+'/index.html';cat=prefix+'/products.html'
    homes={k:('' if k=='ko' else '/'+k)+'/index.html' for k in ['ko','zh','en']}
    cats={k:('' if k=='ko' else '/'+k)+'/products.html' for k in ['ko','zh','en']}
    publish(home,homepage(lang,C),lang,homes);publish(cat,catalogue(lang,C),lang,cats)
    public_pages.extend([home,cat])
    for record in C.values():
        path=record['paths'][lang]
        if record['pricing']['policy']=='existing_service_form':
            source=DEST/path.lstrip('/')
            html=enhance_existing(source.read_text(),path.lstrip('/'),lang,C,record)
        else:html=detail(record,lang,C)
        publish(path,html,lang,record['paths']);public_pages.append(path)
for alias,anchor in [('sanya-catalog.html','sanya'),('day-tours.html','nearby')]:
    html=catalogue('ko',C).replace('</body>','<script>if(!location.hash)location.replace("/products.html#'+anchor+'")</script></body>')
    publish('/'+alias,html,'ko',{'ko':'/products.html','zh':'/zh/products.html','en':'/en/products.html'})
    public_pages.append('/'+alias)
for lang in ['ko','zh','en']:
    prefix='' if lang=='ko' else '/'+lang
    for old in ['booking.html','multi-booking.html','day-tours.html']:
        path=prefix+'/'+old
        html=catalogue(lang,C).replace('</body>','<script>location.replace("'+prefix+'/products.html"+location.hash)</script></body>')
        publish(path,html,lang,{'ko':'/products.html','zh':'/zh/products.html','en':'/en/products.html'})
for base in [ROOT,DEST]:
    (base/'customer-catalog.json').write_text(json.dumps(C,ensure_ascii=False,separators=(',',':')))
    (base/'catalog-config.mjs').write_text(f"export * from '{ASSET}catalog-config.mjs';\n")
    target=base/ASSET.lstrip('/');target.mkdir(parents=True,exist_ok=True)
    for p in (ROOT/'redesign/src/selections').iterdir():
        if p.is_file():shutil.copy2(p,target/p.name)
    for name in ['chat-handoff.mjs','furong-transfer.mjs','catalog-transfer-rates.mjs']:shutil.copy2(ROOT/'redesign/src'/name,target/name)
    (target/'start.js').write_text("import('"+ASSET+"ui.mjs');\n")
    for name in ['storefront.css','storefront.mjs','home-editorial.css','hierarchy.css','journey.css','journey-view.mjs','catalog-choice.js','tour-config.mjs','catalog-entry.js']:
        text=(ROOT/'redesign/public'/name).read_text().replace('20261113journey',VERSION)
        (base/name).write_text(text)
    (base/'catalog-release.json').write_text(json.dumps({'version':VERSION,'reviewed':'2026-11-14','products':len(C),'pages':public_pages}))
    # Extend the sitemap with every canonical product URL.
    sitemap=base/'sitemap.xml'
    if sitemap.exists():
        text=sitemap.read_text()
        for page in public_pages:
            url='https://localtourchina.com'+page
            if '<loc>'+url+'</loc>' not in text:text=text.replace('</urlset>','<url><loc>'+url+'</loc></url></urlset>')
        sitemap.write_text(text)
print(json.dumps({'reviewed_catalog_version':VERSION,'products':22,'pages':len(public_pages),'private_costs_published':False}))
