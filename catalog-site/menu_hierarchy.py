"""Navigation presentation only; every item refers to the canonical catalogue."""
from html import escape

def render_menus(lang, catalog):
    from storefront_view import product_path
    def t(ko,zh,en):return {'ko':ko,'zh':zh,'en':en}[lang]
    browse=('' if lang=='ko' else '/'+lang)+'/products.html'
    def group(key,title,items):
        links=''.join('<a href="'+escape(product_path(r,lang))+'" data-menu-product="'+escape(r['id'])+'">'+escape(r['locales'][lang]['title'])+'</a>' for r in items)
        return f'<details class="menu-group" id="menu-group-{key}" open><summary><span>{title}</span><small>{len(items)}</small><span class="menu-toggle" aria-hidden="true">+</span></summary><div class="menu-group-links">{links}</div></details>'
    multi=[r for r in catalog.values() if r['discovery']['group']=='packages' and not r['id'].startswith('trek')]
    trek=[r for r in catalog.values() if r['id'].startswith('trek')]
    nearby=[r for r in catalog.values() if r['discovery']['group']=='nearby']
    hainan=[r for r in catalog.values() if r['discovery']['group']=='sanya']
    close='<button type="button" class="menu-dismiss" data-menu-close aria-label="'+t('메뉴 닫기','关闭菜单','Close navigation')+'">'+t('닫기','关闭','Close')+' <span aria-hidden="true">×</span></button>'
    tour=f'''<div id="tour-menu" class="store-menu hierarchy-menu" hidden>
      <div class="menu-topline"><strong>{t('투어 상품','Tour 产品','Tours')}</strong><a href="{browse}">{t('전체 여행 보기','查看全部行程','Browse all tours')} ↗</a>{close}</div>
      <div class="menu-regions">
        <section class="menu-region menu-hunan" aria-labelledby="menu-hunan-title"><div class="menu-region-head"><h2 id="menu-hunan-title">{t('후난','湖南','Hunan')}</h2><p>{t('장가계 · 부용진 · 봉황고성','张家界 · 芙蓉镇 · 凤凰古城','Zhangjiajie · Furong · Fenghuang')}</p></div>
          <div class="menu-hunan-groups">{group('multi',t('숙박 투어','多日游','Multi-day tours'),multi)}{group('trek',t('트레킹 투어','徒步行程','Trekking tours'),trek)}{group('nearby',t('당일·1박 투어','一日与两日游','Day & overnight tours'),nearby)}</div>
        </section>
        <section class="menu-region menu-hainan" aria-labelledby="menu-hainan-title"><div class="menu-region-head"><h2 id="menu-hainan-title">{t('하이난','海南','Hainan')}</h2><p>{t('싼야 · 열대우림 · 온천','三亚 · 雨林 · 温泉','Sanya · Rainforest · Hot springs')}</p></div>{group('hainan',t('반일·당일 투어','半日与一日游','Half-day & day tours'),hainan)}</section>
      </div>
      <div class="menu-bottom"><span>{t('이름을 알고 있다면 더 빠르게','已有目标？直接搜索','Already have something in mind?')}</span><a href="{browse}#catalog-search">{t('여행·서비스 검색','搜索产品与服务','Search tours & services')} ↗</a></div>
    </div>'''
    service_groups=[(t('공항·역 이동','机场与车站接送','Airport & station transfers'),['airport-pickup','airport-dropoff','station-transfer']),(t('차량·구간 이동','包车与线路接送','Cars & regional transfers'),['day-charter','vehicles:furong-transfer','vehicles:fenghuang-transfer','vehicles:changsha-transfer','vehicles']),(t('입장권·여행 도움','门票与旅行协助','Tickets & travel assistance'),['tickets','local-guide','online-guide','private-tour'])]
    sections=''
    for index,(title,keys) in enumerate(service_groups):
        links=''
        for key in keys:
            if key not in catalog:continue
            r=catalog[key]
            links+='<a class="menu-service-item" data-menu-product="'+key+'" href="'+escape(r['paths'][lang])+'"><span>'+escape(r['locales'][lang]['title'])+'</span><small>'+escape(r['discovery']['summary'][lang])+'</small><b aria-hidden="true">↗</b></a>'
        sections+='<section class="menu-service-group"><h2>'+title+'</h2>'+links+'</section>'
    service='<div id="service-menu" class="store-menu hierarchy-menu hierarchy-services" hidden><div class="menu-topline"><strong>'+t('개별 서비스','个别服务','Individual services')+'</strong><a href="'+browse+'#services">'+t('서비스 전체 보기','查看全部服务','Browse all services')+' ↗</a>'+close+'</div><div class="menu-services-grid">'+sections+'</div></div>'
    return tour+service
