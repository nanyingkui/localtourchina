import React, {useRef,useState} from 'react';
import {tripCatalog} from './trip-catalog.mjs';
import featuredReviews from './featured-reviews.json';
import videoGuides from './video-guides.json';
import './home-gallery.css';
import UiIcon from './UiIcon.jsx';

const tr=(lang,ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
const path=(lang,url)=>url.startsWith('#')?url:(lang==='ko'||(lang==='en'&&url.startsWith('food-map.html'))?'/':'/'+lang+'/')+url;
const attraction=name=>'/assets/media/attractions/'+name+'-jpg-640.webp';
const sanya=name=>'/assets/media/sanya/'+name+'-jpg-640.webp';
const hotel=(name,view='twin')=>'/assets/media/hotels/'+name+'/'+view+'-webp-640.webp';
const vehicle=(name,view='exterior')=>'/assets/media/vehicles/'+name+'-seat/'+view+'-jpg-640.webp';

function Rail({id,title,note,children,lang,link,linkLabel,small=false}) {
 const rail=useRef(null),[ends,setEnds]=useState([true,false]);
 function sync(){const e=rail.current;if(e)setEnds([e.scrollLeft<8,e.scrollLeft+e.clientWidth>=e.scrollWidth-8]);}
 function move(direction){const e=rail.current;e?.scrollBy({left:direction*(e.firstElementChild?.getBoundingClientRect().width+20||360),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 return <section className={'gallery-section'+(small?' gallery-small':'')} id={id} aria-labelledby={id+'-heading'}>
  <div className="gallery-section-header"><div><h2 id={id+'-heading'}>{title}</h2>{note&&<p>{note}</p>}</div>{link&&<a href={link}>{linkLabel}</a>}</div>
  <div className="gallery-rail" ref={rail} onScroll={sync} tabIndex="0" aria-label={title}>{children}</div>
  <div className="gallery-controls"><button type="button" aria-label={title+' '+tr(lang,'이전','上一项','previous')} disabled={ends[0]} onClick={()=>move(-1)}><UiIcon kind="previous"/>{tr(lang,'이전','上一项','Previous')}</button><button type="button" aria-label={title+' '+tr(lang,'다음','下一项','next')} disabled={ends[1]} onClick={()=>move(1)}>{tr(lang,'다음','下一项','Next')}<UiIcon kind="next"/></button></div>
 </section>;
}

function Card({image,title,description,label,href,foot,illustration=false,wide=false,onClick,lang='ko'}) {
 const content=<><div className="gallery-card-copy">{label&&<p className="gallery-card-label">{label}</p>}<h3>{title}</h3>{description&&<p>{description}</p>}</div><img src={image} alt="" loading="lazy" decoding="async" width="640" height="480"/>{foot&&<p className="gallery-card-foot">{foot}</p>}<span className="gallery-card-open" aria-hidden="true">{tr(lang,'보기','查看','View')}</span></>;
 const cls='gallery-card'+(illustration?' gallery-illustration':'')+(wide?' gallery-wide':'');
 return onClick?<button type="button" className={cls} onClick={onClick}>{content}</button>:<a className={cls} href={href} {...(href?.startsWith('https://')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{content}</a>;
}

export default function HomeGallery({lang='ko',onHelp}) {
 const t=(ko,zh,en)=>tr(lang,ko,zh,en);
 const [region,setRegion]=useState(()=>new URLSearchParams(location.search).get('destination')==='hainan'?'hainan':'zhangjiajie');
 const categories=[
 ['gallery-packages',attraction('tianmen-cave'),t('패키지','打包行程','Packages')],
 ['gallery-services','/assets/designed/ticket-service.webp',t('입장권','门票','Tickets')],
 ['gallery-attractions',attraction('canyon-bridge'),t('하루 투어','一日游','Day tours')],
 ['gallery-transport',vehicle('7'),t('차량·픽업','车辆·接送','Transfers')],
 ['gallery-services','/assets/designed/guide-planning-png-640.webp',t('가이드','导游','Guides')],
 ['gallery-stays',hotel('mercure'),t('숙박','住宿','Stays')],
 ['service-entry','/assets/designed/combined-services-png-640.webp',t('맞춤여행','定制旅行','Custom trips')],
 ['gallery-sanya',sanya('tianya-haijiao'),t('하이난','海南','Hainan')],
 ['gallery-information','/assets/designed/online-support.webp',t('여행 정보','旅行信息','Travel guides')]
 ];
 const services=[
 {image:'/assets/designed/ticket-service.webp',title:t('입장권 한 장부터.','从一张门票开始。','Start with a ticket.'),description:t('방문 날짜와 연령에 맞는 옵션을 선택하세요.','按日期与年龄选择入园选项。','Choose options for your dates and ages.'),href:path(lang,'multi-booking.html?category=ticket'),illustration:true,label:t('관광지 입장권','景区门票','Attraction tickets')},
 {image:vehicle('7'),title:t('이동도, 우리 일정대로.','交通，也按自己的节奏。','Travel at your own pace.'),description:t('공항 픽업부터 하루 전용차량까지.','从机场接送到全天包车。','Airport transfers and private vehicles.'),href:path(lang,'multi-booking.html?category=vehicle'),label:t('차량·공항 픽업','车辆·机场接送','Vehicles & transfers')},
 {image:'/assets/designed/guide-planning-png-640.webp',title:t('현지에서 함께하는 가이드.','当地导游，陪你一起走。','A guide by your side.'),description:t('필요한 날짜와 동행 범위를 정하세요.','按需要的日期和陪同范围安排。','Choose dates and the support you need.'),href:path(lang,'multi-booking.html?category=guide'),illustration:true,label:t('한국어 가이드','韩语导游','Korean-speaking guides')},
 {image:attraction('canyon-lake'),title:t('하루를 알차게.','把一天，安排得刚刚好。','Make a day of it.'),description:t('코스와 포함 내역을 비교해 보세요.','比较路线与包含内容。','Compare routes and inclusions.'),href:path(lang,'day-tours.html'),label:t('하루 투어','一日游','Day tours')},
 {image:'/assets/designed/combined-services-png-640.webp',title:t('우리끼리, 원하는 만큼.','同行人专属，按需组合。','A trip that fits your group.'),description:t('숙박·차량·관광을 하나의 일정으로.','把住宿、交通与游览组合成行程。','Bring stays, transport and sights together.'),href:path(lang,'multi-booking.html?planner=1'),illustration:true,label:t('나만의 여행','自定义行程','Build your trip')},
 {image:'/assets/designed/online-support.webp',title:t('여행 중에도 물어보세요.','旅途中，也有人可问。','Help along the way.'),description:t('지원 시간과 범위를 확인하고 신청하세요.','确认支持时段与范围后申请。','Check support hours and scope.'),href:path(lang,'online-guide.html'),illustration:true,label:t('유료 온라인 지원','付费在线支持','Paid online support')}
 ];
 const sights=[
 ['forest-east','forest',t('국가삼림공원','国家森林公园','Forest Park'),t('봉우리 사이로 떠나는 하루.','穿行峰林之间的一天。','A day among the peaks.')],
 ['tianmen-cave','tianmen',t('천문산','天门山','Tianmen Mountain'),t('하늘을 향해 열린 풍경.','向天空敞开的风景。','A gateway to the sky.')],
 ['canyon-bridge','canyon',t('대협곡·유리다리','大峡谷·玻璃桥','Grand Canyon & Glass Bridge'),t('다리 위에서, 계곡 아래까지.','从桥上，一直走到峡谷。','From the bridge into the canyon.')],
 ['huanglong-cave','huanglong',t('황룡동굴','黄龙洞','Huanglong Cave'),t('산 아래 숨겨진 또 다른 세계.','山下，另一片天地。','Another world beneath the mountains.')],
 ['baofeng-lake','baofeng',t('보봉호수','宝峰湖','Baofeng Lake'),t('산에 둘러싸인 물길을 따라.','沿着群山环抱的水路。','Water framed by mountains.')],
 ['golden-whip','forest',t('금편계곡','金鞭溪','Golden Whip Stream'),t('숲과 계곡을 천천히 걸어요.','慢慢走过森林与溪谷。','Take your time along the stream.')],
 ['furong-town','furong',t('부용진','芙蓉镇','Furong Town'),t('폭포 곁 고진을 만나보세요.','走进瀑布边的古镇。','An old town beside a waterfall.')],
 ['fenghuang','fenghuang',t('봉황고성','凤凰古城','Fenghuang Ancient Town'),t('강을 따라 이어지는 옛 거리.','沿江延伸的古老街巷。','Old streets along the river.')]
 ];
 return <div className="home-gallery">
 <section className="gallery-intro" aria-labelledby="gallery-title"><div><h1 id="gallery-title">{t('여행.','旅行。','Travel.')}<span>{t('원하는 만큼 자유롭게.','按自己的节奏出发。','Your own way.')}</span></h1><p>{t('장가계의 산부터 하이난의 바다까지. 필요한 준비를 한곳에서.','从张家界的山，到海南的海。旅行准备，在这里完成。','From Zhangjiajie’s mountains to Hainan’s shores. Prepare it here.')}</p><a className="button primary" href={path(lang,'multi-booking.html?planner=1')}>{t('나의 여행 구성하기','开始配置我的旅行','Build my trip')}</a><p className="gallery-handoff-steps">{t('서비스 선택 → 맞춤 구성 → 전체 내용 복사 → 카카오톡에 붙여넣기','选择服务 → 定制内容 → 复制完整清单 → 粘贴到客服聊天','Choose services → customise → copy your plan → paste into customer chat')}</p></div><aside><img src="/assets/brand/orange-hat-portrait.png" alt="" width="48" height="50"/><div><strong>{t('어디서 시작할지 고민되세요?','不知道从哪里开始？','Need a place to start?')}</strong><button type="button" onClick={()=>onHelp(region)}>{t('여행 추천 상담','咨询行程推荐','Ask for a recommendation')}</button><a href={path(lang,'multi-booking.html?planner=1')}>{t('나만의 여행 구성','配置我的行程','Build my trip')}</a></div></aside></section>
 <nav className="gallery-categories" aria-label={t('여행 서비스','旅行服务','Travel services')}>{categories.map(([id,image,label])=><a key={label} href={'#'+id}><img src={image} alt="" width="112" height="80"/><span>{label}</span></a>)}</nav>
 <Rail id="gallery-packages" title={t('장가계 패키지. 함께 떠날 풍경을 골라 보세요.','张家界打包行程。挑选一起出发的风景。','Zhangjiajie packages. Find your next landscape.')} note={t('숙박 포함 6가지 일정. 코스별 도보량과 포함 내역을 먼저 확인하세요.','6条含住宿行程，请先确认各路线的步行量与包含内容。','Six itineraries with lodging. Check walking demands and inclusions.')} lang={lang} link="#prepared-trips" linkLabel={t('일정·참고가 비교','比较行程与参考价','Compare itineraries')}>
 {tripCatalog.map(p=><Card lang={lang} key={p.id} image={p.image.src} title={p.names[lang]} description={p.copy[lang].tagline} label={p.kind==='trekking'?t('고강도 트레킹','高强度徒步','Strenuous trekking'):t('대표 명소','经典景点','Landmark sights')} href={path(lang,'multi-booking.html?category=package&product='+p.id+'&pax=4')} foot={p.kind==='trekking'?t('장거리 도보·계단 포함 · 조건 확인','含长距离步行与台阶 · 请确认条件','Long walks & steps · check conditions'):t('호텔·차량·가이드 · 최종 견적 확인','住宿·车辆·导游 · 最终报价需确认','Hotel, vehicle & guide · final quote required')} wide/>)}</Rail>
 <Rail id="gallery-services" title={t('필요한 서비스. 하나씩 골라도 좋아요.','按需服务。单独选择也可以。','Local services. Choose just what you need.')} lang={lang} link={path(lang,'multi-booking.html')} linkLabel={t('서비스 전체 보기','查看全部服务','View all services')}>{services.map(item=><Card lang={lang} key={item.title} {...item}/>)}</Rail>
 <Rail id="gallery-attractions" title={t('하루의 여행. 가보고 싶은 곳부터.','一日旅行。从想去的地方开始。','A day away. Start with a place you love.')} note={t('입장권 또는 하루 투어로 선택하세요. 코스별 이동·도보 조건은 상세 페이지에서 확인합니다.','可选择门票或一日游，交通与步行条件请查看详情。','Choose tickets or a day tour. See details for transport and walking conditions.')} lang={lang} link={path(lang,'day-tours.html')} linkLabel={t('하루 투어 보기','查看一日游','Explore day tours')}>
 {sights.map(([image,id,title,description])=><Card lang={lang} key={image} image={attraction(image)} title={title} description={description} href={path(lang,['forest','tianmen','canyon','huanglong'].includes(id)?'day-tours.html?tour='+(id==='huanglong'?'canyon':id):'private-tour.html?mode=custom')} label={['forest','tianmen','canyon','huanglong'].includes(id)?t('하루 투어','一日游','Day tour'):t('맞춤여행으로 구성','组合定制旅行','Add to a custom trip')}/>)}</Rail>
 <Rail id="gallery-stays" title={t('쉬어가는 시간. 숙소도 여행의 일부니까.','休息的时光。住宿，也是旅行的一部分。','Time to rest. Your stay is part of the trip.')} note={t('실제 객실 사진입니다. 날짜별 객실 가능 여부와 요금은 구성 후 확인합니다.','使用实际客房图片。房态与价格按日期确认。','Actual room photos. Availability and rates require confirmation.')} lang={lang} link={path(lang,'multi-booking.html?category=hotel')} linkLabel={t('숙박 구성하기','配置住宿','Choose a stay')}>
 {[['mercure',t('장가계 머큐어','张家界美居','Mercure Zhangjiajie'),'king'],['orange',t('장가계 오렌지','张家界桔子','Orange Zhangjiajie'),'twin'],['homeinn',t('홈 인 플러스 호텔','如家精选酒店','Homeinn Plus'),'twin']].map(([id,title,view])=><Card lang={lang} key={id} image={hotel(id,view)} title={title} description={t('객실·위치·식사 조건을 함께 확인해요.','一起确认房型、位置与餐食条件。','Check rooms, location and meal options.')} href={path(lang,'multi-booking.html?category=hotel')} label={t('장가계 시내 숙박','张家界市区住宿','Stays in Zhangjiajie')} wide/>)}
 </Rail>
 <Rail id="gallery-transport" title={t('편안한 이동. 인원과 짐에 맞춰서.','舒适的交通。按人数和行李来选择。','A comfortable ride. Room for your group.')} note={t('실차량 사진입니다. 정원에는 운전자가 포함되며 탑승 인원·짐·배차는 예약 전 확인합니다.','使用实际车辆图片。座位数包含司机，人数、行李与调度需预订前确认。','Actual vehicle photos. Seats include the driver; confirm passengers, luggage and dispatch.')} lang={lang} link={path(lang,'vehicles.html')} linkLabel={t('차량 조건 보기','查看车辆条件','Vehicle details')}>
 {['7','9','14'].map(n=><Card lang={lang} key={n} image={vehicle(n)} title={t(n+'인승 차량',n+'座车辆',n+'-seat vehicle')} description={t('실내·수하물 조건을 확인하세요.','查看内饰与行李条件。','See interior and luggage conditions.')} href={path(lang,'multi-booking.html?category=vehicle')} label={t('전용차량','包车','Private vehicle')}/>)}
 <Card lang={lang} image="/assets/services/airport-transfer-desktop-jpg-640.webp" title={t('공항에서 여행이 시작돼요.','旅程，从机场开始。','Your trip starts at the airport.')} description={t('도착편과 숙소에 맞춰 픽업을 상담하세요.','按到达航班与住宿咨询接送。','Arrange a pickup for your flight and stay.')} href={path(lang,'multi-booking.html?category=vehicle')} label={t('공항 픽업·샌딩','机场接送','Airport transfers')}/>
 </Rail>
 <Rail id="gallery-experiences" title={t('풍경 그다음. 현지에서 보내는 저녁.','风景之外。当地的夜晚。','Beyond the scenery. An evening here.')} lang={lang}>
 {[['meili-xiangxi',t('매력상서','魅力湘西','Charming Xiangxi')],['fox-fairy',t('천문호선','天门狐仙','Tianmen Fox Fairy')],['72-building',t('72기루','七十二奇楼','72 Wonder Tower')]].map(([id,title])=><Card lang={lang} key={id} image={attraction(id)} title={title} description={t('공연·입장 옵션과 운영일을 확인하세요.','查看演出、入场选项与营业日期。','Check admission options and operating dates.')} href={path(lang,'private-tour.html?mode=custom')} label={t('공연·야경','演出·夜景','Shows & evening sights')}/>)}
 <Card lang={lang} image={sanya('local-seafood')} title={t('여행지의 맛을 찾아서.','寻找旅行地的味道。','Find a taste of the destination.')} description={t('맛집과 위치를 지도에서 살펴보세요.','在地图上查看美食与位置。','Explore local food on the map.')} href={path(lang,'food-map.html')} label={t('맛집·생활 지도','美食·生活地图','Food & local life')}/>
 </Rail>
 <Rail id="gallery-sanya" title={t('하이난·싼야. 바다 곁의 하루.','海南·三亚。海边的一天。','Hainan & Sanya. A day by the sea.')} note={t('숙박 불포함 하루 상품입니다. 합승·집결 장소·출발 요일·인원별 추가금을 확인하세요.','不含住宿的一日游。请确认拼车、集合点、出发日与人数附加费。','Day tours without lodging. Check shared transport, meeting points and surcharges.')} lang={lang} link={path(lang,'day-tours.html?destination=sanya')} linkLabel={t('싼야 상품 보기','查看三亚产品','Explore Sanya')}>
 {[['monkey-island','sanya-monkey',t('원숭이섬·송성가무쇼','猴岛·宋城演出','Monkey Island & Songcheng')],['binglang-village','sanya-binglang',t('삥랑 빌리지·송성가무쇼','槟榔谷·宋城演出','Binglang Valley & Songcheng')],['tianya-haijiao','sanya-best',t('천애해각·대소동천·유람선','天涯海角·大小洞天·游船','Tianya Haijiao, Daxiaodongtian & cruise')]].map(([image,id,title])=><Card lang={lang} key={id} image={sanya(image)} title={title} description={t('일정과 최종 요금을 확인하세요.','查看行程并确认最终价格。','Review the route and confirm the final price.')} href={path(lang==='en'?'ko':lang,'day-tours.html?destination=sanya&tour='+id)} label={t('싼야 하루 투어','三亚一日游','Sanya day tour')} wide/>)}
 </Rail>
 <section className="gallery-planner" id="gallery-planner"><div><h2>{t('이미 준비한 것은 빼고. 필요한 것만 더하고.','已准备好的略过。需要的，再添上。','Skip what is arranged. Add what you need.')}</h2><p>{t('여행지, 날짜, 인원부터 시작해 나의 여행을 구성하세요.','从目的地、日期与人数开始，配置你的旅行。','Start with your destination, dates and group.')}</p><div className="gallery-region"><button type="button" aria-pressed={region==='zhangjiajie'} onClick={()=>setRegion('zhangjiajie')}>{t('장가계·후난','张家界·湖南','Zhangjiajie')}</button><button type="button" aria-pressed={region==='hainan'} onClick={()=>setRegion('hainan')}>{t('하이난·싼야','海南·三亚','Hainan')}</button></div><a className="button primary" href={path(lang,'multi-booking.html?planner=1&destination='+region)}>{t('나의 여행 구성','配置我的行程','Build my trip')}</a><p className="gallery-planner-note">{region==='hainan'?t('하이난 숙박·차량·가이드는 가능 여부와 별도 견적을 먼저 확인합니다.','海南住宿、车辆与导游需先确认可用情况及单独报价。','Hainan stays, vehicles and guides need availability checks and separate quotes.'):t('선택 후 일정과 최종 견적을 확인합니다.','选择后确认行程与最终报价。','Confirm your itinerary and final quote after selection.')}</p></div><img src="/assets/designed/combined-services-png-640.webp" alt="" loading="lazy" width="640" height="427"/></section>
 <Rail id="gallery-information" title={t('여행 준비. 알아두면 더 편안해요.','旅行准备。提前了解，更安心。','Before you go. A little preparation helps.')} lang={lang} small>
 {[['travel-info.html',t('입국·결제·통신','入境·支付·通信','Entry, payment & connection'),t('출발 전 확인할 내용을 모았어요.','整理出发前需要确认的内容。','What to check before departure.')],['food-map.html',t('맛집·지도','美食·地图','Food & maps'),t('여행지의 일상을 만나보세요.','走进旅行地的日常。','Find local everyday life.')],['reviews.html',t('실제 여행 후기','真实旅行后记','Traveller stories'),t('다녀온 여행자의 원문을 읽어보세요.','阅读旅行者发布的原文。','Read travellers’ original accounts.')],['company.html',t('현지 서비스 제공사','当地服务提供商','Your local service provider'),t('회사·사업자 정보를 확인하세요.','查看公司与经营信息。','Check company information.')]].map(([url,title,description])=><a className="gallery-info-card" key={url} href={path(lang,url)}><h3>{title}</h3><p>{description}</p><span>{t('자세히 보기','查看详情','Learn more')}</span></a>)}
 </Rail>
 <Rail id="gallery-videos" title={t('먼저 보는 여행. 현장 영상으로 만나보세요.','先看看旅行。实地视频带你了解。','See it first. Travel through our videos.')} note={t('카드 사진은 영상 주제를 소개하는 여행지 이미지입니다. 클릭하면 YouTube 원본 영상을 엽니다.','卡片使用目的地照片介绍视频主题，点击观看 YouTube 原视频。','Destination photos introduce each video topic. Open the original on YouTube.')} lang={lang}>
 {videoGuides.filter(v=>v.homepage&&v.format==='video').slice(0,3).map((v,i)=><Card lang={lang} key={v.id} image={attraction(['forest-east','tianmen-cave','canyon-bridge'][i])} title={v.title[lang]} label="YouTube" href={v.url} wide/>)}
 </Rail>
 <Rail id="gallery-stories" title={t('다녀온 여행자의 이야기.','旅行者的真实经历。','Stories from travellers.')} note={t('Naver Cafe 원문을 바탕으로 작성한 요약입니다.','依据 Naver Cafe 原文整理的摘要。','Summaries based on original Naver Cafe posts.')} lang={lang} small link={path(lang,'reviews.html')} linkLabel={t('전체 후기 보기','查看全部后记','Read all stories')}>
 {featuredReviews.cafe.map(s=><a className="gallery-review-card" href={path(lang,'reviews.html#cafe-'+s.id)} key={s.id}><p className="gallery-card-label" lang="ko">{s.category}</p><h3 lang="ko">{s.title}</h3><p lang="ko">{s.summary}</p><div><span>{s.author}</span><time dateTime={s.date}>{s.date}</time></div><span className="gallery-review-action">{t('전체 글·원문 보기','查看全文与原帖','Read the story & source')}</span></a>)}
 </Rail>
 </div>;
}
