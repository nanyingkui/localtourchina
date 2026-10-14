import {WEATHER_PLACES,normalizeVisual} from '../public/assets/weather-data.mjs';
// Server-only. The provider key and upstream response errors never reach the client.
export function createWeatherProxy({getKey,fetcher=fetch,now=Date.now,ttl=3600000,cache=new Map()}={}){
 const pending=new Map();
 return async request=>{
  const origin=request.headers.get('Origin');
  const allowed=['https://localtourchina.com','https://www.localtourchina.com'];
  const headers={'Content-Type':'application/json','Vary':'Origin','Cache-Control':'no-store'};
  if(origin&&!allowed.includes(origin))return new Response('{"error":"origin_not_allowed"}',{status:403,headers});
  if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='authorization,apikey,content-type';headers['Access-Control-Allow-Methods']='GET,OPTIONS';}
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='GET')return reply({error:'method_not_allowed'},405);
  const url=new URL(request.url);const place=WEATHER_PLACES.find(p=>p.id===(url.searchParams.get('place')||'city'));
  if(!place||[...url.searchParams.keys()].some(k=>k!=='place'))return reply({error:'invalid_place'},400);
  const key=getKey?.();if(!key)return reply({error:'weather_source_not_configured'},503);
  let record=await cache.get(place.id);
  if(!record||record.expires<=now()){
   if(!pending.has(place.id))pending.set(place.id,(async()=>{
    const upstream=new URL('https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'+place.lat+','+place.lon);
    upstream.search=new URLSearchParams({key,unitGroup:'metric',include:'days,hours,current',elements:'datetime,datetimeEpoch,temp,humidity,visibility,precip,precipprob,windspeed,icon',contentType:'json'}).toString();
    const response=await fetcher(upstream,{signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('weather_unavailable');
    const data=normalizeVisual(await response.json());
    if(!data.hours.length)throw Error('weather_unavailable');
    data.updated=new Date(now()).toISOString();data.place=place.id;
    const result={expires:now()+ttl,data};await cache.set(place.id,result);return result;
   })().finally(()=>pending.delete(place.id)));
   try{record=await pending.get(place.id);}catch{return reply({error:'weather_unavailable'},502);}
  }
  headers['Cache-Control']='private, max-age='+Math.max(0,Math.floor((record.expires-now())/1000));
  headers['Expires']=new Date(record.expires).toUTCString();
  return reply(record.data);
 };
}
