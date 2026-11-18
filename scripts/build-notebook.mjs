import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {parse} from '../redesign/node_modules/acorn/dist/acorn.mjs';
const preview=process.env.NOTEBOOK_PREVIEW_DIR;
const root=process.cwd(),source=path.join(root,'redesign/notebook'),dist=path.join(root,'redesign/dist/client');
const read=p=>fs.readFileSync(p,'utf8'),write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});const temp=p+'.notebook-tmp';fs.writeFileSync(temp,s);fs.renameSync(temp,p);};
const catalog=JSON.parse(read(path.join(root,'catalog-site/catalog.json'))),fx=JSON.parse(read(path.join(source,'fx.json')));
const businessRegistration=JSON.parse(read(path.join(root,'catalog-site/business-registration.json')));
const dict={ko:{},zh:JSON.parse(read(path.join(source,'zh.json'))),en:JSON.parse(read(path.join(source,'en.json')))};
const original={};for(const lang of ['zh','en'])for(const [k,v]of Object.entries(dict[lang]))original[v]=k;
const css=fs.readdirSync(path.join(source,'assets')).filter(f=>f.endsWith('.css'));
const scripts=fs.readdirSync(path.join(source,'ko')).filter(f=>f.endsWith('.js'));
const pages=fs.readdirSync(path.join(source,'ko')).filter(f=>f.endsWith('.html'));
const sum=crypto.createHash('sha256');for(const f of [...scripts,...pages])sum.update(read(path.join(source,'ko',f)));for(const f of css)sum.update(read(path.join(source,'assets',f)));sum.update(JSON.stringify(dict));sum.update(JSON.stringify({catalog,fx}));for(const f of ['notebook-runtime.js','dated34.js'])sum.update(read(path.join(source,f)));
const base='/assets/notebook/'+sum.digest('hex').slice(0,12)+'/';const added=new Set(),missing=new Map();
function emit(name,bytes){if(preview)write(path.join(preview,name),bytes);else{write(path.join(root,name),bytes);write(path.join(dist,name),bytes);}added.add(name);}
function tree(from,rel){for(const e of fs.readdirSync(from,{withFileTypes:true})){const p=path.join(from,e.name),dest=rel+e.name;if(e.isDirectory())tree(p,dest+'/');else emit(dest,fs.readFileSync(p));}}
tree(path.join(source,'assets'),base.slice(1));
const shared=JSON.stringify({fx,catalog:{'34':catalog['34'],'56':catalog['56'],'local-guide':catalog['local-guide'],experience45:catalog.experience45||null}}).replace(/</g,'\\u003c');
emit(base.slice(1)+'data.js','window.NotebookData='+shared+';');
for(const f of ['notebook-runtime.js','dated34.js'])emit(base.slice(1)+f,read(path.join(source,f)));
const money=(n,lang)=>new Intl.NumberFormat({ko:'ko-KR',zh:'zh-CN',en:'en-US'}[lang],{style:'currency',currency:{ko:'KRW',zh:'CNY',en:'USD'}[lang],maximumFractionDigits:lang==='ko'?0:2}).format(Number(n)*(lang==='ko'?1:fx.rates[lang==='zh'?'CNY':'USD']));
function translate(text,lang,file){if(lang==='ko'||!/[가-힣]/.test(text))return text;const key=text.trim();let v=dict[lang][key];if(v===undefined){if(!missing.has(key))missing.set(key,{text:key,files:[]});missing.get(key).files.push(file);return text;}return text.slice(0,text.indexOf(key))+v+text.slice(text.indexOf(key)+key.length);}
function localAssets(s){return s.replace(/(["'`(])(?:\.\/)?(photos|fonts|brand)\//g,(_,q,dir)=>q+base+dir+'/');}
function jsTranslate(s,lang,file){const ast=parse(s,{ecmaVersion:'latest',sourceType:'script'}),edits=[];const walk=n=>{if(!n||typeof n!=='object')return;if(n.type==='Literal'&&typeof n.value==='string'&&/[가-힣]/.test(n.value)){const v=translate(n.value,lang,file);if(v!==n.value)edits.push([n.start,n.end,JSON.stringify(v)]);}if(n.type==='TemplateElement'&&/[가-힣]/.test(n.value.raw)){const v=translate(n.value.raw,lang,file);if(v!==n.value.raw)edits.push([n.start,n.end,v]);}for(const [k,v]of Object.entries(n)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}};walk(ast);for(const [a,b,v]of edits.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+v+s.slice(b);return localAssets(s).replace(/₩([\d,]+)/g,(_,n)=>money(n.replaceAll(',',''),lang));}
function htmlTranslate(s,lang,file){s=s.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(whole,attrs,code)=>code.trim()?'<script'+attrs+'>'+jsTranslate(code,lang,file)+'</script>':whole);s=s.replace(/>([^<>]+)</g,(all,text)=>'>'+translate(text,lang,file)+'<');s=s.replace(/([\w-]+)="([^"]*)"/g,(all,attr,value)=>/[가-힣]/.test(value)?attr+'="'+translate(value,lang,file).replaceAll('"','&quot;')+'"':all);return localAssets(s).replace(/₩([\d,]+)/g,(_,n)=>money(n.replaceAll(',',''),lang));}
// Reuse the original ledger entry and its current versioned assets.
let currentHome=read(path.join(root,'index.html'));if(!currentHome.includes('data-ltc-selections'))currentHome=read(path.join(root,'configure.html'));
const ledgerCSS=currentHome.match(/<link[^>]+href="\/assets\/my-selections\/[^>]+>/)?.[0]||'';
const ledgerJS=currentHome.match(/<script[^>]+data-ltc-selections[^>]*><\/script>/)?.[0]||'';
if(!ledgerCSS||!ledgerJS)throw Error('Original My selections integration missing');
for(const lang of ['ko','zh','en']){
 const prefix=lang==='ko'?'':lang+'/';
 const current=path.join(root,prefix+'index.html');if(!read(current).includes('data-notebook-release'))emit(prefix+'configure.html',read(current));
 const legal=businessRegistration[lang].home;
 if(!legal?.includes('696-34-01557'))throw Error('Website operator registration is missing: '+lang);
 const lookup={};for(const k of new Set([...Object.keys(dict.zh),...Object.keys(dict.en)])){const value=lang==='ko'?k:dict[lang][k]??k;lookup[k]=value;for(const prev of ['zh','en'])if(dict[prev][k])lookup[dict[prev][k]]=value;}
 emit(base.slice(1)+lang+'/translations.js','window.NotebookTranslations='+JSON.stringify(lookup).replace(/</g,'\\u003c')+';');
 for(const file of scripts){let s=jsTranslate(read(path.join(source,'ko',file)),lang,file);if(lang==='en'&&file==='journeys.js')s=s.replace('<li><b>${i+1}</b>','<li><b>Day ${i+1}</b>');parse(s,{ecmaVersion:'latest'});emit(base.slice(1)+lang+'/'+file,s);}
 for(const file of pages){let s=htmlTranslate(read(path.join(source,'ko',file)),lang,file).replace('<html lang="ko"','<html data-notebook-release="14" lang="'+(lang==='zh'?'zh-CN':lang)+'"');
 s=s.replace(/href="([\w-]+\.css)(?:\?[^"<>]*)?"/g,(_,f)=>'href="'+base+f+'"').replace(/src="([\w-]+\.js)(?:\?[^"<>]*)?"/g,(_,f)=>'src="'+base+lang+'/'+f+'"');
 s=s.replace(/<script\b/,`<script src="${base}data.js"></script><script src="${base}${lang}/translations.js"></script><script src="${base}notebook-runtime.js"></script><script src="${base}dated34.js"></script><script`);
 if(file==='trips.html')s=s.replace(/(<p class="preview-foot">)[^<]*(<\/p>)/,'$1'+({ko:'로투차 · 여행 선택',zh:'罗途查 · 选择旅行',en:'LocalTourChina · Choose your trip'}[lang])+'$2');
 const canonical='https://localtourchina.com/'+prefix+file;
 s=s.replace('</head>',`<link rel="canonical" href="${canonical}">${['ko','zh','en'].map(l=>`<link rel="alternate" hreflang="${l}" href="https://localtourchina.com/${l==='ko'?'':l+'/'}${file}">`).join('')}<link rel="stylesheet" href="${base}release.css">${ledgerCSS}${ledgerJS}<link rel="stylesheet" href="/assets/contact-modal.css"></head>`);
 const directTarget={ko:'https://pf.kakao.com/_hvrmn/chat',zh:'/zh/travel-safety.html?channel=wechat',en:'https://wa.me/821055722601'}[lang];
 s=s.replace(/href="https:\/\/pf\.kakao\.com\/_hvrmn\/chat"/g,'data-contact href="'+directTarget+'"');
 s=s.replace('</body>',legal+'<script src="/assets/contact-gate.js"></script></body>');
 if(file==='index.html')s=s.replace('<head>','<head><script>if(new URLSearchParams(location.search).has("view")&&new URLSearchParams(location.search).get("view")!=="full"||new URLSearchParams(location.search).has("reference")){location.replace("configure.html"+location.search+location.hash);}</script>');
 // Resolve existing secondary pages through real catalog paths, preserving locale.
 s=s.replace(/(<a\b[^>]*\bhref=)"https:\/\/localtourchina.com\/([^"#?]+)([^"<>]*)"/g,(all,lead,p,suffix)=>{if(lang==='ko')return lead+'"/'+p+suffix+'"';const rec=Object.values(catalog).find(r=>r.paths?.ko?.replace(/^\//,'')===p);const target=rec?.paths?.[lang]||((fs.existsSync(path.join(root,lang,p)))?'/'+lang+'/'+p:'/'+p);return lead+'"'+target+suffix+'"';});
 s=s.replace(/<img\b([^>]*?)>/g,(all,attrs)=>{if(/brand|hero|logo/.test(attrs))return all;return all.replace('loading="eager"','loading="lazy"').replace('decoding="sync"','decoding="async"');});
 emit(prefix+file,s);
 }
 const alias=lang==='ko'?'package-experience45.html':lang+'/tours/experience45.html';const target='/'+prefix+'zhangjiajie.html';const recordJSON=catalog.experience45?'<script type="application/json" id="catalog-current">'+JSON.stringify(catalog.experience45).replace(/</g,'\\u003c')+'</script>':'';emit(alias,`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="canonical" href="https://localtourchina.com${target}"><meta http-equiv="refresh" content="0;url=${target}"><title>LocalTourChina</title>${recordJSON}<a href="${target}">LocalTourChina · 4 nights / 5 days</a><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></html>`);
}
// Carry the approved notebook identity to the remaining catalog products without changing their quote controls.
const catalogNote={
 ko:{tour:'같은 풍경도, 우리 일행의 속도로.',service:'필요한 도움만, 여행에 더해요.',sub:'이용 날짜와 일행의 조건을 확인한 뒤, 실제 일정과 비용을 맞춥니다.',logo:'로투차 주황 모자 로고'},
 zh:{tour:'同一片风景，也可以有自己的节奏。',service:'把需要的服务，加入这趟旅行。',sub:'按日期和同行人的需求，确认具体安排与费用。',logo:'罗途查橙帽品牌标志'},
 en:{tour:'The same view. Your own pace.',service:'Add the support your trip needs.',sub:'Your dates and group needs shape the final arrangements and price.',logo:'LocalTourChina orange-hat logo'}
};
for(const lang of ['ko','zh','en']){
 const extraPaths=new Set(Object.values(catalog).map(r=>r.paths?.[lang]).filter(Boolean));
 extraPaths.add('/'+(lang==='ko'?'':lang+'/')+'products.html');
 for(const url of extraPaths){const relative=url.replace(/^\//,'');const target=path.join(root,relative);if(!fs.existsSync(target))continue;let html=read(target);if(html.includes('data-notebook-release')||html.includes('http-equiv="refresh"'))continue;
 html=html.replace(/<link[^>]*data-notebook-catalog[^>]*>/g,'').replace(/<aside class="notebook-product-note"[\s\S]*?<\/aside>/g,'').replace(/<img class="catalog-brand-mark"[^>]*>/g,'');
 html=html.replace(/<body([^>]*)>/,(all,attrs)=>{if(/class="/.test(attrs))return '<body'+attrs.replace(/class="([^"]*)"/,(_,v)=>'class="'+[...new Set((v+' catalog-notebook').split(/\s+/))].join(' ')+'"')+'>';return '<body class="catalog-notebook"'+attrs+'>';});
 html=html.replace('</head>',`<link data-notebook-catalog rel="stylesheet" href="${base}catalog-notebook.css"></head>`);
 html=html.replace(/(<a class="store-brand"[^>]*>)/,`$1<img class="catalog-brand-mark" src="${base}brand/rotucha-orange-hat-master.png" alt="${catalogNote[lang].logo}" width="52" height="52">`);
 const service=/jd-service|data-store-legacy/.test(html);const note=catalogNote[lang];
 const strip=`<aside class="notebook-product-note"><span class="notebook-small-sketch" aria-hidden="true"></span><div><p>${service?note.service:note.tour}</p><small>${note.sub}</small></div></aside>`;
 html=html.replace(/(<main\b[^>]*>)/,'$1'+strip);emit(relative,html);
 }
}
const manifest=JSON.parse(read(path.join(root,'public-release-manifest.json')));if(!preview)write(path.join(root,'public-release-manifest.json'),JSON.stringify([...new Set([...manifest,...added])].sort(),null,2)+'\n');
write(path.join(source,'missing-translations.json'),JSON.stringify([...missing.values()],null,2));
console.log(`Notebook v14: ${pages.length} pages × 3 languages; ${added.size} public files; ${missing.size} translation segments need review; ${base}`);
