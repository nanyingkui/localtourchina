export function isTestReminder(inquiry){
 if(inquiry.admin_data?.test_mode==='live')return false;
 if(inquiry.admin_data?.test_mode==='test')return true;
 return /\[(?:测试|테스트|test)(?:\s*\/\s*(?:测试|테스트|test))*\]|RELEASE QA|上线验收测试|TEST-QA-|로투차 (?:모바일 테스트|테스트 주문)/i.test(inquiry.customer_name||'')||/^TEST[-_]/i.test(inquiry.contact||'');
}
const closed = new Set(['closed']);
export function reminderFor(inquiry, now = new Date()) {
  if (isTestReminder(inquiry)||closed.has(inquiry.crm_stage) || ['completed','cancelled'].includes(inquiry.status)) return null;
  const deadline = inquiry.follow_up_at && new Date(inquiry.follow_up_at);
  const created = new Date(inquiry.created_at);
  let kind;
  if (deadline && deadline <= now) kind = 'followup_due';
  else if (inquiry.crm_stage === 'paused') return null;
  else if (!inquiry.first_replied_at && inquiry.crm_stage === 'new' && now - created >= 30 * 60000) kind = 'unanswered';
  else if (!inquiry.assigned_to && now - created >= 60 * 60000) kind = 'unassigned';
  else return null;
  const revision = kind === 'followup_due' ? deadline.toISOString() : created.toISOString();
  return { inquiry_id: inquiry.id, kind, dedup_key: `${inquiry.id}:${kind}:${revision}`,
    text: `로투차 상담 확인 요청\n상담번호: ${inquiry.reference}\n${kind==='followup_due'?'후속 상담 기한이 도래했습니다.':kind==='unanswered'?'접수 후 아직 첫 답변이 기록되지 않았습니다.':'담당자가 지정되지 않았습니다.'}\n관리 화면에서 확인해 주세요.` };
}
export function retryDelay(attempt) { return Math.min(3600000, 60000 * 2 ** Math.max(0, attempt - 1)); }
export function kakaoTemplate(text) {
  return {object_type:'text',text,link:{web_url:'https://localtourchina.com/admin.html',mobile_web_url:'https://localtourchina.com/admin.html'},button_title:'상담 관리 열기'};
}
export function reminderDigest(jobs) {
 const counts={unanswered:0,followup_due:0,unassigned:0};
 for(const job of jobs) if(job.kind in counts) counts[job.kind]++;
 const refs=[...new Set(jobs.map(x=>x.inquiries.reference))];
 return `로투차 상담 처리 알림\n미응답 ${counts.unanswered}건 · 후속 상담 ${counts.followup_due}건 · 담당자 미지정 ${counts.unassigned}건\n상담번호: ${refs.slice(0,10).join(', ')}${refs.length>10?' 외 '+(refs.length-10)+'개':''}\n관리 화면에서 전체 목록을 확인해 주세요.`;
}
