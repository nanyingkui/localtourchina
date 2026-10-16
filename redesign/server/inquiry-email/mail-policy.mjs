export const SUBJECT_PREFIX='[LTC-NEW-INQUIRY]';
export const ADMIN_ORIGIN='https://localtourchina.com';
const services={private:'私人定制游 / 프라이빗 여행',ticket:'景区门票 / 입장권',guide:'导游 / 가이드',vehicle:'包车 / 차량',daytour:'一日游 / 당일 투어',combo:'组合服务 / 통합 예약','online-guide':'在线支持 / 온라인 여행 지원'};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line=value=>String(value??'').replace(/[\r\n\x00-\x1f]/g,' ').slice(0,180);
export function mailConfiguration(input,verifiedEmail){
 const from=String(input.from||'').trim().toLowerCase();
 if(!/^[a-z0-9._+-]+@(?:[a-z0-9-]+\.)*localtourchina\.com$/.test(from))throw Error('sender_domain_required');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verifiedEmail||''))throw Error('verified_admin_email_required');
 if(!/^re_[A-Za-z0-9_-]{12,256}$/.test(input.apiKey||''))throw Error('invalid_api_key');
 return {api_key:input.apiKey,from,recipient:verifiedEmail.toLowerCase()};
}
export function newInquiryEmail(row,config){
 if(!/^LTC-\d{8}-[A-F0-9]{6}$/.test(row.reference||''))throw Error('invalid_reference');
 const original=String(row.inquiry_text||'');
 const date=row.travel_date||original.match(/(?:여행 시기|날짜|出发日期|旅行日期)\s*[:：]\s*(\d{4}-\d{2}-\d{2})/)?.[1]||'日期待确认 / 날짜 미정';
 const people=original.match(/(?:인원|여행 인원|人数)\s*[:：]\s*(\d{1,3})/)?.[1];
 const service=services[row.service]||'旅行咨询 / 여행 상담';
 const link=ADMIN_ORIGIN+'/admin.html?inquiry='+encodeURIComponent(row.reference);
 const fields=[['申请编号 / 상담번호',row.reference],['服务 / 서비스',service],['旅行日期 / 여행일',date],['人数 / 인원',people?people+'人 / 명':'待确认 / 확인 필요'],['客户称呼 / 고객명',row.customer_name||'未填写 / 미입력'],['联系方式 / 연락처',row.contact||'未填写 / 미입력']];
 return {from:'LocalTourChina <'+config.from+'>',to:[config.recipient],subject:SUBJECT_PREFIX+' '+line(service)+' · '+line(date)+(people?' · '+people+'人':'')+' · '+row.reference,
 text:'新客户申请已保存 / 새 문의가 접수되었습니다.\n\n'+fields.map(([a,b])=>a+': '+b).join('\n')+'\n\n查看完整申请 / 신청 내용 보기: '+link+'\n需管理员登录。本邮件不是预订确认。',
 html:'<!doctype html><html><body style="font-family:Arial,sans-serif;color:#18332b;background:#f5f8f6;padding:24px"><main style="max-width:600px;margin:auto;background:white;border-radius:16px;padding:28px"><h1 style="font-size:24px">新客户申请 / 새 문의</h1><p>申请已成功保存，请登录后台查看完整需求。</p><table style="width:100%;border-collapse:collapse">'+fields.map(([a,b])=>'<tr><th style="text-align:left;padding:10px;border-bottom:1px solid #e0e8e2">'+escape(a)+'</th><td style="padding:10px;border-bottom:1px solid #e0e8e2;word-break:break-word">'+escape(b)+'</td></tr>').join('')+'</table><p style="margin-top:28px"><a href="'+escape(link)+'" style="display:inline-block;padding:14px 22px;background:#0f6c57;color:white;border-radius:10px;text-decoration:none">查看完整申请 · 신청 내용 보기 →</a></p><p style="font-size:12px;color:#66736f">需管理员登录。预约与价格须另行确认。</p></main></body></html>'};
}
export function testEmail(config){return {from:'LocalTourChina <'+config.from+'>',to:[config.recipient],subject:SUBJECT_PREFIX+' [测试 / 테스트] 邮件通知连接检查',text:'这是一封明确标注测试的通知，不代表有新客户申请。\n로투차 신규 문의 알림 연결 테스트입니다. 실제 고객 신청이 아닙니다.\n\n'+ADMIN_ORIGIN+'/admin.html'};}
export function deliveryOutcome(status,firstAttempt,now=Date.now(),attempts=1){
 if(status>=200&&status<300)return 'accepted';
 if(status===409)return 'uncertain';
 if((status===0||status===429||status>=500)&&now-new Date(firstAttempt).getTime()<20*3600000&&attempts<8)return 'pending';
 return status===0||status>=500?'uncertain':'failed';
}
export const nextAttempt=attempt=>new Date(Date.now()+Math.min(3600000,60000*2**Math.max(0,attempt-1))).toISOString();
