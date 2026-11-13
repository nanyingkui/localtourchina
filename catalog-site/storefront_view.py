"""Local preview presentation. Product IDs, content and prices remain in site_catalog."""
from pathlib import Path
from html import escape,unescape
import re,json
from catalog_registry import records
from product_view import itinerary,CATALOG
BASE=Path(__file__).resolve().parent
ASSET='/assets/my-selections/20261113journey/'
def w(lang,ko,zh,en):return {'ko':ko,'zh':zh,'en':en}[lang]
def public_catalog():
 catalog={k:v for k,v in records().items() if not v.get('archived')}
 order=['34','45','45furong','56','56fh','trek34','trek45','trek56','forest','tianmen','canyon','furong','fenghuang','sanya-45','sanya-44','sanya-49','sanya-48','tickets','vehicles','local-guide','online-guide','private-tour']
 return dict(sorted(catalog.items(),key=lambda item:order.index(item[0]) if item[0] in order else 999))
def cat_path(lang):return ('/'+lang if lang!='ko' else '')+'/products.html'
def home_path(lang):return '/' if lang=='ko' else '/'+lang+'/index.html'
def group_labels(lang):return dict(zip(['packages','nearby','sanya','services'],w(lang,['후난 · 숙박 투어','후난 · 당일·1박 투어','하이난 · 반일·당일 투어','개별 서비스'],['湖南多日游','湖南短线','海南短线','个别服务'],['Hunan · multi-day tours','Hunan · day & overnight tours','Hainan · half-day & day tours','Individual services'])))
def image_path(record):
 path=record.get('discovery',{}).get('image','')
 if path and not path.startswith('/'):path='/'+path.removeprefix('../').removeprefix('../')
 if path.startswith('/assets') and not (BASE.parent/path.lstrip('/')).is_file():
  path=path.replace('-960.webp','-640.webp')
 return path

def action(record,lang,inquire=False):
 title=escape(record['locales'][lang]['title']);pid=escape(record['id']);path=escape(record['paths'][lang])
 return f'<button class="store-button {"primary" if inquire else "secondary"}" type="button" disabled data-choice="{path}" data-product-id="{pid}" data-title="{title}" {"data-inquire" if inquire else ""}>'+w(lang,'선택 조건으로 문의' if inquire else '내 선택에 담기','按所选条件咨询' if inquire else '加入我的选择','Ask about these choices' if inquire else 'Add to my selections')+'</button>'
def service_icon(key):
 paths={'tickets':'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z M12 7v10','vehicles':'M4 16v-5l2-5h12l2 5v5z M4 11h16 M6 16v2 M18 16v2','local-guide':'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M5 21v-2a7 7 0 0 1 14 0v2','online-guide':'M4 13v-2a8 8 0 0 1 16 0v5a4 4 0 0 1-4 4h-3 M4 12h3v5H4z M17 12h3v5h-3z'}
 return '<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[key]+'"/></svg>'
