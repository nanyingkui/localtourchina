import {initialDraft,validateDraft} from './consultation.mjs';
import {findTrip,getTripPrice,formatTripPrice,catalogInquiry,packageTitle,tripDuration} from './trip-catalog.mjs';

export const DEFAULT_ROUTE='regular34';
export const RECOMMENDED_ROUTES=['regular34','regular45','regular56','custom67'];
export const RECOMMENDATION_VERSION='route-v1';
export const recommendedRoute=id=>{
 if(id!=='custom67')return findTrip(RECOMMENDED_ROUTES.includes(id)?id:DEFAULT_ROUTE);
 const base=findTrip('regular56');return {...base,id:'custom67',days:7,nights:6,prices:[],names:{ko:'장가계 6박 7일 · 맞춤 연장',zh:'张家界7天6晚 · 自定义延长',en:'Zhangjiajie 7 days · custom extension'},copy:Object.fromEntries(Object.entries(base.copy).map(([lang,c])=>[lang,{...c,itinerary:[...c.itinerary.slice(0,-1),({ko:'휴식 또는 원하는 장소를 정하는 하루. 추가 이동·숙박은 별도 확인합니다.',zh:'增加一天休息或自选地点，另行确认交通与住宿。',en:'An extra rest day or a place of your choice; confirm transport and lodging separately.'})[lang],c.itinerary.at(-1)]}]))};
};
export const validRecommendationParty=value=>/^(?:[1-9]|[12][0-9]|30)$/.test(String(value??''))?String(value):'';
export const validRecommendationDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?value:'';};
export function recommendationUrl(lang='ko',routeId=DEFAULT_ROUTE,step='details',people='',departure){
 const prefix=['zh','en'].includes(lang)?`/${lang}/index.html`:'/';
 return `${prefix}?view=recommendation&mode=help&route=${recommendedRoute(routeId).id}&step=${step==='review'?'review':'details'}${validRecommendationParty(people)?'&party='+validRecommendationParty(people):''}${departure===''||departure==='unknown'?'&departure=unknown':validRecommendationDate(departure)?'&departure='+validRecommendationDate(departure):''}`;
}
export function restoreRecommendation(saved={},routeId=DEFAULT_ROUTE,party='',departure){
 const previous=saved.recommendation?.version===RECOMMENDATION_VERSION?saved:{};
 return {...initialDraft('help'),...previous,mode:'help',services:['help'],people:validRecommendationParty(party)||(previous.people??''),
  contact:typeof saved.contact==='string'?saved.contact:'',nickname:typeof saved.nickname==='string'?saved.nickname:'',
  ...(departure==='unknown'?{date:'',month:'',dateMode:'unknown'}:validRecommendationDate(departure)?{date:departure,month:'',dateMode:'exact'}:{}),
  consent:false,configuration:null,recommendation:{version:RECOMMENDATION_VERSION,lessWalking:false,withChildren:false,requestPackage:false,...previous.recommendation,routeId:recommendedRoute(routeId).id}};
}
export function recommendationPrice(draft){
 const preferences=draft.recommendation||{};
 return preferences.lessWalking||preferences.withChildren?null:getTripPrice(recommendedRoute(preferences.routeId),draft.people);
}
export function validateRecommendationDetails(draft,now=new Date()){
 return validateDraft({...draft,services:['help'],consent:true},now);
}
export function recommendationEndDate(departure,routeId){if(!validRecommendationDate(departure))return '';const end=new Date(departure+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+recommendedRoute(routeId).days-1);return end.toISOString().slice(0,10);}
export function prepareRecommendation(draft,lang='ko'){
 const preferences=draft.recommendation,product=recommendedRoute(preferences.routeId),changed=preferences.lessWalking||preferences.withChildren;
 const words=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
 const heading=words('추천 일정 상담','推荐行程咨询','Recommended itinerary inquiry');
 const price=recommendationPrice(draft);
 const date=draft.dateMode==='exact'?draft.date:'';
 const endDate=recommendationEndDate(date,product.id);
 const original=catalogInquiry(product,draft.people,lang);
 // Adjusted routes never inherit an unverified numerical package quote.
 const itinerary=changed?[heading,packageTitle(product,lang),tripDuration(product,lang),words('참고가: 변경 조건은 별도 견적','参考价：调整条件需单独报价','Guide price: changed conditions require a separate quote'),...product.copy[lang].itinerary.map((line,i)=>`${i+1}. ${line}`),product.copy[lang].walking].join('\n'):original;
 const conditions=[heading,itinerary,
  preferences.lessWalking?words('요청: 걷는 양을 줄이는 대안. 확정 동선·요금은 별도 확인.','需求：减少步行；最终路线和价格需另行确认。','Request: less walking; revised routing and price require confirmation.'):null,
  preferences.withChildren?words('아동 동반: 연령별 요금·객실·입장 조건 별도 확인.','携儿童同行：按年龄另行确认价格、房型与入园条件。','Children travelling: age-based rates, rooms and admission conditions to confirm.'):null,
  preferences.requestPackage?words('선택한 요청: 숙박·차량·가이드 포함 패키지 견적. 구매·결제 동의 아님.','所选需求：住宿、车辆及导游套餐报价，并非同意购买或付款。','Requested: a package quote with lodging, vehicle and guide. Not consent to buy or pay.'):words('유료 서비스 선택 없음. 우선 일정 추천 상담만 요청합니다.','未选择付费服务，仅请求推荐行程咨询。','No paid services selected. Itinerary advice requested first.'),
  words('항공권·비자·보험 불포함. 입장권·체험·식사 포함 범위는 최종 견적 확인.','不含机票、签证和保险。门票、体验及餐食范围以最终报价为准。','Flights, visas and insurance excluded. Confirm admission, activities and meals in the final quote.')].filter(Boolean).join('\n\n');
 return {...draft,consent:false,mode:preferences.requestPackage?'private':'help',services:[preferences.requestPackage?'private':'help'],configuration:{recommendationVersion:RECOMMENDATION_VERSION,productId:product.id,productTitle:packageTitle(product,lang),sourcePath:recommendationUrl(lang,product.id),date,endDate,people:String(draft.people),referencePriceKRW:price,inquiryText:conditions}};
}
export {formatTripPrice,packageTitle,tripDuration};
