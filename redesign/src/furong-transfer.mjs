export const TRANSFER_VERSION='furong-v4-20261101';
import {RATES} from './catalog-transfer-rates.mjs';
export {RATES};
export function transferQuote({mode='shared',region='city',journey='oneway',people=1,returnRegion=region}){
 if(!['shared','private'].includes(mode)||!['oneway','roundtrip'].includes(journey)||!RATES[region]||!RATES[returnRegion]||!Number.isInteger(Number(people))||people<1||people>8)throw Error('INVALID_TRANSFER');
 const count=mode==='shared'?Number(people):1,legs=[{region,amount:RATES[region][mode]*count}];
 if(journey==='roundtrip')legs.push({region:returnRegion,amount:RATES[returnRegion][mode]*count});
 return {currency:'KRW',legs,total:legs.reduce((n,l)=>n+l.amount,0),unit:mode==='shared'?'person':'vehicle'};
}
export function earliestTransferDate(now=new Date()){
 const china=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),get=k=>china.find(x=>x.type===k).value;
 const d=new Date(Date.UTC(Number(get('year')),Number(get('month'))-1,Number(get('day'))+3));return d.toISOString().slice(0,10);
}
