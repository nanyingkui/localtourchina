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
