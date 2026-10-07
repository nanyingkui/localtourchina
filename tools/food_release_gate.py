"""Fail closed before publishing a NEW venue. Run with proposal JSON and --root."""
import argparse,json,pathlib,hashlib,re,unicodedata,sys

def key(s):return re.sub(r'[^a-z0-9\u3400-\u9fff]','',unicodedata.normalize('NFKC',s).lower())
def check(item,root,ledger):
 errors=[]
 if any(key(item.get('chinese',''))==key(x['venue']) for x in ledger):errors.append('previously_published: use correction workflow, not new quota')
 for name in ['chinese','address','source','checkedAt','region','budgetSource','mapEvidence','feasibilityReview']:
  if not item.get(name):errors.append('missing '+name)
 if item.get('region') not in ['zhangjiajie','sanya']:errors.append('unsupported region requires explicit board mapping')
 if item.get('menuId') != {'zhangjiajie':3,'sanya':41}.get(item.get('region')):errors.append('wrong regional board')
 seen=set();roles=set()
 for photo in item.get('images',[]):
  f=root/photo.get('src',''); roles.add(photo.get('role'))
  if not f.is_file():errors.append('missing image file');continue
  digest=hashlib.sha256(f.read_bytes()).hexdigest()
  if digest in seen:errors.append('duplicate image bytes')
  seen.add(digest)
  for field in ['source','author','capturedAt','branch','role','visualReview']:
   if not photo.get(field):errors.append('image missing '+field)
  if photo.get('width',0)<800:errors.append('image too small')
 if len(seen)<8:errors.append('fewer than 8 distinct photos')
 if not {'exterior','interior','product'}.issubset(roles):errors.append('missing exterior/interior/product coverage')
 if item.get('mapType') not in ['verified_poi','explicit_search']:errors.append('map type must distinguish POI from search')
 return sorted(set(errors))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('proposal');p.add_argument('--root',default=str(pathlib.Path(__file__).resolve().parents[1]));args=p.parse_args();root=pathlib.Path(args.root);ledger=json.loads((root/'src/published-food-content.json').read_text())['entries'];item=json.loads(pathlib.Path(args.proposal).read_text());errors=check(item,root,ledger);print(json.dumps({'pass':not errors,'errors':errors},ensure_ascii=False,indent=2));sys.exit(bool(errors))
