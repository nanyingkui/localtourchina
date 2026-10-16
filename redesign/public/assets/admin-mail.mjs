export function bindAdminMail({api,q}){
 const root='/functions/v1/inquiry-email/';let state=null,busy=false,loading=false;
 const message=text=>{q('mailActionStatus').textContent=text;};
 function controls(){q('mailSave').disabled=busy;q('mailTest').disabled=busy||!state?.configured;q('mailEnable').disabled=busy||!state?.configured||(!state.enabled&&!state.last_test_at);q('mailEnable').textContent=state?.enabled?'暂停邮件提醒':'我已收到测试邮件，启用新申请提醒';}
 async function load(){if(loading||q('workspace').hidden)return;loading=true;
  try{state=await api(root+'status');q('mailStatus').textContent=(state.enabled?'新申请邮件提醒已启用':state.configured?'已保存发信配置，等待测试／启用':'尚未配置业务发信服务')+' · 待发送 '+state.pending+' · 服务已接收 '+state.accepted+' · 需检查 '+state.needs_review+(state.last_run_at?' · 上次检查 '+new Date(state.last_run_at).toLocaleString('zh-CN'):'')+(state.last_error?' · '+(state.last_error==='daily_budget_reached'?'已达每日保护上限，待恢复后继续发送':'发信异常，请检查服务状态'):'');q('mailRecipient').textContent=state.recipient||'当前登录管理员已验证的邮箱';q('mailHistory').textContent=(state.recent||[]).map(x=>x.reference+' · '+({pending:'等待发送',sending:'正在发送',accepted:'发信服务已接收',failed:'失败，请检查',uncertain:'结果不确定，请核对邮箱',skipped:'已跳过'}[x.status]||x.status)+(x.last_error?' · '+x.last_error:'')).join('\n')||'尚无新申请邮件记录。启用前的历史申请不会批量补发。';controls();}
  catch{q('mailStatus').textContent='邮件通知状态暂时无法读取，请刷新重试；不能据此认定已启用。';}
  finally{loading=false;}
 }
 async function action(name,body){if(busy)return;busy=true;controls();message('正在处理…');try{
   const result=await api(root+name,{method:'POST',body:JSON.stringify(body)});
   if(name==='setup')message('配置已安全保存。请点“发送测试邮件”，并到 Gmail 确认实际收到。');
   if(name==='test')message('发信服务已接受测试请求。请到 Gmail 查看标题带“测试 / 테스트”的邮件，确认收到后再启用。');
   if(name==='enable')message(body.enabled?'已启用。此后新提交的申请会进入发送队列，约每分钟检查一次。':'已暂停新申请邮件提醒。');
   await load();return result;
  }catch{message(name==='test'?'测试未确认成功。请核对 Resend 域名验证、密钥发信权限及服务额度；不要连续点击测试。':'操作未确认成功，请刷新状态后再试。');}
  finally{if(name==='setup')q('mailApiKey').value='';busy=false;controls();}
 }
 q('mailSetupForm').addEventListener('submit',e=>{e.preventDefault();action('setup',{from:q('mailFrom').value.trim(),apiKey:q('mailApiKey').value.trim()});});
 q('mailTest').onclick=()=>action('test',{});
 q('mailEnable').onclick=()=>action('enable',{enabled:!state?.enabled});
 q('mailRefresh').onclick=load;
 setInterval(()=>{if(!document.hidden&&!q('workspace').hidden)load();},60000);
 return {load};
}
