"""Homepage presentation only. All sellable records still come from site_catalog."""
from html import escape
import re


def render_home(lang, catalog):
    from storefront_view import (w, card, action, image_path, service_icon,
                                 cat_path, channel_button, document, BASE)
    t = lambda ko, zh, en: w(lang, ko, zh, en)
    browse = cat_path(lang)
    arrow = '<svg class="home-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>'
    heading = t('산과 바다 사이,<br>우리다운 여행.', '山海之间，<br>按自己的节奏。', 'Mountains. Sea.<br>Your own pace.')
    service_labels = {
        'tickets': t('입장권', '景区门票', 'Tickets'),
        'vehicles': t('공항 픽업·차량', '接送与包车', 'Transfers & cars'),
        'local-guide': t('현지 가이드', '当地导游', 'Local guides'),
        'online-guide': t('온라인 여행지원', '线上旅行支持', 'Online support'),
        'private-tour': t('맞춤 여행', '定制旅行', 'Tailor-made travel'),
    }
    services = ''
    for key, label in service_labels.items():
        icon = service_icon(key) if key != 'private-tour' else '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6M16 14v6"/></svg>'
        services += f'<a href="{catalog[key]["paths"][lang]}">{icon}<span>{label}</span>{arrow}</a>'
    recommended = ''.join(card(catalog[key], lang, True) for key in ['34', '45', '45furong'])

    def short_card(key, featured=False):
        r = catalog[key]
        title, path = escape(r['locales'][lang]['title']), r['paths'][lang]
        return f'''<article class="home-short-card {'home-short-featured' if featured else ''}" data-product-card="{key}">
          <a class="home-photo" href="{path}" tabindex="-1" aria-hidden="true"><img src="{image_path(r)}" alt="" loading="lazy" width="960" height="720"></a>
          <div class="home-short-copy"><h3><a href="{path}">{title}</a></h3><p>{escape(r['discovery']['summary'][lang])}</p>
          <div class="home-short-actions"><a href="{path}" class="home-link">{t('일정 보기','查看行程','View itinerary')}{arrow}</a>{action(r,lang)}</div><p data-choice-feedback role="status"></p></div>
        </article>'''

    main = f'''<main id="main" class="home-editorial" tabindex="-1">
      <section class="home-hero home-container" aria-labelledby="home-title">
        <div class="home-hero-copy"><p class="home-intro">{t('후난과 하이난, 현지에서 만나는 중국','湖南与海南，从当地看中国','Hunan & Hainan, through local eyes')}</p>
        <h1 id="home-title">{heading}</h1>
        <div class="home-hero-bottom"><p>{t('장가계의 산길에서 싼야의 해변까지.<br>보고 싶은 풍경과 머물고 싶은 순간을<br>당신의 속도로 만나세요.','从张家界的山间，到三亚的海岸。<br>去看向往的风景，<br>也为喜欢的日常停留。','From the peaks of Zhangjiajie to the shores of Sanya. Make room for the places, and the moments, you want to linger in.')}</p>
        <div class="home-hero-actions"><a class="store-button primary" href="#trips">{t('추천 여행 살펴보기','探索精选行程','Explore our journeys')}{arrow}</a><button class="home-link" type="button" data-contact>{t('여행 상담하기','聊聊我的旅行','Talk about your trip')}{arrow}</button></div></div></div>
        <figure class="home-hero-photo"><img src="/editorial/peaks.webp" width="1600" height="819" alt="{t('구름 사이로 솟은 장가계의 산봉우리','云雾间的张家界峰林','Zhangjiajie peaks rising through the clouds')}" fetchpriority="high"><figcaption><span>{t('장가계, 후난','张家界，湖南','Zhangjiajie, Hunan')}</span><a href="{browse}#packages">{t('이곳으로 떠나기','探索这里','Explore this place')}{arrow}</a></figcaption></figure>
      </section>

      <section id="services" class="home-services home-container" aria-labelledby="home-services-title"><h2 id="home-services-title">{t('필요한 서비스만,<br>바로 찾아보세요.','只选需要的服务，<br>从这里开始。','Just the service<br>you need.')}</h2><div>{services}</div></section>

      <section id="destinations" class="home-destinations home-container home-section" aria-labelledby="destinations-title">
        <div class="home-section-head"><h2 id="destinations-title">{t('어떤 풍경에<br>머물고 싶으세요?','想在哪一种<br>风景里停留？','Where would you<br>like to linger?')}</h2><p>{t('산과 오래된 마을, 바다와 열대의 숲.<br>서로 다른 두 지역에서 여행을 시작해 보세요.','山峦与古镇，海岸与雨林。<br>从并列的两个目的地，找到你的旅行。','Mountains and old towns. Coastlines and rainforest.<br>Two regions, each with a different story.')}</p></div>
        <div class="home-destination-grid">
          <article class="home-destination hunan"><a class="home-photo" href="{browse}#packages"><img src="/assets/media/attractions/forest-east-jpg-960.webp" width="960" height="798" alt="{t('후난 장가계의 숲과 바위산','湖南张家界的峰林','The forested sandstone peaks of Hunan')}" loading="lazy"></a><div class="home-destination-title"><h3><a href="{browse}#packages">{t('후난','湖南','Hunan')}</a></h3><span>{t('장가계 · 부용진 · 봉황고성','张家界 · 芙蓉镇 · 凤凰古城','Zhangjiajie · Furong · Fenghuang')}</span></div><p>{t('산봉우리 사이를 걷고, 오래된 강변 마을의 밤을 만나요.','走进峰林，也在古镇的河岸边等待夜色。','Walk among the peaks, then watch the old riverside towns light up.')}</p><div class="home-destination-links"><a class="home-link" href="{browse}#packages">{t('숙박 투어','多日游','Multi-day tours')}{arrow}</a><a class="home-link" href="{browse}#nearby">{t('당일·1박 투어','一日及两日游','Day & overnight tours')}{arrow}</a></div></article>
          <article class="home-destination hainan"><a class="home-photo" href="{browse}#sanya"><img src="/photos/sun-bay.jpg" width="1920" height="1280" alt="{t('하이난 싼야의 푸른 바다와 야자수','海南三亚的海湾与椰林','Sanya bay and palm trees in Hainan')}" loading="lazy"></a><div class="home-destination-title"><h3><a href="{browse}#sanya">{t('하이난','海南','Hainan')}</a></h3><span>{t('싼야 · 열대우림 · 온천','三亚 · 雨林 · 温泉','Sanya · Rainforest · Hot springs')}</span></div><p>{t('바닷바람을 따라, 열대우림과 온천이 있는 하루로.','沿着海风出发，在雨林与温泉之间度过一天。','Follow the sea breeze to a day of rainforest walks and hot springs.')}</p><a class="home-link" href="{browse}#sanya">{t('하이난 여행 살펴보기','探索海南行程','Explore Hainan')}{arrow}</a></article>
        </div>
      </section>

      <section id="trips" class="home-journeys home-container home-section" aria-labelledby="trips-title"><div class="home-section-head"><div><p class="home-section-note">{t('장가계에서 시작하는 여행','从张家界开始的旅行','Begin in Zhangjiajie')}</p><h2 id="trips-title">{t('며칠을 머물러도,<br>기억에 남을 장면들.','住上几天，<br>留下难忘的画面。','A few days away.<br>Much to remember.')}</h2></div><div><p>{t('일정과 포함 사항을 살펴보고,<br>인원과 출발 조건에 맞는 요금을 확인하세요.','先看行程与包含项，<br>选择人数和出发条件后查看价格。','Explore the itinerary and inclusions.<br>Select your party and travel conditions to see a price.')}</p><a class="home-link" href="{browse}#packages">{t('숙박 투어 전체 보기','查看全部多日游','All multi-day tours')}{arrow}</a></div></div><div class="store-grid home-journey-grid">{recommended}</div></section>

      <section id="day-trips" class="home-short home-container home-section" aria-labelledby="short-title"><div class="home-section-head"><h2 id="short-title">{t('하루, 혹은 하룻밤.<br>또 다른 풍경으로.','一天，或一夜。<br>换一种风景。','A day. An overnight stay.<br>A different scene.')}</h2><div><p>{t('장가계와 주변 지역의 다섯 가지 짧은 여행.','张家界及周边，五条短途行程。','Five short journeys in Zhangjiajie and beyond.')}</p><a class="home-link" href="{browse}#nearby">{t('짧은 여행 비교하기','比较短途路线','Compare short tours')}{arrow}</a></div></div><div class="home-short-grid">{short_card('furong',True)}<div class="home-short-tiles">{''.join(short_card(k) for k in ['forest','tianmen','canyon','fenghuang'])}</div></div></section>

      <section class="home-story home-section" aria-labelledby="story-title"><div class="home-container"><div class="home-section-head"><h2 id="story-title">{t('풍경 너머,<br>그곳의 일상까지.','风景之外，<br>还有当地的日常。','Beyond the view,<br>everyday life.')}</h2><p>{t('시장 골목의 아침, 강변의 느린 걸음.<br>어떤 여행을 하고 싶은지 들려주세요.','集市街巷的早晨，河岸边缓慢的脚步。<br>告诉我们，你向往怎样的旅行。','A morning market. A slow walk beside the river.<br>Tell us what you want your journey to feel like.')}</p></div><figure><img src="/editorial/market.webp" width="1600" height="900" alt="{t('강변 마을의 시장과 일상을 담은 풍경','河畔集市与当地生活的场景','A riverside market and everyday village life')}" loading="lazy"></figure></div></section>

      <section class="home-promise home-container" aria-labelledby="promise-title"><h2 id="promise-title">{t('현지에서 직접 챙길 수 있는 곳에서만 여행합니다','只做当地团队能亲自照应的旅行','We only offer journeys where our local team can look after you in person.')}</h2><div><p>{t('비행기가 늦거나 일정이 갑자기 바뀌면, 다음에 어디로 가야 할지부터 막막하잖아요. 그럴 때 로투차 팀이 직접 다음 일정을 챙겨드립니다.','航班延误，或行程突然改变时，连下一步该去哪里都可能让人不知所措。这时，罗途查团队会亲自帮您安排接下来的行程。','When a flight is delayed or plans suddenly change, even knowing where to go next can feel overwhelming. That’s when the LocalTourChina team steps in to take care of what comes next.')}</p><p>{t('여행 중 쇼핑 매장에 들르지 않습니다. 유료 선택관광도 진행하지 않습니다. 여행을 준비하는 비용과 가이드가 일한 대가는 처음부터 여행비에 담고, 따로 드는 비용은 출발 전에 알려드립니다.','旅行中不安排购物店，也不安排付费自选游览项目。行程筹备费用与导游服务报酬从一开始就计入旅行费用；需要另外支付的费用，会在出发前说明。','We do not make shopping-store stops or offer paid optional excursions. Trip preparation and guide compensation are included in the trip price from the start. Any separate expenses are explained before departure.')}</p><p><strong>{t('좋은 풍경 앞에서, 마음 편히 조금 더 머물다 가세요.','在美好的风景前，安心地多停留一会儿。','Stay a little longer in a beautiful place, with peace of mind.')}</strong></p></div></section>

      <section class="home-contact home-container" aria-labelledby="contact-title"><div><p class="home-section-note">{t('당신의 여행을 함께 준비합니다','一起准备你的旅行','Let’s plan your journey')}</p><h2 id="contact-title">{t('어디서부터 시작할까요?','我们从哪里开始？','Where shall we begin?')}</h2><p>{t('마음에 드는 여행을 담아 두세요.<br>날짜와 인원을 알려 주시면 함께 구체화할게요.','把喜欢的行程加入清单。<br>告诉我们日期与人数，一起把想法变成具体安排。','Save the journeys you like.<br>Share your dates and party size, and we’ll work through the details together.')}</p></div><div class="home-contact-actions">{channel_button(lang)}<a class="home-link" href="#my-trip-selections">{t('내 선택 확인하기','查看我的选择','Review my selections')}{arrow}</a></div></section>
    </main>'''
    # Distinct page chapters; product names, records and actions remain untouched.
    def chapter(number, title):
        return '<p class="home-chapter"><span aria-hidden="true">'+number+'</span>'+title+'</p>'
    main=main.replace('<section id="destinations"', '<div class="home-band-destinations"><section id="destinations"',1)
    main=main.replace('aria-labelledby="destinations-title">', 'aria-labelledby="destinations-title">'+chapter('01',t('여행지 선택','选择目的地','Choose a destination')),1)
    main=main.replace('<section id="trips"', '</div><section id="trips"',1)
    main=main.replace('aria-labelledby="trips-title">', 'aria-labelledby="trips-title">'+chapter('02',t('후난 · 숙박 투어','湖南多日游','Hunan · multi-day tours')),1)
    note='<p class="home-section-note">'+t('장가계에서 시작하는 여행','从张家界开始的旅行','Begin in Zhangjiajie')+'</p>'
    main=main.replace(note,'',1)
    main=main.replace('<section id="day-trips"', '<div class="home-band-short"><section id="day-trips"',1)
    main=main.replace('aria-labelledby="short-title">', 'aria-labelledby="short-title">'+chapter('03',t('후난 · 당일·1박 투어','湖南一日与两日游','Hunan · day & overnight tours')),1)
    main=main.replace('<section class="home-story', '</div><section class="home-story',1)
    main=main.replace('aria-labelledby="story-title"><div class="home-container">','aria-labelledby="story-title"><div class="home-container">'+chapter('04',t('현지의 일상','在地生活','Local life')),1)
    main=re.sub(r'(<h2 id="promise-title">.*?</h2>)',lambda m:'<div>'+chapter('05',t('로투차의 약속','我们的承诺','Our promise'))+m[1]+'</div>',main,count=1,flags=re.S)
    review_url=('' if lang=='ko' else '/'+lang)+'/reviews.html'
    main=main.replace('<section class="home-contact', '<section class="home-container home-section review-browse"><h2>'+t('여행자들의 이야기','旅行者的分享','Stories from our travellers')+'</h2><p>'+t('네이버 카페와 YouTube에 남겨 주신 원문을 확인하세요.','查看 Naver Cafe 与 YouTube 上的完整原文和出处。','Read the original Naver Cafe and YouTube reviews, with their sources.')+'</p><a class="home-link" href="'+review_url+'">'+t('여행 후기 보기','查看旅行评价','Read traveller reviews')+' ↗</a></section><section class="home-contact',1)
    credits = re.search(r'<div class="phase-main store-credits">(.*?)</div>', ('<div class="phase-main store-credits">'+(BASE/'image-credits.html').read_text()+'</div>'), re.S)
    if credits:
        credit_html = credits[1].replace('사진 출처', t('사진 출처','图片来源','Photo credits'))
        main += '<div class="store-image-credits home-container">'+credit_html+'</div>'
    return document(lang, t('한국어 현지여행','当地旅行','Local journeys'), main, catalog, page='editorial-home')
