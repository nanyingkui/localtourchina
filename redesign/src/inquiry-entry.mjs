// Homepage consultation links share one entry, including on mobile.
export function inquiryEntry(lang='ko') {
 const prefix=['zh','en'].includes(lang)?`/${lang}/`:'/';
 return prefix+'multi-booking.html?category=ticket&planner=0&entry=home';
}