def channel_button(lang):return '<button type="button" class="store-button contact" data-contact>'+w(lang,'카카오톡 상담','微信咨询','WhatsApp')+'</button>'
def shell(lang,catalog,record=None,page="home"):
 from menu_hierarchy import render_menus
 labels=group_labels(lang)
 links=lambda key:''.join(f'<a href="{escape(r["paths"][lang])}">{escape(r["locales"][lang]["title"])}</a>' for r in catalog.values() if r['discovery']['group']==key)
 groups=''.join(f'<section><h2>{label}</h2>{links(key)}</section>' for key,label in labels.items() if key!='services')
 def language_path(key):return '/?view=furong&lang='+key if page=='furong' else record['paths'][key] if record else cat_path(key) if page=='catalog' else home_path(key)
 languages=''.join(f'<a href="{escape(language_path(key))}" lang="{key}" hreflang="{key}" {"aria-current=page" if key==lang else ""}>{title}</a>' for key,title in [('ko','한국어'),('zh','中文'),('en','EN')])
 return f'''<a class="store-skip" href="#main">{w(lang,'본문으로 바로가기','跳至正文','Skip to content')}</a>
<header class="store-header" data-store-header>
 <div class="store-top"><a class="store-brand" href="{home_path(lang)}"><strong>로투차</strong><span>LOCALTOUR CHINA</span></a>
 <nav class="store-main-nav" aria-label="{w(lang,'주 메뉴','主导航','Main navigation')}">
 <button type="button" data-menu="tour-menu" aria-controls="tour-menu" aria-expanded="false">{w(lang,'투어 상품','Tour 产品','Tours')} <span aria-hidden="true">⌄</span></button>
 <button type="button" data-menu="service-menu" aria-controls="service-menu" aria-expanded="false">{labels['services']} <span aria-hidden="true">⌄</span></button></nav>
 <div class="store-tools"><div data-selection-slot></div>{channel_button(lang)}</div></div>
 <div class="store-utility"><form action="{cat_path(lang)}" role="search"><label class="sr-only" for="site-search">{w(lang,'여행·서비스 검색','搜索路线或服务','Search tours and services')}</label><input id="site-search" type="search" name="q" placeholder="{w(lang,'천문산 입장권, 공항 픽업…','天门山门票、接机…','Tianmen tickets, airport pickup…')}"><button type="submit">{w(lang,'검색','搜索','Search')} <span aria-hidden="true">↗</span></button></form><nav aria-label="Language" class="store-languages">{languages}</nav></div>
 {render_menus(lang,catalog)}
</header>'''
def footer(lang):
 return '<footer class="store-footer-new"><a href="/company.html">'+w(lang,'회사 안내','公司介绍','About us')+'</a><a href="/privacy.html">'+w(lang,'개인정보 안내','隐私说明','Privacy')+'</a><span>로투차 · LOCALTOUR CHINA</span></footer>'
def document(lang,title,main,catalog,record=None,page="home"):
 data='<script type="application/json" id="catalog-current">'+json.dumps(record,ensure_ascii=False).replace('</','<\\/')+'</script>' if record else ''
 home_assets='<link rel="stylesheet" href="/home-editorial.css?v=20261113-a">' if page=='editorial-home' else ''
 body_class='storefront journey-surface homepage-editorial' if page=='editorial-home' else 'storefront journey-surface'
 page_footer=footer(lang)
 if lang!='ko':
  page_footer=page_footer.replace('href="/company.html"','href="/'+lang+'/company.html"').replace('href="/privacy.html"','href="/'+lang+'/privacy.html"')
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+escape(title)+' | 로투차</title><link rel="stylesheet" href="'+ASSET+'style.css"><link rel="stylesheet" href="/storefront.css?v=20261113-contrast1"><script defer data-ltc-selections src="'+ASSET+'start.js"></script><script defer src="/catalog-choice.js"></script><script type="module" src="/storefront.mjs?v=20261113-hierarchy"></script>'+home_assets+'<link rel="stylesheet" href="/journey.css?v=20261113-b"><link rel="stylesheet" href="/hierarchy.css?v=20261113-1"><script type="module" src="/journey-view.mjs?v=20261113-b"></script></head><body class="'+body_class+'">'+shell(lang,catalog,record,page)+data+main+page_footer+'</body></html>'
def product_content(record,lang):
 local=record['locales'][lang];html=local.get('sections','')
 if record['id'] in CATALOG:
  html=re.sub(r'<section id="(?:early|late)">.*?</section>','',html,flags=re.S)
  plan=itinerary(record['id'],lang)
  if lang=='ko':plan=plan.replace('<h4>','<h3>').replace('</h4>','</h3>')
  else:plan=plan.replace('<h2>','<h3>').replace('</h2>','</h3>')
  html='<section class="store-itinerary"><h2>'+w(lang,'일별 일정','逐日行程','Day by day')+'</h2>'+plan+'</section>'+html
 # Contact actions always hand over this product, never a borrowed legacy route.
 html=re.sub(r'<a\b[^>]*href="https://pf.kakao.com/[^\"]*"[^>]*>.*?</a>','',html,flags=re.S)
 return html

