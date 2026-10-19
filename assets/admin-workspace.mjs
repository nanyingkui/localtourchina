// Pure workspace rules. No customer records are changed by filtering or summaries.
export function isTestInquiry(row){
 if(row.admin_data?.test_mode==='live')return false;
 if(row.admin_data?.test_mode==='test')return true;
 return /\[(?:测试|테스트|test)(?:\s*\/\s*(?:测试|테스트|test))*\]|RELEASE QA|上线验收测试|TEST-QA-|로투차 (?:모바일 테스트|테스트 주문)/i.test(row.customer_name||'') || /^TEST[-_]/i.test(row.contact||'');
}
export function isActive(row){return !['closed','paused'].includes(row.crm_stage)&&!['completed','cancelled'].includes(row.status);}
export function isOverdue(row,now=Date.now()){return row.crm_stage!=='closed'&&!['completed','cancelled'].includes(row.status)&&!!row.follow_up_at&&new Date(row.follow_up_at).getTime()<=now;}
export function normalizedContact(value){const s=String(value||'').trim().toLowerCase();return /^[+\d\s()-]+$/.test(s)?s.replace(/[^\d]/g,''):s;}
export function inquirySummary(row){
 const text=String(row.inquiry_text||'');
 const date=row.travel_date||text.match(/(?:여행 시기|여행 기간|날짜\s*\/\s*시간|방문|여행 날짜|이용 날짜|출발 날짜|旅行日期|出发日期|日期|Travel date|Date)\s*[:：]\s*(\d{4}-\d{2}-\d{2})/i)?.[1]||'';
 const people=text.match(/(?:인원(?:\s*\/\s*연령)?|전체 인원|人数|Party size|Travell?ers)\s*[:：]\s*(\d+)\s*(?:명|人|people)?/i)?.[1]||'';
 const amount=text.match(/(?:예상 총 금액|예상 총액|预计总金额|Estimated total)\s*[:：]\s*([^\n]+)/i)?.[1]?.trim()||'';
 return {date,people,amount,dateInferred:!row.travel_date&&!!date};
}
export function filterInquiries(rows,f={},now=Date.now()){
 return rows.filter(x=>{
  if(f.scope==='test'&&!isTestInquiry(x)||f.scope!=='all'&&f.scope!=='test'&&isTestInquiry(x))return false;
  if(f.service&&x.service!==f.service)return false;
  if(f.owner==='__unassigned'&&x.assigned_to||f.owner&&f.owner!=='__unassigned'&&x.assigned_to!==f.owner)return false;
  const date=inquirySummary(x).date;
  if(f.from&&(!date||date<f.from)||f.to&&(!date||date>f.to))return false;
  if(f.queue==='overdue'&&!isOverdue(x,now)||f.queue==='active'&&!isActive(x)||f.queue&& !['overdue','active'].includes(f.queue)&&x.crm_stage!==f.queue)return false;
  if(f.status==='confirmed-group'&&!['deposit_paid','confirmed'].includes(x.status)||f.status&&f.status!=='confirmed-group'&&x.status!==f.status)return false;
  return true;
 });
}
export function statusConflict(body){
 if(body.status==='deposit_paid'&&!body.payment_received)return '尚未勾选收到付款，不能向客人显示“定金已确认”。请核实后更新。';
 if((body.status==='confirmed'||body.crm_stage==='booked')&&!body.supplier_confirmed)return '供应商尚未确认，请先核实服务可订状态。';
 if(body.quote_amount!==null&&(!Number.isFinite(body.quote_amount)||body.quote_amount<0))return '报价金额必须是有效的非负数字。';
 return '';
}
