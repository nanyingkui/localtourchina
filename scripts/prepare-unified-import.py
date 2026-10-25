"""One-time promotion of non-customer content into the original production project.
Produces idempotent SQL; never imports DEMO bookings, session IDs or customer data.
"""
import json,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HUB=ROOT.parent/'localtourchina-hub'
def prepare():
    rows=[]
    with sqlite3.connect(HUB/'data/hub.sqlite3') as c:
        c.row_factory=sqlite3.Row
        for r in c.execute('select c.*,s.url,s.source_path from content c join sources s on s.id=c.source_id order by c.id'):
            rows.append({'id':r['id'],'kind':r['kind'],'title':r['title'],'summary':r['summary'],'source_url':r['url'],'source_path':r['source_path'],'tags':json.loads(r['tags']),'rights':r['rights'],'data':{}})
        for r in c.execute('select * from routes order by id'):
            rows.append({'id':'route:'+r['id'],'kind':'route','title':r['title'],'summary':'기존 사이트의 참고 일정입니다. 실제 운영과 구성은 출발 전에 확인하세요.','source_url':'https://localtourchina.com/private-tour.html','source_path':r['source_path'],'tags':['zhangjiajie'],'rights':'brand_reference','data':{'days':r['days'],'itinerary':json.loads(r['body'])}})
        for r in c.execute('select * from places order by id'):
            rows.append({'id':'place:'+r['id'],'kind':'place','title':r['name_ko'],'summary':r['name_zh'],'source_url':'https://localtourchina.com/food-map.html' if r['kind']=='food' else 'https://localtourchina.com/travel-info.html','source_path':'legacy place index','tags':[r['kind'],'zhangjiajie'],'rights':'brand_reference','data':{'name_zh':r['name_zh'],'type':r['kind'],'verification_note':'精确入口、坐标与营业状态待核实'}})
    for i,g in enumerate(json.loads((HUB/'reports/gaps.json').read_text())):
        rows.append({'id':f'checklist:launch-{i+1:02d}','kind':'checklist','title':g['area']+'：'+g['missing'],'summary':g['effect'],'source_url':None,'source_path':'localtourchina-hub/reports/gaps.json','tags':[g['priority']],'rights':'owned','data':{'owner':g['who'],'priority':g['priority']}})
    assert len(rows)==121 and len(set(r['id'] for r in rows))==121
    data=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
    assert '$knowledge_seed$' not in data
    sql="""insert into public.knowledge_items(id,kind,title,summary,source_url,source_path,tags,rights,data)
select x.id,x.kind,x.title,x.summary,x.source_url,x.source_path,x.tags,x.rights,x.data
from jsonb_to_recordset($knowledge_seed$"""+data+"""$knowledge_seed$::jsonb)
as x(id text,kind text,title text,summary text,source_url text,source_path text,tags text[],rights text,data jsonb)
on conflict(id) do nothing;
select kind,status,count(*) from public.knowledge_items group by kind,status order by kind,status;
"""
    out=ROOT/'redesign/reports/unified-workspace-seed-20261025.sql';out.write_text(sql)
    print(json.dumps({'content_rows':len(rows),'output':str(out),'customer_rows_imported':0,'demo_orders_imported':0}))
if __name__=='__main__':prepare()
