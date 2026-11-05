import {requestText} from './model.mjs';
export function channelBrief(items,lang='ko',allItems=items){
 const w=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
 const lines=requestText(items,lang,allItems).split('\n');
 lines[0]=w('[로투차 카카오톡 상담]','【罗途查 Kakao频道咨询】','[LocalTourChina Kakao inquiry]');
 lines[1]=w('선택한 서비스와 여행 요청입니다. 최종 요금·가능 여부와 예약은 상담 후 확인해 주세요.','以下是选好的服务与旅行需求，请客服核对最终价格、可用情况及预订安排。','These are my selected services and travel requests. Please confirm final prices, availability and booking arrangements.');
 return lines.join('\n');
}
