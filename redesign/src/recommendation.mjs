import {initialDraft,validateDraft} from './consultation.mjs';
import {assessPackage,packageParty,packageCopy,packagePartyLabel,validArrivalTime} from './package-request.mjs';
import {findTrip,formatTripPrice,packageTitle,tripDuration} from './trip-catalog.mjs';

export const DEFAULT_ROUTE='regular34';
export const isHomepageQuotePilot=(lang,routeId)=>lang==='ko'&&routeId===DEFAULT_ROUTE;
export const isHomepageQuoteReceipt=(lang,record)=>record.configuration?.recommendationVersion===RECOMMENDATION_VERSION&&isHomepageQuotePilot(lang,record.configuration.productId);
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
 return `${prefix}?view=recommendation&mode=private&route=${recommendedRoute(routeId).id}&step=${step==='review'?'review':'details'}${validRecommendationParty(people)?'&party='+validRecommendationParty(people):''}${departure===''||departure==='unknown'?'&departure=unknown':validRecommendationDate(departure)?'&departure='+validRecommendationDate(departure):''}`;
}
export function restoreRecommendation(saved={},routeId=DEFAULT_ROUTE,party='',departure){
 const previous=saved.recommendation?.version===RECOMMENDATION_VERSION?saved:{};
 return {...initialDraft('help'),...previous,mode:'private',services:['private'],people:validRecommendationParty(party)||(previous.people??''),
  contact:typeof saved.contact==='string'?saved.contact:'',nickname:typeof saved.nickname==='string'?saved.nickname:'',
  ...(departure==='unknown'?{date:'',month:'',dateMode:'unknown'}:validRecommendationDate(departure)?{date:departure,month:'',dateMode:'exact'}:{}),
  consent:false,configuration:null,recommendation:{version:RECOMMENDATION_VERSION,lessWalking:false,withChildren:false,childrenCount:previous.recommendation?.withChildren?'':'0',childrenAges:[],arrivalTime:'',...previous.recommendation,requestPackage:true,routeId:recommendedRoute(routeId).id}};
}
export function recommendationPrice(draft){
 return assessPackage(draft,recommendedRoute(draft.recommendation?.routeId)).price;
}
export function validateRecommendationDetails(draft,now=new Date(),lang='ko'){
 const errors=validateDraft({...draft,services:['private'],consent:true},now),p=draft.recommendation||{},party=packageParty(draft),t=packageCopy(lang);
 if(p.arrivalTime&&!validArrivalTime(p.arrivalTime))errors.arrivalTime=t.arrivalError;
 if(!party.valid)errors.childrenCount=t.childrenError;
 else if(party.children>0&&(party.ages.length!==party.children||party.ages.some(age=>!/^(?:[0-9]|1[0-7])$/.test(String(age)))))errors.childrenAges=t.agesError;
 return errors;
}
export function recommendationEndDate(departure,routeId){if(!validRecommendationDate(departure))return '';const end=new Date(departure+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+recommendedRoute(routeId).days-1);return end.toISOString().slice(0,10);}
export function prepareRecommendation(draft,lang='ko'){
 const preferences=draft.recommendation,product=recommendedRoute(preferences.routeId),assessment=assessPackage(draft,product,lang),t=packageCopy(lang);
 const {party,price,itinerary,terms}=assessment;
 const words=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
 const date=draft.dateMode==='exact'?draft.date:'',endDate=recommendationEndDate(date,product.id);
 const conditions=[
  t.intent,packageTitle(product,lang),tripDuration(product,lang),
  `${t.arrivalRow}: ${preferences.arrivalTime||t.unknownTime} · ${t.china}`,assessment.arrivalLabel,
  `${t.partyRow}: ${party.total} (${packagePartyLabel(party,lang)})`,
  party.children>0?`${t.ages}: ${party.ages.join(', ')}`:null,
  `${t.sights}: ${assessment.sights}`,`${t.rooms}: ${assessment.room}`,
  `${words('참고가','参考价','Guide price')}: ${price===null?t.quote:formatTripPrice(price,lang)+' / '+t.priceNote}`,
  ...assessment.reasons,
  `${t.scope}: ${terms.included}`,terms.hotels,terms.meals,terms.inclusionNote,
  `${t.excluded}: ${terms.excluded}`,
  `${t.route}:`,...itinerary.map((line,i)=>`${i+1}. ${line}`),product.copy[lang].walking,
  `${t.pending}:`,...assessment.pending.map(line=>`• ${line}`),
  t.noBooking
 ].filter(Boolean).join('\n');
 return {...draft,consent:false,mode:'private',services:['private'],recommendation:{...preferences,requestPackage:true,withChildren:party.children>0},configuration:{recommendationVersion:RECOMMENDATION_VERSION,productId:product.id,productTitle:packageTitle(product,lang),sourcePath:recommendationUrl(lang,product.id),date,endDate,people:String(draft.people),adults:party.adults,children:party.children,childrenAges:party.ages.slice(0,party.children||0),arrivalTime:preferences.arrivalTime||'',arrivalVersion:assessment.version,itinerary,quoteReasons:assessment.reasons,referencePriceKRW:price,inquiryText:conditions}};
}
export {formatTripPrice,packageTitle,tripDuration};
