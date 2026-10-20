import React,{useEffect} from 'react';
import {serviceInquiryEntry} from './inquiry-entry.mjs';

// Retire short-form links without discarding a traveller's existing tab draft.
export default function DetailedServiceRedirect({lang='ko'}){
 const service=new URLSearchParams(location.search).get('service')||'ticket';
 const href=serviceInquiryEntry(lang,service);
 useEffect(()=>{
  try{
   const saved=JSON.parse(sessionStorage.getItem('ltc-service-request-v1-'+service)||'null');
   if(saved){
    sessionStorage.setItem('ltc-request-handoff-v1',JSON.stringify({...saved,service,consent:false}));
    globalThis.LTCUnifiedTrip?.rememberContact(saved);
   }
  }catch{}
  location.replace(href);
 },[href,service]);
 return <section className="service-request"><h1>{lang==='zh'?'详细预订信息':lang==='en'?'Detailed booking options':'상세 예약 정보'}</h1><p>{lang==='zh'?'正在打开详细填写页面，已有草稿会保留。':lang==='en'?'Opening the detailed form. Your existing draft is retained.':'상세 입력 페이지로 이동합니다. 작성 중인 내용은 보관됩니다.'}</p><a className="button primary" href={href}>{lang==='zh'?'继续填写':lang==='en'?'Continue':'상세 입력 계속하기'}</a></section>;
}
