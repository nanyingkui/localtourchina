// Display conversion only; the original selling-price calculations remain in KRW.
window.LTCPriceFX=null;
window.LTCFormatPrice=(amount,language=document.documentElement.lang)=>{
 const ko=!language.startsWith('zh')&&language!=='en';
 if(!window.LTCPriceFX||window.LTCPriceFX.rates.CNY<0.0049897-1e-10)return ko?'요금 재확인':language==='en'?'Quote required':'报价待确认';
 const currency=ko?'KRW':language==='en'?'USD':'CNY',rate=ko?1:window.LTCPriceFX.rates[currency];
 return new Intl.NumberFormat(ko?'ko-KR':language==='en'?'en-US':'zh-CN',{style:'currency',currency,maximumFractionDigits:ko?0:2}).format(amount*rate);
};
document.addEventListener('DOMContentLoaded',async()=>{
 try{
  const response=await fetch('https://api.frankfurter.dev/v1/latest?base=KRW&symbols=CNY,USD',{signal:AbortSignal.timeout(8000)});if(!response.ok)return;
  const fx=await response.json();if(!(fx.rates?.CNY>0)||!(fx.rates?.USD>0)||!fx.date)return;
  window.LTCPriceFX=fx;
  for(const id of ['service-ticket','service-vehicle','service-guide']){const panel=document.getElementById(id);if(panel)panel.dispatchEvent(new Event('input',{bubbles:true}));}
  const ticket=document.querySelector('.age-count');ticket?.dispatchEvent(new Event('input',{bubbles:true}));
  for(const panel of document.querySelectorAll('#service-ticket,#service-vehicle')){const note=document.createElement('p');note.className='store-fine';note.textContent=(document.documentElement.lang.startsWith('zh')?'汇率日期：':'환율 기준일: ')+fx.date;panel.append(note);}
 }catch{}
});
