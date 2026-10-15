import {recommendationUrl} from './recommendation.mjs';
// Advice starts with the recommended route; individual service booking remains available.
export function inquiryEntry(lang='ko',routeId) {return recommendationUrl(lang,routeId);}
export function serviceInquiryEntry(lang='ko') {
 const prefix=['zh','en'].includes(lang)?`/${lang}/`:'/';
 return prefix+'multi-booking.html?category=ticket&planner=0&entry=home';
}
