import {recommendationUrl} from './recommendation.mjs';
// Advice starts with the recommended route; individual service booking remains available.
export function inquiryEntry(lang='ko',routeId) {return recommendationUrl(lang,routeId);}
export function serviceInquiryEntry(lang='ko',category='ticket') {
 const prefix=['zh','en'].includes(lang)?`/${lang}/`:'/';
 const selected=['ticket','vehicle','guide','daytour','hotel','package'].includes(category)?category:'ticket';
 return prefix+'multi-booking.html?category='+selected+'&planner=0&entry=home';
}
