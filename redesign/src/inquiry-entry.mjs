// Every service starts at its original detailed calculator, including old request URLs.
export function inquiryEntry(lang='ko',routeId) {return serviceInquiryEntry(lang,'private');}
export function serviceInquiryEntry(lang='ko',category='ticket') {
 const prefix=['zh','en'].includes(lang)?`/${lang}/`:'/';
 const pages={private:'private-tour.html?mode=custom',ticket:'tickets.html',vehicle:'vehicles.html',guide:'local-guide.html',daytour:'day-tours.html',day:'day-tours.html',onlineguide:'online-guide.html',support:'online-guide.html'};
 return prefix+(pages[category]||pages.ticket);
}