def card(record,lang,detail=False):
 local=record['locales'][lang];d=record['discovery'];path=record['paths'][lang];img=image_path(record)
 picture=f'<a class="store-card-image" href="{path}" tabindex="-1" aria-hidden="true"><img src="{img}" alt="" loading="lazy"></a>' if img else ''
 more='<details class="card-details"><summary>'+w(lang,'일정·포함·불포함','行程、包含与不包含','Itinerary, inclusions & exclusions')+'</summary><div class="card-record">'+re.sub(r'<(/?)h([23])>',lambda m:'<'+m[1]+'h'+str(int(m[2])+1)+'>',product_content(record,lang))+'</div></details>' if detail else ''
 search=' '.join([record['id'],d.get('keywords','')]+[v['title'] for v in record['locales'].values()]+list(d['summary'].values()))
 return f'<article class="store-card" data-search="{escape(search)}" data-product-card="{record["id"]}">{picture}<div class="store-card-body"><p class="store-eyebrow">{escape(d["summary"][lang])}</p><h3><a href="{path}">{escape(local["title"])}</a></h3><div class="store-card-actions"><a href="{path}" class="store-text-link">'+w(lang,'상세 일정','查看详情','View details')+' <span aria-hidden="true">↗</span></a>'+action(record,lang)+'</div>'+more+'<p role="status" data-choice-feedback></p></div></article>'

def homepage(lang,catalog):
 from home_editorial import render_home
 return render_home(lang,catalog)

def catalogue(lang,catalog):
 from journey_design import catalogue as render_catalogue
 return render_catalogue(lang,catalog)
