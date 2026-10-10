/** Idempotent presentation-only HTML decoration. Run after build-reviews/sync-legacy,
 * before Vite/copy-public. No content, inline scripts, calculator data, prices,
 * canonical URLs, or live submission configuration is changed.
 * Default: root generated pages + redesign/public. --public-only: mirror only.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const excluded=new Set(['index.html','404.html','admin.html','inquiry-status.html']);
export function decorateBrandHtml(source,filename=''){
  if(excluded.has(path.basename(filename)) || !/<\/head>/i.test(source) || !/<body\b/i.test(source) || /id=["']root["']/.test(source))return source;
  let html=source
    .replace(/<script\b[^>]*\bsrc=["'][^"']*\/(?:brand-system|video-guides)\.js["'][^>]*>\s*<\/script>/gi,'')
    .replace(/<link\b[^>]*\bhref=["'][^"']*\/brand-system\.css["'][^>]*>/gi,'')
    .replace(/\sdata-brand-(?:system|preview)=["'][^"']*["']/gi,'');
  html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="/assets/brand-system.css"><script src="/assets/brand-system.js" defer></script><script src="/assets/video-guides.js" defer></script></head>');
  html=html.replace(/<body\b/i,'<body data-brand-system="true"');
  return html;
}
export async function applyBrandSystem(root,{publicOnly=false}={}){
  const roots=publicOnly?[path.join(root,'redesign/public')]:[root,path.join(root,'redesign/public')];
  let visited=0,changed=0;
  for(const base of roots)for(const locale of ['','ko','zh','en']){
    const dir=path.join(base,locale);let names=[];try{names=await fs.readdir(dir);}catch{continue;}
    for(const name of names){if(!name.endsWith('.html')||excluded.has(name))continue;
      const file=path.join(dir,name),source=await fs.readFile(file,'utf8'),html=decorateBrandHtml(source,name);
      visited++;if(html!==source){await fs.writeFile(file,html);changed++;}
    }
  }
  return {visited,changed};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const result=await applyBrandSystem(root,{publicOnly:process.argv.includes('--public-only')});
  console.log(`Brand system: ${result.visited} pages checked, ${result.changed} updated.`);
}
