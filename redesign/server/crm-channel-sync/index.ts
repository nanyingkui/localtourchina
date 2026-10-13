import {STATES,publicMessages,nextCursor} from './channel-sync-policy.mjs';
const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function db(path,options={}){
 const r=await fetch(base+'/rest/v1/'+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('database_'+r.status);return r.status===204?null:r.json();
}
const rpc=(name,args={})=>db('rpc/'+name,{method:'POST',body:JSON.stringify(args)});
const patch=body=>db('crm_channel_runtime?id=eq.true',{method:'PATCH',body:JSON.stringify(body)});
async function api(config,path,params={}){
 const url=new URL('https://api.channel.io/open/'+path);for(const [k,v] of Object.entries(params))if(v!==null&&v!==undefined)url.searchParams.set(k,String(v));
 const r=await fetch(url,{headers:{'x-access-key':config.access_key,'x-access-secret':config.access_secret,'Channel-Version':'2026-06-01',accept:'application/json'},signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('provider_'+r.status);return r.json();
}
Deno.serve(async req=>{
 if(req.method!=='POST')return response({error:'method_not_allowed'},405);
 let claimed=false;
 try{
 const config=await rpc('crm_channel_config');const url=new URL(req.url);
 const isWebhook=url.pathname.endsWith('/webhook');
 const token=isWebhook?url.searchParams.get('token'):req.headers.get('x-crm-worker-key');
 const expected=isWebhook?config.webhook_secret:config.worker_secret;
 if(!expected||token!==expected)return response({error:'unauthorized'},403);
 // Only fetch authoritative data from the provider. Never trust webhook customer content.
 if(url.pathname.endsWith('/probe')){
  const page=await api(config,'user-chats',{limit:1});return response({provider_connected:true,chat_count:page.userChats?.length||0});
 }
 const runtime=(await db('crm_channel_runtime?id=eq.true'))[0];
 if(!runtime.enabled||!runtime.medium_id)return response({disabled:true});
 if(isWebhook){await rpc('crm_channel_tick');return response({accepted:true},202);}
 claimed=await rpc('crm_channel_claim');if(!claimed)return response({busy:true},202);
 const started=Date.now();const from=new Date(runtime.scan_from).getTime();
 const to=runtime.scan_to?new Date(runtime.scan_to).getTime():Math.min(Date.now(),from+24*3600000);
 if(to<=from)return response({waiting:true});
 await patch({scan_to:new Date(to).toISOString()});
 let stateIndex=runtime.state_index,cursor=runtime.cursor,processed=0;
 while(stateIndex<STATES.length){
  if(Date.now()-started>30000)break;
  const page=await api(config,'user-chats',{state:STATES[stateIndex],sortOrder:'asc',limit:25,dateTimeFieldName:'deskUpdatedAt',from,to,cursor});
  if(!Array.isArray(page.userChats))throw Error('invalid_chats_response');
  for(const chat of page.userChats){
   if(chat.mediumType!=='app'||chat.mediumId!==runtime.medium_id)continue;
   let messageCursor=null,seen=new Set();
   do{
    if(Date.now()-started>45000)throw Error('scan_resume_required');
    const messages=await api(config,'user-chats/'+encodeURIComponent(chat.id)+'/messages',{sortOrder:'asc',limit:100,from,to,cursor:messageCursor});
    await rpc('crm_channel_import',{p_chat:chat,p_messages:publicMessages(chat.id,messages.messages),p_name:'Kakao 고객'});
    messageCursor=nextCursor(messages);
    if(messageCursor&&seen.has(messageCursor))throw Error('repeated_message_cursor');
    if(messageCursor)seen.add(messageCursor);
   }while(messageCursor);
   processed++;
  }
  const previous=cursor;cursor=nextCursor(page);if(cursor&&cursor===previous)throw Error('repeated_chat_cursor');
  if(!cursor)stateIndex++;
  await patch({cursor,state_index:stateIndex,last_run_at:new Date().toISOString()});
 }
 if(stateIndex===STATES.length)await patch({scan_from:new Date(Math.max(from+1,to-5*60000)).toISOString(),scan_to:null,state_index:0,cursor:null});
 await patch({last_run_at:new Date().toISOString(),last_error:null});return response({processed,scan_complete:stateIndex===STATES.length});
 }catch(e){const code=String(e.message).replace(/[^a-z0-9_]/gi,'').slice(0,80);if(claimed)await patch({last_error:code}).catch(()=>{});return response({error:code},503);
 }finally{if(claimed)await patch({lock_until:null}).catch(()=>{});}
});
