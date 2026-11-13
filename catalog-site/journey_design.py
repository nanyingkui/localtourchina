"""Purpose-specific local presentation, using the unchanged canonical catalogue."""
from html import escape
from html.parser import HTMLParser
import re

class Fragment(HTMLParser):
    """Flatten structural wrappers only, keeping all product text and inline markup."""
    def __init__(self):
        super().__init__(convert_charrefs=False);self.out=[]
    def handle_starttag(self,tag,attrs):
        if tag not in ('section','article','div'):self.out.append(self.get_starttag_text())
    def handle_endtag(self,tag):
        if tag not in ('section','article','div'):self.out.append('</'+tag+'>')
    def handle_data(self,data):self.out.append(data)
    def handle_entityref(self,name):self.out.append('&'+name+';')
    def handle_charref(self,name):self.out.append('&#'+name+';')

def chunks(html):
    parser=Fragment();parser.feed(html);flat=''.join(parser.out)
    parts=re.split(r'<h2\b[^>]*>(.*?)</h2>',flat,flags=re.S)
    result=[]
    if parts[0].strip():result.append(('',parts[0]))
    result.extend((parts[i],parts[i+1]) for i in range(1,len(parts)-1,2))
    merged=[]
    pending=''
    for heading,body in result:
        if not body.strip():pending+=(heading+' · ');continue
        merged.append((pending+heading,body));pending=''
    if pending:merged.append((pending.rstrip(' · '),''))
    return merged

def scenic_for(text):
    rules=[(r'부용|芙蓉|Furong','furong-town-jpg-960.webp'),(r'봉황|凤凰|Fenghuang','fenghuang-jpg-960.webp'),(r'대협곡|大峡谷|Grand Canyon','canyon-bridge-wide-jpg-960.webp'),(r'천문|天门|Tianmen','tianmen-cliff-jpg-960.webp'),(r'원가계|국가삼림|天子|袁家|Forest|Yuanjiajie|Tianzi','forest-east-jpg-960.webp')]
    for pattern,name in rules:
        if re.search(pattern,text,re.I):return '/assets/media/attractions/'+name
    return ''

def timeline(html,multi,lang):
    def ordered(m):
        count=0
        def step(li):
            nonlocal count;count+=1
            pic=scenic_for(li[1]);photo=f'<img class="jd-step-photo" src="{pic}" alt="" loading="lazy">' if pic and multi else ''
            label=('Day '+str(count)) if multi else str(count).zfill(2)
            return '<li><span class="jd-step-number">'+label+'</span><div class="jd-step-copy">'+li[1]+photo+'</div></li>'
        return '<ol class="jd-timeline">'+re.sub(r'<li\b[^>]*>(.*?)</li>',step,m[1],flags=re.S)+'</ol>'
    return re.sub(r'<ol\b[^>]*>(.*?)</ol>',ordered,html,flags=re.S)

