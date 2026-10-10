import fs from 'node:fs/promises';
import {tripCatalog,packageTitle,tripDuration,getTripPrice,formatTripPrice} from '../src/trip-catalog.mjs';
const packages=tripCatalog.map(product=>({id:product.id,image:product.image.src,kind:product.kind,days:product.days,locales:Object.fromEntries(['ko','zh','en'].map(lang=>[lang,{title:packageTitle(product,lang),duration:tripDuration(product,lang),description:product.copy[lang].tagline,price:formatTripPrice(getTripPrice(product,4),lang),prices:Object.fromEntries([2,4,6,8,10].map(pax=>[pax,formatTripPrice(getTripPrice(product,pax),lang)])),itinerary:product.copy[lang].itinerary}]))}));
await fs.writeFile(new URL('../public/assets/shop-products.json',import.meta.url),JSON.stringify({packages},null,2)+'\n');
console.log('Generated six shop package records from the existing package catalogue.');
