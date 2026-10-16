const kinds={unanswered:['未首次回复','咨询接收后，尚未记录首次回复。'],followup_due:['跟进到期','已到约定跟进时间，请处理并更新下一次跟进时间。'],unassigned:['未分配负责人','咨询接收后，尚未指定负责人。']};
const statuses={pending:'待发送',sending:'发送中',sent:'发送成功（未确认已读）',failed:'发送失败',uncertain:'结果不确定，请核对 Kakao',cancelled:'已取消发送'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=v=>{if(!v||!Number.isFinite(Date.parse(v)))return '暂无';return new Date(v).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});};
export function reminderEventKey(row){return String(row.dedup_key||'').replace(/:\d{4}-\d{2}-\d{2}$/,'');}
export function summarizeReminders(rows){
 const seen=new Map(),events=new Map();let repeatedKeys=0;
 for(const row of rows){if(row.dedup_key){if(seen.has(row.dedup_key))repeatedKeys++;seen.set(row.dedup_key,true);}if(row.status==='sent'){const key=reminderEventKey(row);if(key)events.set(key,(events.get(key)||0)+1);}}
 return {total:rows.length,retried:rows.filter(r=>Number(r.attempts)>1).length,repeatedKeys,repeatEvents:[...events.values()].filter(n=>n>1).length};
}
export function renderReminderHistory(rows){
 if(!rows.length)return '<p>目前没有提醒发送记录。</p>';
 const summary=summarizeReminders(rows);
 return `<p class="reminder-summary" role="status">当前显示最近 ${rows.length} 条记录 · 多次尝试 ${summary.retried} 条 · 同一事项多次发送 ${summary.repeatEvents} 组${summary.repeatedKeys?' · 发现重复记录，请检查':''}。逾期事项按原规则每日再次提醒，不代表重复重试。</p><p class="admin-section-help">提醒发给管理者本人，不是发给客人的回复。时间为中国时间（UTC+8）。历史台账未保存完整消息原文，以下显示提醒事项；同一时间的多条事项可能合并在一条消息中。</p><div class="reminder-history">${rows.map(row=>{
 const inquiry=row.inquiries,kind=kinds[row.kind]||['其他提醒','未知提醒类型，请核对。'];
 const repeat=/:\d{4}-\d{2}-\d{2}$/.test(row.dedup_key||'');
 return `<article class="reminder-record"><header><div>${inquiry?.id?`<button type="button" class="reminder-customer" data-reminder-inquiry="${esc(inquiry.id)}">${esc(inquiry.customer_name||'未填写姓名')} · ${esc(inquiry.reference)} <span aria-hidden="true">→</span></button>`:'<strong>对应客户不可访问或已移除</strong>'}</div><span class="badge">${esc(statuses[row.status]||row.status)}</span></header><p><strong>${kind[0]}</strong> · ${kind[1]}</p><dl><div><dt>发送时间</dt><dd>${row.sent_at?time(row.sent_at):'尚无成功发送时间'}</dd></div><div><dt>入队时间</dt><dd>${time(row.created_at)}</dd></div><div><dt>尝试次数</dt><dd>${esc(row.attempts??0)}</dd></div><div><dt>提醒规则</dt><dd>${repeat?'逾期每日再次提醒 · '+esc(String(row.dedup_key).slice(-10)):'首次事项提醒'}</dd></div></dl>${row.last_error?`<p class="reminder-error">原因：${esc(row.last_error)}</p>`:''}</article>`;
 }).join('')}</div>`;
}
