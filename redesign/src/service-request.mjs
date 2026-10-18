import {initialDraft,validateDraft} from './consultation.mjs';
export const REQUEST_SERVICES=['private','vehicle','guide','ticket'];
export const requestService=value=>REQUEST_SERVICES.includes(value)?value:'private';
export function newRequest(service,pref={},saved={}){
 return {...saved,service:requestService(service),date:pref.date??saved.date??'',people:pref.people??saved.people??'',days:pref.days??saved.days??4,contact:saved.contact||'',nickname:saved.nickname||'',notes:saved.notes||'',vehicleType:saved.vehicleType||'airport',pickup:saved.pickup||'',dropoff:saved.dropoff||'',time:saved.time||'',flight:saved.flight||'',area:saved.area||'',duration:saved.duration||'8',attraction:saved.attraction||'',children:saved.children||'0',ages:saved.ages||'',consent:false};
}
export function requestDraft(v,labels){
 const service=requestService(v.service),lines=[];
 if(service==='private')lines.push(`${labels.days}: ${v.days}`);
 if(service==='vehicle'){lines.push(`${labels.vehicleType}: ${labels.vehicleTypes[v.vehicleType]}`,`${labels.pickup}: ${v.pickup}`,`${labels.dropoff}: ${v.dropoff}`);if(v.time)lines.push(`${labels.time}: ${v.time}`);if(v.vehicleType==='airport'&&v.flight)lines.push(`${labels.flight}: ${v.flight}`);}
 if(service==='guide')lines.push(`${labels.area}: ${v.area}`,`${labels.duration}: ${v.duration}`);
 if(service==='ticket'){lines.push(`${labels.attraction}: ${v.attraction}`,`${labels.children}: ${v.children}`);if(Number(v.children)>0)lines.push(`${labels.ages}: ${v.ages}`);}
 return {...initialDraft(service==='private'?'private':'single'),services:[service],dateMode:v.date?'exact':'unknown',date:v.date,people:v.people,contact:v.contact,nickname:v.nickname,notes:v.notes,consent:v.consent,configuration:{service,services:[service],date:v.date,people:v.people,days:v.days,inquiryText:lines.join('\n'),sourcePath:'/?view=request&service='+service}};
}
export function validateRequest(v,labels,now){
 const errors=validateDraft(requestDraft(v,labels),now);
 const contact=v.contact?.trim()||'';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)&&!(/^\+?[\d\s().-]{7,30}$/.test(contact)&&contact.replace(/\D/g,'').length>=7&&contact.replace(/\D/g,'').length<=15))errors.contact=labels.contactError||labels.required;
 const required=(key)=>{if(!String(v[key]||'').trim())errors[key]=labels.required;};
 if(v.service!=='private')required('date');
 if(v.service==='vehicle'){required('pickup');required('dropoff');if(!['airport','transfer','charter'].includes(v.vehicleType))errors.vehicleType=labels.required;}
 if(v.service==='guide'){required('area');if(!['4','8','multi'].includes(v.duration))errors.duration=labels.required;}
 if(v.service==='ticket'){required('attraction');if(!/^\d+$/.test(v.children)||Number(v.children)>Number(v.people))errors.children=labels.childError;if(Number(v.children)>0)required('ages');}
 if(v.service==='private'&&(!Number.isInteger(Number(v.days))||Number(v.days)<1||Number(v.days)>30))errors.days=labels.required;
 return errors;
}
