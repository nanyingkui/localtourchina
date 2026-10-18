// Direct requests collect only the information needed by the selected service.
export function inquiryEntry(lang='ko',routeId) {return serviceInquiryEntry(lang,'private');}
export function serviceInquiryEntry(lang='ko',category='ticket') {
 const prefix=['zh','en'].includes(lang)?`/${lang}/`:'/';
 const selected=['private','ticket','vehicle','guide'].includes(category)?category:'ticket';
 return (lang==='ko'?'/':prefix+'index.html')+'?view=request&service='+selected;
}