def contents(record,lang):
    from storefront_view import product_content,w
    t=lambda a,b,c:w(lang,a,b,c);multi=record['discovery']['group']=='packages'
    pieces=[];itinerary_done=False;terms_started=False
    for index,(heading,body) in enumerate(chunks(product_content(record,lang))):
        if not heading:pieces.append(body);continue
        is_plan=bool(re.search(r'일정|行程|itinerary|day by day|arrival|早到|晚到',heading,re.I)) and ('<ol' in body or '<h3' in body)
        if is_plan:
            anchor='itinerary' if not itinerary_done else 'itinerary-'+str(index);itinerary_done=True
            variants=re.split(r'<h3\b[^>]*>(.*?)</h3>',body,flags=re.S)
            if len(variants)>=5 and all(re.search(r'도착|arrival|早到|晚到',variants[i],re.I) for i in range(1,len(variants),2)):
                tabs='<div class="jd-arrival-tabs" role="tablist" aria-label="'+t('도착별 일정','抵达方案','Arrival plans')+'">'+''.join(f'<button type="button" role="tab" id="plan-tab-{key}" aria-controls="plan-{key}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}" data-plan="{key}">{variants[1+i*2]}</button>' for i,key in enumerate([p['key'] for p in record.get('plans',[])] or ['early','late']))+'</div>'
                body=variants[0]+tabs+''.join(f'<div id="plan-{key}" role="tabpanel" aria-labelledby="plan-tab-{key}" {"hidden" if i else ""}>'+timeline(variants[2+i*2],multi,lang)+'</div>' for i,key in enumerate([p['key'] for p in record.get('plans',[])] or ['early','late']))
            else:body=timeline(body,multi,lang)
            pieces.append(f'<section class="jd-itinerary" id="{anchor}"><h2>{heading}</h2>{body}</section>')
        else:
            includes=bool(re.search(r'포함|包含|included|inclusions|exclusions|별도|不包含',heading,re.I))
            anchor='included' if includes and not terms_started else 'detail-section-'+str(index)
            if includes:terms_started=True
            pieces.append(f'<section class="jd-information {"jd-included" if includes else ""}" id="{anchor}"><h2>{heading}</h2>{body}</section>')
    if not terms_started:
        pieces.append('<section class="jd-information jd-included" id="included"><h2>'+t('포함·별도 비용','包含与不包含','Inclusions and extras')+'</h2><p>'+t('확인 중입니다. 포함 항목과 별도 비용은 상담 후 최종 견적서에서 확인해 주세요.','待确认。包含项与另付费用，请以客服确认后的最终报价为准。','To be confirmed. Please check inclusions and separate expenses in your final quote.')+'</p></section>')
    return ''.join(pieces)

def catalogue(lang,catalog):
    from storefront_view import w,card,action,service_icon,channel_button,document,group_labels,cat_path
    t=lambda a,b,c:w(lang,a,b,c);labels=group_labels(lang)
    nav='<button type="button" data-category="all" aria-pressed="true">'+t('전체','全部','All')+f'<span>{len(catalog)}</span></button>'
    groups=''
    for key,label in labels.items():
        rs=[r for r in catalog.values() if r['discovery']['group']==key]
        nav+=f'<button type="button" data-category="{key}" aria-pressed="false">{label}<span>{len(rs)}</span></button>'
        cards=''
        for r in rs:
            if key!='services':cards+=card(r,lang);continue
            icon=service_icon(r['id']) if r['id']!='private-tour' else '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 17h16M8 3v8M16 13v8"/></svg>'
            search=escape(' '.join([r['id'],r['discovery'].get('keywords','')]+[v['title'] for v in r['locales'].values()]+list(r['discovery']['summary'].values())))
            cards+=f'<article class="jd-service-card" data-search="{search}" data-product-card="{r["id"]}"><span class="jd-service-icon">{icon}</span><div><h3><a href="{r["paths"][lang]}">{escape(r["locales"][lang]["title"])}</a></h3><p>{escape(r["discovery"]["summary"][lang])}</p></div><div class="jd-service-actions"><a class="store-text-link" href="{r["paths"][lang]}">'+t('옵션 살펴보기','查看服务选项','Explore options')+'</a>'+action(r,lang)+'</div><p data-choice-feedback role="status"></p></article>'
        groups+=f'<section class="store-catalog-group" id="{key}"><div class="jd-group-heading"><h2>{label}</h2><span>{len(rs)}'+t('개 상품','个项目',' options')+'</span></div><div class="'+('jd-service-list' if key=='services' else 'store-grid')+'">'+cards+'</div></section>'
    main=f'''<main id="main" class="jd-catalog jd-container" tabindex="-1"><div class="jd-catalog-title"><h1>{t('어떤 여행을<br>찾고 계세요?','想找一场<br>怎样的旅行？','Find your kind<br>of journey.')}</h1><div><p>{t('여행 전체도, 필요한 서비스 하나도.<br>조건을 고르면 요금을 확인할 수 있어요.','一段完整旅程，或一项需要的服务。<br>选择出行条件后查看报价。','A whole journey, or one helpful service.<br>Choose your travel conditions to see a quote.')}</p><a class="jd-quiet-link" href="#my-trip-selections">{t('담아 둔 여행 보기','查看我的选择','Review saved choices')} ↗</a></div></div>
    <div class="jd-catalog-layout"><aside class="jd-filters"><h2>{t('여행 찾기','查找产品','Browse')}</h2><nav aria-label="{t('상품 분류','商品分类','Product categories')}">{nav}</nav><div class="jd-filter-help"><p>{t('아직 정하지 못했나요?','还没决定？','Still deciding?')}</p>{channel_button(lang)}</div></aside>
    <div class="jd-results"><div class="catalog-find"><label for="catalog-search">{t('가고 싶은 곳이나 필요한 서비스를 검색하세요','搜索想去的景点或需要的服务','Search a place or service')}</label><div class="jd-search-row"><input id="catalog-search" type="search" placeholder="{t('천문산, 부용진, 공항 픽업…','天门山、芙蓉镇、机场接送…','Tianmen, Furong, airport pickup…')}"><button type="button" data-clear-search>{t('초기화','重置','Reset')}</button></div><p id="catalog-search-status" role="status" aria-live="polite"></p><div id="catalog-options"></div><div id="catalog-empty" hidden><h2>{t('다른 검색어로 찾아볼까요?','换个关键词试试？','Try another search?')}</h2><p>{t('필요한 것을 말씀해 주셔도 좋아요.','也可以直接告诉我们您的需求。','You can also tell us what you need.')}</p>{channel_button(lang)}</div></div><div id="all-catalog">{groups}</div></div></div></main>'''
    return document(lang,t('여행 상품','旅行产品','Tours and services'),main,catalog,page='catalog')

