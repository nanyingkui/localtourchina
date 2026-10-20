import HandbookEntry from './HandbookEntry.jsx';
import React from 'react';
import ReviewStories from './ReviewArchiveEntry.jsx';
import {serviceInquiryEntry} from './inquiry-entry.mjs';
import UiIcon from './UiIcon.jsx';
import ScenicExplorer from './ScenicExplorer.jsx';
import './travel-home.css';
import {RecommendedOverview} from './RecommendedJourney.jsx';
const words={ko:{title:'장가계 자유여행,\n차근차근 준비해요.',intro:'먼저 내 일정을 만들고, 필요한 정보를 확인하세요.\n입장권이나 이동 서비스는 필요할 때만 예약하면 돼요.',start:'여행 준비 시작하기',reserve:'3단계 상담 시작하기',free:'일정 만들기와 여행정보는 무료예요. 예약하지 않아도 이용할 수 있어요.',weather:'장가계 날씨',weatherMore:'10일 · 시간별 날씨 보기',weatherClose:'상세 날씨 닫기',info:'여행정보',infoText:'지금 필요한 내용부터 골라 보세요.',guides:[['출국 전 준비','여권·결제·인터넷·준비물','travel-info.html','checklist'],['날씨·옷차림','여행 전 확인','travel-info.html#weather-information','weather'],['맛집과 지도','식당 위치와 현지 식사 정보','food-map.html?region=zhangjiajie','photo']],all:'여행정보 전체 보기',source:'현재 시간대 예보 · 중국 시간',detail:'습도·강수·가시거리와 시간별 변화를 확인하세요.',scene:'장가계의 낮과 밤',sceneText:'같은 풍경, 시간에 따라 달라지는 빛.',sceneHint:'AI 풍경·조명 연출입니다. 야간 개방 안내가 아닙니다.'},zh:{title:'张家界自由行，\n一步一步准备。',intro:'先制定自己的行程，再查看需要的情报。\n门票或交通服务，需要时再预订。',start:'开始准备旅行',reserve:'3步提交咨询',free:'行程规划和旅行情报免费，不购买也可以使用。',weather:'张家界天气',weatherMore:'查看10天及分时天气',weatherClose:'关闭详细天气',info:'旅行情报',infoText:'先看现在需要的内容。',guides:[['出发前准备','护照、支付、网络与准备清单','travel-info.html','checklist'],['天气与穿衣','出发前查看','travel-info.html#weather-information','weather'],['美食与地图','餐厅位置与当地用餐情报','food-map.html?region=zhangjiajie','photo']],all:'查看全部旅行情报',source:'当前时段预报 · 中国时间',detail:'查看湿度、降雨、能见度及时间变化。',scene:'张家界的白天与夜晚',sceneText:'同一片风景，光线随时间变化。',sceneHint:'AI风景与光线模拟，不代表景区夜间开放。'},en:{title:'Zhangjiajie,\none step at a time.',intro:'Build your itinerary, then find the information you need.\nBook local services only when you need them.',start:'Start preparing my trip',reserve:'Ask about local services',free:'Planning and travel information are free. No booking required.',weather:'Zhangjiajie weather',weatherMore:'View 10 days & hourly weather',weatherClose:'Close weather details',info:'Travel information',infoText:'Start with what you need now.',guides:[['Before departure','Passport, payments, internet & checklist','travel-info.html','checklist'],['Weather & clothing','Check before your trip','travel-info.html#weather-information','weather'],['Food map (Korean)','Restaurants and local food information','food-map.html?region=zhangjiajie','photo']],all:'All travel information',source:'City forecast · China time',detail:'Explore humidity, rain, visibility and hourly changes.',scene:'Zhangjiajie by day and night',sceneText:'The same scenery, in a different light.',sceneHint:'AI scenery and lighting simulation, not night-opening information.'}};
export function ServiceShortcuts({lang='ko'}){
 const ko=lang==='ko',zh=lang==='zh';
 const items=[
 ['ticket',ko?'입장권 예약':zh?'景区门票':'Attraction tickets',ko?'날짜·연령·입장 옵션 선택':zh?'填写日期、年龄及入园选项':'Dates, ages & entry options'],
 ['guide',ko?'현지 가이드':zh?'当地导游':'Local guide',ko?'날짜·시간·동행 일정 입력':zh?'填写日期、时长及陪同行程':'Dates, duration & itinerary'],
 ['daytour',ko?'일일투어':zh?'一日游':'Day tours',ko?'코스·포함 사항·1인 요금 확인':zh?'查看线路、包含项目和每人价格':'Routes, inclusions & per-person prices'],
 ['vehicle',ko?'차량·공항 픽업':zh?'用车与机场接送':'Vehicles & transfers',ko?'차종·짐·시간·이동 구간 선택':zh?'选择车型、行李、时间和路线':'Vehicle, luggage, time & route'],
 ['onlineguide',ko?'온라인 여행지원':zh?'线上向导':'Online travel support',ko?'여행 전 준비·여행 중 한국어 도움':zh?'行前准备及旅途中的韩语支持':'Before & during your trip'],
 ['private',ko?'맞춤여행':zh?'定制旅行':'Tailor-made trip',ko?'숙소·식사·관광지·전체 일정 구성':zh?'配置住宿、餐饮、景点及完整行程':'Lodging, meals & full itinerary']
 ];
 return <section className="home-service-shortcuts" aria-labelledby="home-services-title"><header><h1 id="home-services-title">{ko?'어떤 도움이 필요하세요?':zh?'您需要什么帮助？':'What do you need?'}</h1><p>{ko?'필요한 서비스를 선택하고 상세 조건을 입력해 주세요. 접수 후 카카오톡 채널로 상담을 이어갑니다.':zh?'选择需要的服务并填写详细条件，提交后通过 KakaoTalk Channel 继续咨询。':'Choose a service and complete its detailed options. Continue on KakaoTalk after submitting.'}</p></header><nav aria-label={ko?'서비스 예약':zh?'预订服务':'Booking services'}>{items.map(([kind,title,detail])=><a key={kind} className="service-shortcut" href={serviceInquiryEntry(lang,kind)}><UiIcon kind={kind==='daytour'?'itinerary':kind==='onlineguide'?'information':kind}/><span><strong>{title}</strong><small>{detail}</small></span><UiIcon kind="next"/></a>)}</nav></section>
}
function DayTourEntry({lang}){
 const ko=lang==='ko',zh=lang==='zh';
 return <section className="home-day-tours"><header><h2>{ko?'하루만 함께하는 장가계 여행':zh?'张家界一日游':'A day in Zhangjiajie'}</h2><p>{ko?'가이드만 필요한 경우와 달라요. 상품별 입장권·식사·차량 포함 여부와 연령별 요금을 확인하세요.':zh?'与单请导游不同，请逐项查看各产品的门票、餐饮、车辆及年龄价格条件。':'Different from guide-only hire: check tickets, meals, transport and age-based prices for each tour.'}</p></header><div className="home-day-tour-list">{[
 ['forest','무릉원 국가삼림공원','武陵源国家森林公园','National Forest Park'],
 ['tianmen','천문산','天门山','Tianmen Mountain'],
 ['canyon','황룡동·대협곡','黄龙洞与大峡谷','Yellow Dragon Cave & Grand Canyon']
 ].map(([id,k,z,e])=><a key={id} href={serviceInquiryEntry(lang,'daytour')+'?tour='+id}><strong>{ko?k:zh?z:e}</strong><span>{ko?'일정·요금·예약 조건 보기 →':zh?'查看行程、价格及预订条件 →':'Itinerary, prices & booking options →'}</span></a>)}</div></section>;
}
export default function TravelHome({lang='ko'}){const t=words[lang]||words.ko,prefix=lang==='ko'?'/':'/'+lang+'/';return <div className="travel-home"><ServiceShortcuts lang={lang}/><DayTourEntry lang={lang}/><RecommendedOverview lang={lang}/><ReviewStories lang={lang}/><section className="hub-information"><header><div><h2>{t.info}</h2><p>{t.infoText}</p></div><a href={prefix+'travel-info.html'}>{t.all} →</a></header><div className="hub-guide-grid">{t.guides.map(([name,body,path,pose])=><a className="hub-guide" key={path} href={(lang==='en'&&path.startsWith('food-map')?'/':prefix)+path}><img src={'/assets/mascot-v1/'+pose+'.webp'} alt="" width="48" height="72"/><div><h3>{name}</h3><p>{body}</p></div><span aria-hidden="true">›</span></a>)}</div></section><HandbookEntry lang={lang}/><section className="hub-scenery"><header><h2>{t.scene}</h2><p>{t.sceneText}</p></header><ScenicExplorer lang={lang}/></section></div>}

