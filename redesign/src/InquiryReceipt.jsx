import React,{useState,useRef} from 'react';
import {copyInquiryAndOpenChat,CUSTOMER_CHAT_URL} from './chat-handoff.mjs';
import {serviceNames,dateLabel} from './consultation.mjs';
import './inquiry-receipt.css';
const words={
 ko:{title:'상담 요청을 접수했습니다.',intro:'신청 내용이 저장되었습니다. 아래 버튼으로 내용을 복사하고 카카오톡 채널에 붙여넣어 전송해 주세요.',number:'상담번호',copy:'번호 복사',status:'문의 진행 상황 확인',date:'여행 날짜',people:'인원',services:'선택한 서비스',contact:'답변받을 연락처',next:'이제 무엇을 하면 되나요?',steps:['카카오톡 채널에서 복사한 상담번호를 붙여넣고 전송해 주세요. 채널 추가나 채팅창 열기만으로는 메시지가 전송되지 않습니다.','담당자가 일정·예약 가능 여부·최종 견적을 안내합니다.','견적을 확인한 뒤 예약과 결제를 진행합니다. 지금 결제할 필요는 없어요.'],correction:'연락처·요청 수정 문의',full:'신청한 내용 자세히 보기',copyAll:'신청 내용 복사',home:'홈으로 돌아가기',waiting:'현재 상태 · 카카오톡에서 전송해 주세요',preview:'미리보기 · 아직 실제 접수되지 않았습니다.'},
 zh:{title:'咨询已提交成功。',intro:'申请内容已保存。请复制完整需求并打开 KakaoTalk Channel，在聊天中粘贴发送。',number:'咨询编号',copy:'复制编号',status:'查看咨询进度',date:'出行日期',people:'人数',services:'所选服务',contact:'接收回复的联系方式',next:'接下来怎么做？',steps:['在 KakaoTalk Channel 粘贴并发送咨询编号。仅添加频道或打开聊天窗口，不会发送消息。','工作人员将核对行程、可用情况和最终报价。','确认报价后再安排预订和付款，现在无需付款。'],correction:'更正联系方式或补充需求',full:'展开完整申请内容',copyAll:'复制申请内容',home:'返回首页',waiting:'申请已保存 · 请在 Kakao 发送需求',preview:'预览记录，尚未实际提交。'},
 en:{title:'Your inquiry has been received.',intro:'Your details are saved. Copy your inquiry below, open KakaoTalk, then paste and send it.',number:'Inquiry number',copy:'Copy number',status:'Check inquiry progress',date:'Travel dates',people:'Travellers',services:'Selected services',contact:'Your contact',next:'What happens next?',steps:['Paste and send your inquiry number in KakaoTalk. Opening the chat or adding the channel does not send a message.','Our team will confirm the itinerary, availability and final quote.','Booking and payment follow quote confirmation. No payment is needed now.'],correction:'Correct details or add a request',full:'View the complete inquiry',copyAll:'Copy inquiry details',home:'Back to home',waiting:'Inquiry saved · send your details on Kakao',preview:'Preview only. Not submitted to our team.'}
};
export default function InquiryReceipt({record,lang,heading,copy,notice,text,copyArea,onHome,onEdit}){
 const chatEnabled=false; // Released consultations continue in Kakao Channel.
 const base=words[lang]||words.ko;
 const chatCopy={ko:{intro:'문의가 저장되었습니다. 같은 대화에서 답변을 확인하고 질문을 이어가세요.',title:'담당자와 대화 이어가기',open:'문의 대화 열기',notice:'페이지를 닫으면 아직 새 답변 알림을 받을 수 없습니다. 이 전용 링크를 보관해 주세요.',steps:['담당자가 선택한 내용을 확인하고 이 문의에서 답변합니다.','일정 확인이 필요하면 담당자가 카카오톡 확인 버튼을 보내 드립니다.','최종 견적과 예약 가능 여부를 확인한 뒤 예약과 결제를 진행합니다.']},zh:{intro:'咨询已保存，请在同一会话查看客服回复并继续沟通。',title:'继续和客服沟通',open:'打开咨询对话',notice:'目前关闭页面后尚无手机提醒，请保留此私密链接。',steps:['客服核对您所选内容，并在同一咨询回复。','需要确认行程时，客服会发送 Kakao 确认入口。','可订情况和最终报价确认后，再安排预订和付款。']},en:{intro:'Your inquiry is saved. Continue the conversation and view replies in the same place.',title:'Continue the conversation',open:'Open conversation',notice:'Phone notifications are not connected yet. Keep this private link.',steps:['Our team reviews your selections and replies in this conversation.','When ready, our team sends a Kakao itinerary confirmation link.','Booking and payment follow availability and quote confirmation.']}}[lang]||{};
 const t=chatEnabled?{...base,intro:chatCopy.intro,steps:chatCopy.steps}:base;
 const [chatStatus,setChatStatus]=useState(''),[chatBusy,setChatBusy]=useState(false),chatLock=useRef(false);
 const chatWords={
 ko:{title:'카카오톡으로 상담을 이어가세요',action:'문의 내용 복사 · 카카오톡 열기',hint:'채팅창에 붙여넣고 전송 버튼을 눌러 주세요. 상세 신청 내용을 다시 작성할 필요는 없습니다.',fallback:'카카오톡 직접 열기',fail:'자동 복사가 되지 않았습니다. 위 상담번호를 복사한 뒤 카카오톡에서 보내 주세요.',copied:'문의 내용이 복사되었습니다. 채팅창에서 붙여넣고 전송해 주세요.',busy:'문의 내용 복사 중…',alternative:'카카오톡 연결이 안 되면 아래 연락처가 정확한지 확인하고, 상담번호와 함께 WhatsApp으로 연락해 주세요.'},
 zh:{title:'通过 KakaoTalk 继续咨询',action:'复制完整需求并打开 KakaoTalk',hint:'进入聊天后请粘贴并点击发送，无需重新填写详细申请。',fallback:'直接打开 KakaoTalk',fail:'自动复制失败，请复制上方咨询编号后到 KakaoTalk 发送。',copied:'完整需求已复制，请在聊天中粘贴并发送。',busy:'正在复制…',alternative:'如果无法连接 KakaoTalk，请核对下方联系方式，也可通过 WhatsApp 提供咨询编号。'},
 en:{title:'Continue your consultation on KakaoTalk',action:'Copy inquiry details · open KakaoTalk',hint:'Paste and press Send in the chat. You do not need to fill out your detailed application again.',fallback:'Open KakaoTalk directly',fail:'Copy failed. Copy the inquiry number above and send it in KakaoTalk.',copied:'Inquiry details copied. Paste and send them in the chat.',busy:'Copying…',alternative:'If KakaoTalk is unavailable, check your contact details below and send your inquiry number via WhatsApp.'}
 }[lang]||{};
 async function openChat(){
  if(chatLock.current)return;chatLock.current=true;setChatBusy(true);setChatStatus('');
  try{const result=await copyInquiryAndOpenChat(text);setChatStatus(result.copied?chatWords.copied:chatWords.fail);}finally{chatLock.current=false;setChatBusy(false);}
 }
 const serviceText=record.services.map(id=>({zh:{private:'私人定制游',ticket:'景区门票',vehicle:'用车与接送',tickets:'景区门票',vehicles:'用车与接送',localguide:'导游服务',onlineguide:'在线旅行支持',guide:'导游',help:'行程咨询'},en:{private:'Private trip',ticket:'Attraction tickets',vehicle:'Transport & transfers',tickets:'Attraction tickets',vehicles:'Transport & transfers',localguide:'Local guide',onlineguide:'Online travel support',guide:'Guide',help:'Itinerary advice'}}[lang]?.[id]||serviceNames[id]||id)).join(' · ');
 return <section className="success-page receipt-v2">
  <header className="receipt-heading"><img src="/assets/mascot-v1/success.webp" alt="" width="64" height="80"/><div><p className="receipt-state">{record.productionSubmitted?t.waiting:t.preview}</p><h1 ref={heading} tabIndex={-1}>{t.title}</h1><p>{t.intro}</p></div></header>
  <div className="receipt-card"><div className="receipt-number"><div><span>{t.number}</span><strong>{record.reference}</strong></div><button type="button" className="receipt-secondary" onClick={()=>copy(record.reference,'number')}>{t.copy}</button></div>
   {chatEnabled?<section className="receipt-chat-handoff"><h2>{chatCopy.title}</h2><a className="receipt-primary" href={record.statusUrl}>{chatCopy.open}</a><p>{chatCopy.notice}</p></section>:<section className="receipt-chat-handoff"><h2>{chatWords.title}</h2><p>{chatWords.hint}</p><button type="button" className="receipt-primary receipt-kakao" disabled={chatBusy} onClick={openChat}>{chatBusy?chatWords.busy:chatWords.action}</button><p role="status" className="receipt-chat-status">{chatStatus}</p><a className="receipt-secondary" href={CUSTOMER_CHAT_URL} target="_blank" rel="noopener noreferrer">{chatWords.fallback}</a><p>{chatWords.alternative} <a href="https://wa.me/821055722601" target="_blank" rel="noopener noreferrer">WhatsApp</a></p></section>}
   <dl className="receipt-summary"><div><dt>{t.services}</dt><dd>{serviceText}</dd></div><div><dt>{t.date}</dt><dd>{dateLabel(record)}</dd></div><div><dt>{t.people}</dt><dd>{record.people}{lang==='zh'?'人':lang==='en'?' travellers':'명'}</dd></div><div className="receipt-contact"><dt>{t.contact}</dt><dd>{record.contact}</dd></div></dl>
   {record.statusUrl&&<a className="receipt-secondary receipt-status-link" href={record.statusUrl}>{t.status}<span aria-hidden="true"> →</span></a>}
  </div>
  <section className="receipt-next"><h2>{t.next}</h2><ol>{t.steps.map(line=><li key={line}>{line}</li>)}</ol></section>
  <div className="receipt-actions"><a className="receipt-secondary" href="https://pf.kakao.com/_hvrmn/chat" target="_blank" rel="noopener noreferrer">{t.correction}</a><button className="receipt-secondary" onClick={onHome}>{t.home}</button></div>
  <p role="status" className="notice">{notice}</p>
  <details className="receipt-full"><summary>{t.full}</summary><label htmlFor="saved-text">{t.full}</label><textarea id="saved-text" ref={copyArea} value={text} readOnly rows="7"/><button className="receipt-secondary" onClick={()=>copy(text,'details')}>{t.copyAll}</button></details>
  {!record.productionSubmitted&&<button className="receipt-secondary" onClick={onEdit}>Edit preview</button>}
 </section>;
}