def quote_form(record,lang):
 group=record['discovery']['group'];multi=group=='packages';pid=record['id'];w3=lambda a,b,c:w(lang,a,b,c)
 def select(name,label,options):return '<label for="catalog-'+name+'">'+label+'<select id="catalog-'+name+'" name="'+name+'">'+''.join('<option value="'+value+'">'+text+'</option>' for value,text in options)+'</select></label>'
 choose=('',w3('선택해 주세요','请选择','Please choose'))
 modes=[choose,('private',w3('우리 일행 단독','独立出发','Private departure'))]
 if group=='nearby':modes.append(('shared',w3('다른 여행객과 합류 희망','申请拼团','Join a group')))
 fields=select('mode',w3('출발 방식','出发方式','Departure type'),modes)
 fields+='<label for="catalog-party">'+w3('우리 일행 인원','我方同行人数','Guests in our party')+'<input id="catalog-party" name="party" type="number" min="1" max="99" step="1" inputmode="numeric" placeholder="'+w3('인원','人数','Guests')+'"></label>'
 fields+='<label for="catalog-date">'+w3('희망 날짜 (미정이면 비워 두세요)','意向日期（未定可留空）','Preferred date (leave blank if undecided)')+'<input id="catalog-date" name="date" type="date"></label>'
 if multi:fields+=select('arrival',w3('도착 시간','抵达方案','Arrival plan'),[choose,('early',w3('이른 도착','早到','Early arrival')),('late',w3('늦은 도착','晚到','Late arrival'))])
 if multi:fields+=select('departure',w3('출발 항공편','返程航班时段','Departure flight'),[choose,('afternoon',w3('오후 항공편 · 일정 확인 필요','下午航班，需核实游览余量','Afternoon flight · timing check required')),('night',w3('늦은 저녁 항공편','深夜航班','Late-night flight'))])
 if multi or pid=='fenghuang':fields+=select('season',w3('여행 시기','价格适用日期','Travel period'),[choose,('regular',w3('일반 날짜','平日','Regular dates')),('holiday',w3('중국 공휴일·호텔 할증일','中国节假日及酒店加价日','Chinese holidays / hotel surcharge dates'))])
 if multi or pid=='fenghuang':fields+=select('room',w3('객실 구성','房间安排','Room arrangement'),[choose,('standard',w3('2인 1실 · 홀수 1명은 별도 객실','双人一间，奇数余下1人单独一间','Twin sharing; separate room for an unpaired guest')),('extra',w3('추가 객실 요청','需要额外房间','Extra rooms requested'))])
 if pid in ('local-guide','online-guide'):
  def textfield(name,label,kind='text'):
   return '<label for="catalog-'+name+'">'+label+'<input id="catalog-'+name+'" name="'+name+'" type="'+kind+'"></label>'
  fields+=textfield('endDate',w3('마지막 이용일','服务结束日','Last service date'),'date')
  fields+=textfield('servicePlace',w3('미팅 장소·호텔·도시','集合地点、酒店与城市','Meeting place, hotel and city'))
  fields+=select('language',w3('안내 언어','服务语言','Service language'),[choose,('ko',w3('한국어','韩语','Korean')),('zh',w3('중국어','中文','Chinese')),('en',w3('영어 (가능 여부 확인)','英语（待确认）','English (subject to availability)'))])
  if pid=='local-guide':
   fields+=textfield('startTime',w3('하루 시작 시간','每日开始时间','Daily start time'),'time')
   fields+=textfield('endTime',w3('하루 종료 시간','每日结束时间','Daily end time'),'time')
   fields+=select('guideRole',w3('필요한 도움','服务类型','Service type'),[choose,('tour',w3('여행 안내','旅行向导','Tour guiding')),('daily',w3('일상 통역','生活翻译','Everyday interpreting')),('business',w3('비즈니스 통역 (별도 확인)','商务翻译（另核）','Business interpreting (separate quote)'))])
   fields+=textfield('guidePreference',w3('희망 가이드 (선택)','意向导游（选填）','Preferred guide (optional)'))
   fields+=select('transport',w3('교통 준비','交通安排','Transport'),[choose,('own',w3('직접 준비','自行安排','Arranged by us')),('taxi',w3('택시·디디','出租车 / 网约车','Taxi / ride hail')),('request',w3('차량 견적 필요','需要车辆报价','Vehicle quote needed'))])
   fields+=select('tickets',w3('입장권 준비','门票安排','Tickets'),[choose,('own',w3('직접 준비','自行安排','Already arranged')),('request',w3('입장권 견적 필요','需要门票报价','Ticket quote needed'))])
   fields+=select('guideMeals',w3('가이드 식사','导游用餐','Guide meals'),[choose,('provided',w3('일행과 함께 제공','随团提供','Provided with our group')),('quote',w3('식대 포함 견적 요청','需含餐补报价','Include meal allowance in quote'))])
  fields+='<label class="field-wide" for="catalog-serviceScope">'+w3('방문 장소·구체적인 요청 (날짜별로 다르면 함께 기재)','游览地点与具体需求（日期不连续或每天条件不同请注明）','Places and specific help (include non-consecutive dates or different daily arrangements)')+'<textarea id="catalog-serviceScope" name="serviceScope" rows="3" maxlength="1600"></textarea></label>'
 fields+='<label class="field-wide" for="catalog-notes">'+w3('추가 요청 (선택)','补充要求（选填）','Additional requests (optional)')+'<textarea id="catalog-notes" name="notes" rows="2" maxlength="1200"></textarea></label>'
 return '<section id="quote" class="store-quote"><p class="store-eyebrow">YOUR JOURNEY</p><h2>'+w3('이 일정, 조건을 골라 보세요','为这条行程选择条件','Make this journey yours')+'</h2><p>'+w3('날짜·인원·출발 방식을 선택하세요. 아직 정하지 못한 내용은 상담 때 확인할 수 있어요.','选择日期、人数与出发方式，未定的条件可以在咨询时确认。','Choose your dates, party size and departure type. Undecided details can be confirmed during consultation.')+'</p><form data-catalog-form data-product-id="'+pid+'"><div class="store-fields">'+fields+'</div><button class="store-button primary" type="submit">'+w3('조건별 요금 확인','查看所选条件价格','Check reference price')+'</button><p data-quote-status role="status" hidden></p><div class="store-quote-actions">'+action(record,lang)+action(record,lang,True)+'</div><p id="choice-status" data-choice-feedback role="status"></p></form><p class="store-fine">'+w3('확정 전 참고 견적 · 결제나 예약 확정은 상담 후 진행합니다.','当前为参考报价；付款及预订确认在客服沟通后进行。','Reference quote only. Payment and booking confirmation follow consultation.')+'</p></section><script type="module" src="/tour-config.mjs"></script>'
