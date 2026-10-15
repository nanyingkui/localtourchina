// Only forward email verification links to the configured first-party Auth endpoint.
export function currentBrowserLoginUrl(raw,authBase,pageOrigin){
 const auth=new URL(authBase),page=new URL(pageOrigin),link=new URL(String(raw).trim());
 if(auth.protocol!=='https:'||page.protocol!=='https:'||link.origin!==auth.origin||link.username||link.password||link.pathname!=='/auth/v1/verify'||link.hash)throw Error('invalid-login-link');
 const type=link.searchParams.get('type'),token=link.searchParams.get('token');
 if(!['magiclink','email','signup'].includes(type)||!token||!/^[A-Za-z0-9_-]{16,512}$/.test(token))throw Error('invalid-login-link');
 const target=new URL('/auth/v1/verify',auth.origin);
 target.searchParams.set('token',token);target.searchParams.set('type',type);
 target.searchParams.set('redirect_to',page.origin+'/admin.html');
 return target.href;
}

export function loginEmailFailure(status,body={},retryAfter=''){
 const known={over_email_send_rate_limit:'登录邮件发送已达服务限额。请保留已登录的 Chrome 会话，稍后再试；无需更换邮箱。',over_request_rate_limit:'登录请求过于频繁，请稍后再试，不要连续重发。',email_address_not_authorized:'发信服务不允许向此邮箱投递，需要检查邮件服务配置及允许收件地址。',email_address_invalid:'邮件服务不接受此邮箱地址，请核对地址。',user_not_found:'登录账号不存在，需要核对已登记的管理员账号。',signup_disabled:'此邮箱尚不能使用登录服务，需要核对账号登记；不会自动创建新账号。',otp_disabled:'邮件链接登录尚未启用，需要检查登录服务配置。',email_provider_disabled:'邮件登录服务未启用，需要检查登录服务配置。',validation_failed:'登录请求未通过校验，请核对邮箱格式和服务配置。'};
 const code=Object.hasOwn(known,body?.code)?body.code:'unknown';
 const message=known[code]||(status===429?'邮件发送受到频率限制，请稍后再试，不要连续重发。':status>=500?'邮件发送服务异常，请检查邮件服务配置。':'登录邮件发送失败，需要核对服务响应；不能据此认定邮箱填错。');
 const seconds=/^\d+$/.test(String(retryAfter))?Math.min(86400,Math.max(1,Number(retryAfter))):status===429||code.startsWith('over_')?60:0;
 return {code,status,message:message+`（HTTP ${status} / ${code}）`,cooldownSeconds:seconds};
}
export async function requestAdminEmail(config,fetcher=fetch){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetcher(`${config.url}/auth/v1/otp?redirect_to=${encodeURIComponent(config.redirect)}`,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email:config.email,create_user:false}),signal:controller.signal});
  if(response.ok)return {ok:true,cooldownSeconds:60};
  let body={};try{body=await response.json();}catch{}
  return {ok:false,...loginEmailFailure(response.status,body,response.headers?.get?.('Retry-After')||'')};
 }catch{return {ok:false,code:'network',message:'未能确认邮件发送结果，请先检查收件箱；不要连续重发。网络恢复后再试。',cooldownSeconds:60};}
 finally{clearTimeout(timeout);}
}

export function passwordAuthFailure(status,body={}){
 const known={invalid_credentials:'邮箱或密码不正确；从未设置过密码时，请先在已登录后台设置。',email_not_confirmed:'此账号的邮箱尚未完成验证，请检查账号状态。',user_banned:'此账号目前不能登录，请联系账号管理员。',weak_password:'密码未满足账号服务要求，请使用至少12位的新密码。',reauthentication_needed:'设置密码需要重新验证身份，请保留当前后台，完成身份验证后再设置。',reauthentication_not_valid:'身份验证未通过，请重新验证后设置。',same_password:'新密码与当前密码相同，无需重复修改。',session_not_found:'登录会话已失效，请重新登录后再设置密码。',session_expired:'登录会话已过期，请重新登录后再设置密码。',over_request_rate_limit:'登录尝试过于频繁，请稍后再试。'};
 const code=Object.hasOwn(known,body?.code)?body.code:'unknown';
 return {ok:false,code,message:known[code]||(status===400?'邮箱或密码未通过验证，请核对账号；未设置密码时需要先设置。':status===401?'当前验证信息已失效，请重新登录。':status===429?'登录尝试受到频率限制，请稍后再试。':status>=500?'账号服务暂时异常，请稍后再试。':'未能完成身份验证，请核对账号状态。')};
}
export async function requestAdminPassword(config,fetcher=fetch){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetcher(config.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email:config.email,password:config.password}),signal:controller.signal});
  let body={};try{body=await response.json();}catch{}
  if(!response.ok)return passwordAuthFailure(response.status,body);
  if(!body.access_token||!body.refresh_token||!body.user?.id)return {ok:false,code:'response',message:'登录响应不完整，请稍后重试。'};
  return {ok:true,session:body};
 }catch{return {ok:false,code:'network',message:'无法连接账号服务，请检查网络后重试。'};}finally{clearTimeout(timeout);}
}
export async function changeAdminPassword(config,fetcher=fetch){
 if(config.password!==config.confirm)return {ok:false,code:'mismatch',message:'两次输入的密码不一致。'};
 if(typeof config.password!=='string'||config.password.length<12)return {ok:false,code:'weak_password',message:'请使用至少12位的新密码。'};
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetcher(config.url+'/auth/v1/user',{method:'PUT',headers:{apikey:config.key,Authorization:'Bearer '+config.accessToken,'Content-Type':'application/json'},body:JSON.stringify({password:config.password}),signal:controller.signal});
  if(!response.ok){let body={};try{body=await response.json();}catch{}return passwordAuthFailure(response.status,body);}
  return {ok:true};
 }catch{return {ok:false,code:'network',message:'未能确认密码是否已更新，请保留当前登录，并通过另一个浏览器验证新密码。不要连续修改。'};}finally{clearTimeout(timeout);}
}
