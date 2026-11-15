import {createAdminRequester} from './admin-login.mjs?v=inquiry-mail-20261016';
import {runtimeURL} from './runtime-api.mjs';
const cfg=window.LOCALTOUR_SUPABASE;
const session=()=>{try{return JSON.parse(localStorage.getItem('ltc-admin-session')||'null');}catch{return null;}};
function lock(message='请使用原管理员账号登录后继续。'){
 const workspace=document.getElementById('private-workspace');
 if(workspace){workspace.hidden=true;workspace.replaceChildren();}
 document.getElementById('admin-access').hidden=false;
 document.getElementById('admin-access-status').textContent=message;
}
const request=createAdminRequester({url:cfg.url,key:cfg.key,getSession:session,
 setSession:next=>localStorage.setItem('ltc-admin-session',JSON.stringify(next)),
 onExpired:()=>{localStorage.removeItem('ltc-admin-session');lock('登录已过期，请重新登录。');}},
 (url,options)=>fetch(url.startsWith(cfg.url+'/ltc-runtime')?runtimeURL(url.slice((cfg.url+'/ltc-runtime').length)):url,{...options,signal:AbortSignal.timeout(20000)}));

export async function adminFetch(path,options={}){
 if(!path.startsWith('/api/admin/'))throw Error('Invalid administrator endpoint');
 try{return new Response(JSON.stringify(await request('/ltc-runtime'+path,options)),{headers:{'Content-Type':'application/json'}});}
 catch(error){if(!session())lock();throw error;}
}
window.addEventListener('storage',event=>{if(event.key==='ltc-admin-session'&&!session())lock('已退出登录。');});
async function start(){
 try{
  await adminFetch('/api/admin/session');
  const view=document.querySelector('script[data-view]').dataset.view;
  if(!['pricing','products','transport-pricing'].includes(view))throw Error('Invalid administrator view');
  const payload=await(await adminFetch('/api/admin/view/'+view)).json();
  const documentView=new DOMParser().parseFromString(payload.html,'text/html');
  for(const style of documentView.querySelectorAll('head style,head link[rel=stylesheet]'))document.head.append(style.cloneNode(true));
  document.getElementById('private-workspace').innerHTML=documentView.getElementById('private-workspace').innerHTML;
  document.getElementById('admin-access').hidden=true;
  document.getElementById('private-workspace').hidden=false;
  await import('./product-admin-'+view+'.mjs');
 }catch(error){lock(error.message);}
}
start();
