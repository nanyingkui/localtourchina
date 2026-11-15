import React,{useEffect} from 'react';
export default function FurongTransfer({lang='ko',embedded=false}){
 const path=(lang==='ko'?'':'/'+lang)+'/services/furong-transfer.html';
 useEffect(()=>{if(!embedded)window.location.replace(path);},[path,embedded]);
 return <section className="furong-product"><h2>{lang==='zh'?'芙蓉镇接送':lang==='en'?'Furong transfers':'부용진 이동'}</h2><p>{lang==='zh'?'选择日期、人数和接送区域，查看最新报价。':lang==='en'?'Choose date, passengers and transfer areas for the latest quote.':'날짜·인원·접송 지역을 선택해 최신 요금을 확인하세요.'}</p><a className="button primary" href={path}>{lang==='zh'?'选择接送条件 →':lang==='en'?'Choose transfer details →':'이동 조건 선택 →'}</a></section>;
}
