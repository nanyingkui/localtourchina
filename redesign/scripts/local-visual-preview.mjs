import fs from 'node:fs/promises';
import path from 'node:path';

// Served by Vite only. Never copied to public/ or the production bundle.
export const previewGuardSource=`(()=>{
 const original=window.fetch.bind(window);
 const message=()=>{const lang=document.documentElement.lang;return lang.startsWith('zh')?'这是本地视觉预览，不会提交实际申请或发送邮件。':lang.startsWith('en')?'Local visual preview: no real requests or emails are sent.':'로컬 디자인 미리보기입니다. 실제 신청이나 이메일을 보내지 않습니다.';};
 window.fetch=(input,init)=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);
  const method=String(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  if(url.hostname.endsWith('.supabase.co')&&!['GET','HEAD','OPTIONS'].includes(method)){
   const text=message();let toast=document.getElementById('local-preview-feedback');if(!toast){toast=document.createElement('p');toast.id='local-preview-feedback';toast.setAttribute('role','status');toast.style.cssText='position:fixed;left:16px;right:16px;bottom:18px;max-width:560px;margin:auto;z-index:2147483647;padding:16px 20px;background:#1c302bf2;color:white;border-radius:16px;box-shadow:0 10px 35px #173e2b25;font:14px/1.7 system-ui';document.body.append(toast);}toast.textContent=text;setTimeout(()=>toast.remove(),6500);
   return Promise.reject(new Error(text));
  }
  return original(input,init);
 };
})();`;
export function localVisualPreview(){return {
 name:'local-visual-preview',apply:'serve',
 transformIndexHtml:{order:'pre',handler:()=>[{tag:'script',attrs:{src:'/__local-visual-guard.js'},injectTo:'head-pre'}]},
 configureServer(server){
  const publicRoot=path.resolve(server.config.publicDir);
  server.middlewares.use(async(req,res,next)=>{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/__local-visual-guard.js'){res.setHeader('Content-Type','application/javascript');res.setHeader('Cache-Control','no-store');res.end(previewGuardSource);return;}
   if(['/app/','/travel-planner/'].includes(url.pathname)){url.pathname+='index.html';req.url=url.pathname+url.search;}
   if(!url.pathname.endsWith('.html'))return next();
   const file=path.resolve(publicRoot,'.'+url.pathname);if(!file.startsWith(publicRoot+path.sep))return next();
   try{let html=await fs.readFile(file,'utf8');const tag='<script src="/__local-visual-guard.js"></script>';html=html.includes('<head>')?html.replace('<head>','<head>'+tag):html.replace(/<html\b[^>]*>/i,match=>match+tag);res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(html);}catch{next();}
  });
 }
};}