def detail(record,lang,catalog):
 from journey_design import detail as render_detail
 return render_detail(record,lang,catalog)

def enhance_existing(html,name,lang,catalog,record=None):
 from service_cost_review import apply_service_review
 html=apply_service_review(html,lang)
 # Keep legacy service calculators and their input IDs intact.
 html=re.sub(r'<(?:script|link)\b[^>]*(?:src|href)="/?assets/my-selections/[^" ]+"[^>]*>(?:</script>)?','',html,flags=re.I)
 html=re.sub(r'<a[^>]*class="[^"]*skip[^"]*"[^>]*>.*?</a>','',html,flags=re.S)
 header=shell(lang,catalog,record,'furong' if name=='legacy-flow' and record and record['id']=='vehicles' else 'home')
 html=re.sub(r'(<html\b[^>]*lang=")[^"]*',lambda m:m[1]+('zh-CN' if lang=='zh' else lang),html,count=1)
 html=re.sub(r'(<body\b[^>]*>)',lambda m:m[0]+header,html,count=1,flags=re.I)
 if '<body' not in html:html='<body>'+header+html+'</body>'
 html=re.sub(r'<body\b', '<body data-store-legacy',html,count=1)
 html=re.sub(r'(<main\b)([^>]*)(>)',lambda m:m[1]+re.sub(r'\bid="[^"]*"','',m[2])+' id="main" tabindex="-1"'+m[3],html,count=1)
 if record:
  data='<script type="application/json" id="catalog-current">'+json.dumps(record,ensure_ascii=False).replace('</','<\\/')+'</script>'
  html=html.replace('</body>',data+'</body>')
  service={'tickets':'ticket','vehicles':'vehicle','local-guide':'guide','online-guide':'onlineguide','private-tour':'private'}.get(record['id'])
  if service:
   panel='<section class="store-service-record store-record" data-record-id="'+record['id']+'">'+record['locales'][lang]['sections']+'<div class="store-quote-actions">'+action(record,lang)+'</div><p id="choice-status" data-choice-feedback role="status"></p></section>'
   pattern=r'(<section[^>]*id="service-'+service+r'"[^>]*>.*?</h1>)'
   html,n=re.subn(pattern,lambda m:m[1]+panel,html,count=1,flags=re.S)
   if not n:html=html.replace('</main>',panel+'</main>',1)
 # The source selection modules are served directly by the local preview server.
 assets='<link rel="stylesheet" href="'+ASSET+'style.css"><script defer data-ltc-selections src="'+ASSET+'start.js"></script>' if ASSET+'start.js' not in html else ''
 assets+='<link rel="stylesheet" href="/storefront.css?v=20261113-contrast1"><script defer src="/catalog-choice.js"></script><script type="module" src="/storefront.mjs?v=20261113-hierarchy"></script>'
 assets+='<link rel="stylesheet" href="/journey.css?v=20261113-b"><link rel="stylesheet" href="/hierarchy.css?v=20261113-1"><script type="module" src="/journey-view.mjs?v=20261113-b"></script>'
 return html.replace('</head>',assets+'</head>',1)
def storefront(html,name,lang,query=None):
 catalog=public_catalog();record=next((r for r in catalog.values() if r['paths'].get(lang)=='/'+name),None)
 if name in ('','index.html','zh/index.html','en/index.html'):return homepage(lang,catalog)
 if name in ('products.html','zh/products.html','en/products.html','sanya-catalog.html','day-tours.html'):return catalogue(lang,catalog)
 if record and record['pricing']['policy']!='existing_service_form':return detail(record,lang,catalog)
 if name=='legacy-flow' and (query or {}).get('view')==['furong']:record=catalog['vehicles']
 return enhance_existing(html,name,lang,catalog,record)
