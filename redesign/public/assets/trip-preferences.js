/* Shared, non-sensitive travel choices. Never store contacts or reservations here. */
(function(root){
 const KEY='ltc-trip-preferences-v1',ROUTES={regular34:4,regular45:5,regular56:6,custom67:7};
 const date=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return '';const d=new Date(v+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v?v:''};
 function normalize(v={}){return {version:1,date:date(v.date),days:[4,5,6,7].includes(Number(v.days))?Number(v.days):4,people:/^(?:[1-9]|[1-9][0-9]|100)$/.test(String(v.people??''))?String(v.people):''};}
 function read(store){try{store=store||root.localStorage;const raw=JSON.parse(store.getItem(KEY)||'null');if(raw?.version===1)return normalize(raw);const plan=JSON.parse(store.getItem('china-planner-v1')||'null');if(plan?.modules?.length)return normalize({date:plan.trip?.start,days:plan.template?.days,people:plan.trip?.people});}catch{}return normalize();}
 function write(v,store){const clean=normalize(v);try{store=store||root.localStorage;store.setItem(KEY,JSON.stringify(clean));return true}catch{return false}}
 function fromQuery(search,fallback={}){const q=new URLSearchParams(search),v={...normalize(fallback)};if(q.has('departure'))v.date=q.get('departure')==='unknown'?'':date(q.get('departure'));if(q.has('party'))v.people=normalize({people:q.get('party')}).people;if(q.has('days'))v.days=normalize({days:q.get('days')}).days;else if(ROUTES[q.get('route')])v.days=ROUTES[q.get('route')];return normalize(v);}
 const route=days=>Object.keys(ROUTES).find(k=>ROUTES[k]===Number(days))||'regular34';
 function plannerUrl(v){v=normalize(v);const q=new URLSearchParams({departure:v.date||'unknown',days:String(v.days),party:v.people,from:'home'});return '/travel-planner/?'+q+'#start-plan';}
 function endDate(start,days){if(!date(start))return '';const d=new Date(start+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+normalize({days}).days-1);return d.toISOString().slice(0,10);}
 root.LTCTripPreferences={KEY,normalize,read,write,fromQuery,route,plannerUrl,endDate};
})(globalThis);
