import {mailConfiguration,newInquiryEmail,testEmail,deliveryOutcome,nextAttempt} from './mail-policy.mjs';
const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const origins=new Set(['https://localtourchina.com','https://www.localtourchina.com']);
async function db(path:string,options:any={}){
 const res=await fetch(base+'/rest/v1/'+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error('database_'+res.status);return res.status===204?null:res.json();
}
const rpc=(name:string,args:any={})=>db('rpc/'+name,{method:'POST',body:JSON.stringify(args)});
const runtime=(body:any)=>db('inquiry_mail_settings?id=eq.true',{method:'PATCH',body:JSON.stringify(body)});
async function isAdmin(req:Request){
 const token=req.headers.get('authorization')||'';
 if(!token.startsWith('Bearer '))return null;
 const headers={apikey:key,Authorization:token,'Content-Type':'application/json'};
 const user=await fetch(base+'/auth/v1/user',{headers,signal:AbortSignal.timeout(8000)});
 if(!user.ok)return null;
 const account=await user.json();
 const check=await fetch(base+'/rest/v1/rpc/is_admin',{method:'POST',headers,body:'{}',signal:AbortSignal.timeout(8000)});
 if(!check.ok||await check.json()!==true)return null;
 return account;
}
async function provider(config:any,payload:any,idempotency:string){
 return fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+config.api_key,'Content-Type':'application/json','Idempotency-Key':idempotency},body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)});
}
async function run(){
 if(!await rpc('inquiry_mail_claim'))return {skipped:true};
 try{
  const config=await rpc('inquiry_mail_config');
  if(!config.api_key){await runtime({enabled:false,last_error:'not_configured'});return {disabled:true};}
  await rpc('inquiry_mail_enqueue');
  const jobs=await db('inquiry_mail_deliveries?status=eq.pending&next_attempt_at=lte.'+encodeURIComponent(new Date().toISOString())+'&order=created_at.asc&limit=10');
  let accepted=0,throttled=false;const started=Date.now();
  for(const job of jobs){
   if(Date.now()-started>45000)break;
   if(!await rpc('inquiry_mail_budget',{p_test:false})){throttled=true;break;}
   let payload=job.payload;
   if(!payload){
    const rows=await db('inquiries?id=eq.'+encodeURIComponent(job.inquiry_id)+'&select=id,reference,service,travel_date,customer_name,contact,inquiry_text');
    if(!rows.length){await db('inquiry_mail_deliveries?id=eq.'+job.id,{method:'PATCH',body:JSON.stringify({status:'skipped',last_error:'inquiry_removed'})});continue;}
    payload=newInquiryEmail(rows[0],config);
   }
   const first=job.first_attempt_at||new Date().toISOString();
   if(Date.now()-new Date(first).getTime()>=20*3600000){await db('inquiry_mail_deliveries?id=eq.'+job.id,{method:'PATCH',body:JSON.stringify({status:'uncertain',last_error:'retry_window_expired'})});continue;}
   const persisted=await db('inquiry_mail_deliveries?id=eq.'+job.id,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status:'sending',payload,first_attempt_at:first,attempts:job.attempts+1,attempted_at:new Date().toISOString()})});
   payload=persisted[0].payload;
   let status=0,providerId=null;
   try{const res=await provider(config,payload,'ltc-new-inquiry/'+job.id);status=res.status;if(res.ok){const body=await res.json();providerId=body.id||null;if(!providerId)status=0;}}catch{}
   const outcome=deliveryOutcome(status,first,Date.now(),job.attempts+1);
   await db('inquiry_mail_deliveries?id=eq.'+job.id,{method:'PATCH',body:JSON.stringify({status:outcome,provider_id:providerId,accepted_at:outcome==='accepted'?new Date().toISOString():null,next_attempt_at:nextAttempt(job.attempts+1),last_error:outcome==='accepted'?null:'provider_'+status})});
   if(outcome==='accepted')accepted++;
  }
  await runtime({last_run_at:new Date().toISOString(),last_error:throttled?'daily_budget_reached':null});return {accepted,throttled};
 }finally{await runtime({lock_until:null});}
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 const cors=origin&&origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}:{};
 const reply=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...cors}});
 if(origin&&!origins.has(origin))return reply({error:'origin_not_allowed'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 try{
  const action=new URL(req.url).pathname.split('/').pop();
  if(action==='run'){
   if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
   const expected=await rpc('inquiry_mail_worker_key');
   if(!expected||req.headers.get('x-ltc-mail-worker')!==expected)return reply({error:'unauthorized'},403);
   return reply(await run());
  }
  const account=await isAdmin(req);if(!account)return reply({error:'admin_required'},403);
  if(action==='status'&&req.method==='GET')return reply(await rpc('inquiry_mail_status'));
  if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
  if(Number(req.headers.get('content-length')||0)>4096)return reply({error:'request_too_large'},413);
  const body=await req.json();
  if(action==='setup'){
   const config=mailConfiguration(body,account.email);
   await rpc('inquiry_mail_configure',{p_config:config});return reply({configured:true,recipient:config.recipient,enabled:false});
  }
  if(action==='test'){
   const settings=await rpc('inquiry_mail_status');if(!settings.configured)return reply({error:'not_configured'},409);
   if(!await rpc('inquiry_mail_budget',{p_test:true}))return reply({error:'test_cooldown_or_daily_limit'},429);
   const config=await rpc('inquiry_mail_config');
   let res;try{res=await provider(config,testEmail(config),'ltc-mail-test/'+crypto.randomUUID());}catch{return reply({error:'test_result_uncertain'},502);}
   if(!res.ok)return reply({error:'test_provider_'+res.status},502);
   const data=await res.json();if(!data.id)return reply({error:'test_result_uncertain'},502);
   await runtime({last_test_at:new Date().toISOString(),last_test_provider_id:data.id});return reply({accepted:true,recipient:config.recipient});
  }
  if(action==='enable'){
   const status=await rpc('inquiry_mail_status');
   if(body.enabled===true&&(!status.configured||!status.last_test_at))return reply({error:'test_required'},409);
   await rpc('inquiry_mail_enable',{p_enabled:body.enabled===true});return reply({enabled:body.enabled===true});
  }
  return reply({error:'not_found'},404);
 }catch(err){return reply({error:/^(sender_domain_required|verified_admin_email_required|invalid_api_key)$/.test(err.message)?err.message:'operation_failed'},400);}
});
