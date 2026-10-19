import {reminderFor, retryDelay, kakaoTemplate, reminderDigest} from '../reminder-policy.mjs';
const base=Deno.env.get('SUPABASE_URL');
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const callback='https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/crm-kakao/callback';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function db(path,options={}){
 const res=await fetch(base+'/rest/v1/'+path,{...options,headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey,'Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(8000)});
 if(!res.ok)throw new Error('database_'+res.status);
 return res.status===204?null:res.json();
}
const rpc=(name,args={})=>db('rpc/'+name,{method:'POST',body:JSON.stringify(args)});
const runtime=body=>db('crm_kakao_runtime?id=eq.true',{method:'PATCH',body:JSON.stringify(body)});
async function tokens(config,form){
 const data=new URLSearchParams({...form,client_id:config.client_id});
 if(config.client_secret)data.set('client_secret',config.client_secret);
 const res=await fetch('https://kauth.kakao.com/oauth/token',{method:'POST',body:data,signal:AbortSignal.timeout(8000)});
 if(!res.ok)throw new Error('kakao_token_'+res.status);
 const result=await res.json();
 if(!result.access_token)throw new Error('missing_access_token');
 return result;
}
async function storeTokens(result){
 await rpc('crm_kakao_secret_store',{p_patch:{access_token:result.access_token,...(result.refresh_token?{refresh_token:result.refresh_token}:{})}});
 await runtime({expires_at:new Date(Date.now()+result.expires_in*1000).toISOString()});
}
async function refresh(config){
 const result=await tokens(config,{grant_type:'refresh_token',refresh_token:config.refresh_token});
 await storeTokens(result);return {...config,...result};
}
async function send(config,text){
 return fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send',{method:'POST',headers:{Authorization:'Bearer '+config.access_token},body:new URLSearchParams({template_object:JSON.stringify(kakaoTemplate(text))}),signal:AbortSignal.timeout(8000)});
}
async function callbackRequest(url,config){
 const state=url.searchParams.get('state');
 if(!state||state.length<32)return json({error:'invalid_state'},403);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(state)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const consumed=await db('crm_kakao_states?state_hash=eq.'+hash+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString()),{method:'DELETE',headers:{Prefer:'return=representation'}});
 if(consumed.length!==1)return json({error:'state_expired_or_used'},403);
 if(url.searchParams.has('error')||!url.searchParams.get('code'))return json({error:'authorization_cancelled'},400);
 const result=await tokens(config,{grant_type:'authorization_code',code:url.searchParams.get('code'),redirect_uri:callback});
 if(!(result.scope||'').split(' ').includes('talk_message'))return json({error:'talk_message_consent_required'},400);
 await storeTokens(result);
 await runtime({connected_at:new Date().toISOString(),enabled:false,last_error:null});
 return new Response('Kakao 연결 완료. 자동 알림은 테스트 후 활성화됩니다. / Kakao 连接成功，自动提醒将在测试后启用。',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}
async function run(config,testMode){
 if(testMode){const res=await send(config,'로투차 상담 관리 연결 테스트입니다. 고객에게 발송된 메시지가 아닙니다.');if(!res.ok)throw new Error('test_send_'+res.status);const data=await res.json();if(data.result_code!==0)throw new Error('test_send_rejected');return json({test_sent:true});}
 if(!await rpc('crm_kakao_claim_run'))return json({skipped:true});
 let sent=0,failed=0;
 try{
 const now=new Date();
 await rpc('crm_enqueue_reminders');
 const last=(await db('crm_kakao_runtime?id=eq.true&select=last_sent_at'))[0].last_sent_at;
 if(last&&Date.now()-new Date(last)<15*60000){await runtime({last_run_at:new Date().toISOString()});return json({batched_until_next_window:true});}
 const jobs=await db('crm_reminder_deliveries?select=*,inquiries(id,reference,status,crm_stage,created_at,first_replied_at,assigned_to,follow_up_at,customer_name,contact,admin_data)&status=eq.pending&next_attempt_at=lte.'+encodeURIComponent(now.toISOString())+'&order=created_at.asc&limit=200');
 const valid=[],cancelled=[];
 for(const job of jobs){const row=job.inquiries;const reminder=row&&reminderFor(row,new Date());if(reminder&&(reminder.dedup_key===job.dedup_key||job.dedup_key.startsWith(reminder.dedup_key+':')))valid.push(job);else cancelled.push(job.dedup_key);}
 const updateBatch=(keys,status,error=null,next=new Date())=>rpc('crm_reminder_batch_update',{p_keys:keys,p_status:status,p_error:error,p_next:next.toISOString()});
 if(cancelled.length)await updateBatch(cancelled,'cancelled');
 if(valid.length){
 const keys=valid.map(x=>x.dedup_key);
 const text=reminderDigest(valid);
 await updateBatch(keys,'sending');
 try{
 let res=await send(config,text);
 if(res.status===401){try{config=await refresh(config);res=await send(config,text);}catch{await updateBatch(keys,'failed','token_reconnect_required');await runtime({enabled:false,connected_at:null});await rpc('crm_kakao_secret_store',{p_patch:{access_token:null,refresh_token:null}});throw new Error('token_reconnect_required');}}
 if(!res.ok){await updateBatch(keys,res.status===429?'pending':'failed','kakao_'+res.status,new Date(Date.now()+retryDelay(Math.max(...valid.map(x=>x.attempts))+1)));failed=keys.length;}
 else{const result=await res.json();if(result.result_code!==0){await updateBatch(keys,'failed','kakao_rejected');failed=keys.length;}else{await updateBatch(keys,'sent');sent=keys.length;}}
 }catch(err){if(err.message==='token_reconnect_required')throw err;await updateBatch(keys,'uncertain','delivery_result_uncertain');failed=keys.length;}
 }
 // A previous worker may have stopped after sending. Never silently resend an uncertain message.
 await db('crm_reminder_deliveries?status=eq.sending&created_at=lt.'+encodeURIComponent(new Date(Date.now()-10*60000).toISOString()),{method:'PATCH',body:JSON.stringify({status:'uncertain',last_error:'worker_interrupted'})});
 await runtime({last_run_at:new Date().toISOString(),last_error:failed?'delivery_needs_review':null});
 return json({sent,failed});
 }finally{await runtime({lock_until:null});}
}
Deno.serve(async req=>{
 try{
 const url=new URL(req.url);const config=await rpc('crm_kakao_secret_read');
 if(url.pathname.endsWith('/callback')&&req.method==='GET')return await callbackRequest(url,config);
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 if(!config?.cron_secret||req.headers.get('x-crm-worker-key')!==config.cron_secret)return json({error:'unauthorized'},403);
 if(!config.access_token||!config.refresh_token)return json({error:'not_connected'},409);
 const state=(await db('crm_kakao_runtime?id=eq.true&select=expires_at,enabled'))[0];
 const testMode=url.pathname.endsWith('/test');
 if(!testMode&&!state.enabled)return json({disabled:true});
 if(url.pathname.endsWith('/refresh')){await refresh(config);return json({refreshed:true});}
 const current=(!state.expires_at||new Date(state.expires_at)<new Date(Date.now()+60000))?await refresh(config):config;
 return await run(current,testMode);
 }catch(err){await runtime({last_error:String(err.message).replace(/[^a-z0-9_]/gi,'').slice(0,80)}).catch(()=>{});return json({error:'operation_failed'},500);}
});
