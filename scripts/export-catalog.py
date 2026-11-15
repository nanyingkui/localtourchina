"""Explicit export of the canonical private store; never package the SQLite file as an asset."""
import hashlib,json,os,sys,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'server'))
from public_catalog import project
db=os.environ.get('LTC_CATALOG_DB')
if not db:raise SystemExit('Set LTC_CATALOG_DB to the canonical product database before building. Stale snapshots are not accepted.')
with sqlite3.connect('file:'+str(Path(db).resolve())+'?mode=ro',uri=True) as con:
    rows={k:json.loads(v) for k,v in con.execute('SELECT id,payload FROM site_catalog')}
    costs=json.loads(con.execute("SELECT payload FROM product_cost_rules WHERE product_id='34'").fetchone()[0])
assert rows and all(set(r['locales'])=={'ko','zh','en'} and key==r['id'] for key,r in rows.items())
assert len({p for r in rows.values() for p in r['paths'].values()})==len(rows)*3,'Duplicate product paths'
assert rows['34']['pricing']['pricingRevision']==costs['revision'],'Cost/public pricing revision mismatch'
assert len(rows['34']['pricing']['hotelOptions'])==len(costs['hotels'])
snapshot=json.dumps(project(rows,include_archived=True),ensure_ascii=False,indent=2)+'\n'
target=ROOT/'catalog-site/catalog.json';temp=target.with_suffix('.tmp');temp.write_text(snapshot);temp.replace(target)
(ROOT/'catalog-site/export-manifest.json').write_text(json.dumps({'sha256':hashlib.sha256(snapshot.encode()).hexdigest(),'productCount':len(rows),'pricingRevision34':costs['revision'],'hotelCount34':len(costs['hotels'])},indent=2))
print(f'Exported {len(rows)} canonical products; private cost records excluded.')
