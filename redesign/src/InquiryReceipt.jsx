import React from 'react';
import {serviceNames,dateLabel} from './consultation.mjs';
import './inquiry-receipt.css';
const words={
 ko:{title:'상담 요청을 접수했습니다.',intro:'담당자가 남겨 주신 연락처로 안내합니다. 카카오톡에 신청 내용을 다시 보낼 필요는 없어요.',number:'상담번호',copy:'번호 복사',status:'문의 진행 상황 확인',date:'여행 날짜',people:'인원',services:'선택한 서비스',contact:'답변받을 연락처',next:'이제 무엇을 하면 되나요?',steps:['아래 연락처가 맞는지 확인해 주세요.','담당자가 일정·예약 가능 여부·최종 견적을 안내합니다.','견적을 확인한 뒤 예약과 결제를 진행합니다. 지금 결제할 필요는 없어요.'],correction:'연락처·요청 수정 문의',full:'신청한 내용 자세히 보기',copyAll:'신청 내용 복사',home:'홈으로 돌아가기',waiting:'현재 상태 · 담당자 확인 대기',preview:'미리보기 · 아직 실제 접수되지 않았습니다.'},
 zh:{title:'咨询已提交成功。',intro:'工作人员会通过您留下的联系方式回复，无需再到 KakaoTalk 重复发送申请。',number:'咨询编号',copy:'复制编号',status:'查看咨询进度',date:'出行日期',people:'人数',services:'所选服务',contact:'接收回复的联系方式',next:'接下来怎么做？',steps:['请确认下方联系方式准确。','工作人员将核对行程、可用情况和最终报价。','确认报价后再安排预订和付款，现在无需付款。'],correction:'更正联系方式或补充需求',full:'展开完整申请内容',copyAll:'复制申请内容',home:'返回首页',waiting:'当前状态 · 等待工作人员核对',preview:'预览记录，尚未实际提交。'},
 en:{title:'Your inquiry has been received.',intro:'Our team will reply using your contact details. You do not need to resend your request on KakaoTalk.',number:'Inquiry number',copy:'Copy number',status:'Check inquiry progress',date:'Travel dates',people:'Travellers',services:'Selected services',contact:'Your contact',next:'What happens next?',steps:['Check that your contact details below are correct.','Our team will confirm the itinerary, availability and final quote.','Booking and payment follow quote confirmation. No payment is needed now.'],correction:'Correct details or add a request',full:'View the complete inquiry',copyAll:'Copy inquiry details',home:'Back to home',waiting:'Current status · awaiting team review',preview:'Preview only. Not submitted to our team.'}
};
export default function InquiryReceipt({record,lang,heading,copy,notice,text,copyArea,onHome,onEdit}){
 const t=words[lang]||words.ko;
 const serviceText=record.services.map(id=>({zh:{private:'私人定制游',ticket:'景区门票',vehicle:'用车与接送',tickets:'景区门票',vehicles:'用车与接送',localguide:'导游服务',onlineguide:'在线旅行支持',guide:'导游',help:'行程咨询'},en:{private:'Private trip',ticket:'Attraction tickets',vehicle:'Transport & transfers',tickets:'Attraction tickets',vehicles:'Transport & transfers',localguide:'Local guide',onlineguide:'Online travel support',guide:'Guide',help:'Itinerary advice'}}[lang]?.[id]||serviceNames[id]||id)).join(' · ');
 return <section className="success-page receipt-v2">
  <header className="receipt-heading"><img src="/assets/mascot-v1/success.webp" alt="" width="64" height="80"/><div><p className="receipt-state">{record.productionSubmitted?t.waiting:t.preview}</p><h1 ref={heading} tabIndex={-1}>{t.title}</h1><p>{t.intro}</p></div></header>
  <div className="receipt-card"><div className="receipt-number"><div><span>{t.number}</span><strong>{record.reference}</strong></div><button type="button" className="receipt-secondary" onClick={()=>copy(record.reference,'number')}>{t.copy}</button></div>
   <dl className="receipt-summary"><div><dt>{t.services}</dt><dd>{serviceText}</dd></div><div><dt>{t.date}</dt><dd>{dateLabel(record)}</dd></div><div><dt>{t.people}</dt><dd>{record.people}{lang==='zh'?'人':lang==='en'?' travellers':'명'}</dd></div><div className="receipt-contact"><dt>{t.contact}</dt><dd>{record.contact}</dd></div></dl>
   {record.statusUrl&&<a className="receipt-primary" href={record.statusUrl}>{t.status}<span aria-hidden="true"> →</span></a>}
  </div>
  <section className="receipt-next"><h2>{t.next}</h2><ol>{t.steps.map(line=><li key={line}>{line}</li>)}</ol></section>
  <div className="receipt-actions"><a className="receipt-secondary" href="https://pf.kakao.com/_hvrmn/chat" target="_blank" rel="noopener noreferrer">{t.correction}</a><button className="receipt-secondary" onClick={onHome}>{t.home}</button></div>
  <p role="status" className="notice">{notice}</p>
  <details className="receipt-full"><summary>{t.full}</summary><label htmlFor="saved-text">{t.full}</label><textarea id="saved-text" ref={copyArea} value={text} readOnly rows="7"/><button className="receipt-secondary" onClick={()=>copy(text,'details')}>{t.copyAll}</button></details>
  {!record.productionSubmitted&&<button className="receipt-secondary" onClick={onEdit}>Edit preview</button>}
 </section>;
}
