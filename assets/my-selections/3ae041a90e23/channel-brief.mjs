import {requestText} from './model.mjs';
export function channelBrief(items,lang='ko',allItems=items){
 const w=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
 const lines=requestText(items,lang,allItems).split('\n');
 lines[0]=w('[로투차 카카오톡 상담]','【罗途查 微信咨询】','[LocalTourChina WhatsApp inquiry]');
 lines[1]=w('선택한 서비스와 여행 요청입니다. 최종 요금·가능 여부와 예약은 상담 후 확인해 주세요.','以下是选好的服务与旅行需求，请客服核对最终价格、可用情况及预订安排。','These are my selected services and travel requests. Please confirm final prices, availability and booking arrangements.');
 lines.push('',w('예약 전에 위 여행 날짜와 인원을 기준으로 실제 요금과 예약 가능 여부를 다시 확인해 주세요.','请在确认预订前，按上面填写的出行日期和人数重新核价，并确认当日是否可订。','Before confirming the booking, please recheck the price and availability for the travel date and party size listed above.'));
 return lines.join('\n');
}