def detail(record,lang,catalog):
    from storefront_view import w,image_path,action,document,quote_form,cat_path,group_labels,home_path
    t=lambda a,b,c:w(lang,a,b,c);group=record['discovery']['group'];multi=group=='packages';title=escape(record['locales'][lang]['title']);img=image_path(record)
    return_link=cat_path(lang)+'#'+group
    hero=f'<figure class="jd-detail-photo"><img src="{img}" alt="{title}" fetchpriority="high"></figure>' if img else ''
    nav=f'<nav class="jd-detail-nav" aria-label="{t("상품 내용","产品内容","On this page")}"><a href="#itinerary">{t("여행 일정","行程安排","Itinerary")}</a><a href="#included">{t("포함·별도 비용","包含与不包含","Inclusions & extras")}</a><a href="#quote">{t("조건·견적","条件与报价","Your quote")}</a></nav>'
    main=f'''<main id="main" class="jd-detail jd-container {'jd-multi' if multi else 'jd-short'}" tabindex="-1"><nav class="store-breadcrumb"><a href="{return_link}">← {group_labels(lang)[group]}</a></nav><section class="jd-detail-intro"><div><p class="jd-detail-summary">{escape(record['discovery']['summary'][lang])}</p><h1>{title}</h1><div class="jd-detail-actions"><a class="store-button primary" href="#quote">{t('내 일정으로 견적 보기','选择条件并询价','Build my quote')}</a>{action(record,lang)}</div><p data-choice-feedback role="status"></p></div>{hero}</section>{nav}<div class="jd-detail-layout"><article class="store-record jd-product-copy" data-record-id="{record['id']}">{contents(record,lang)}</article><aside class="jd-quote-rail">{quote_form(record,lang)}</aside></div><section class="jd-detail-end"><h2>{t('다른 여행도 살펴보세요','也看看其他行程','Keep exploring')}</h2><a class="store-button secondary" href="{return_link}">{t('여행 목록으로','返回产品列表','Back to tours')}</a><a class="jd-quiet-link" href="#my-trip-selections">{t('내 선택 확인','查看我的选择','Review my selections')} ↗</a></section></main>'''
    return document(lang,record['locales'][lang]['title'],main,catalog,record,page='detail')
