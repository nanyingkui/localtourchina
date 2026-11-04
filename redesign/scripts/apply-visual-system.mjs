import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(root,'public');
const version=crypto.createHash('sha256').update(await fs.readFile(path.join(publicDir,'assets/visual-system.css'))).update(await fs.readFile(path.join(publicDir,'assets/visual-system.js'))).digest('hex').slice(0,12);
let count=0;
async function apply(file,app=false){
 let html=await fs.readFile(file,'utf8');
 html=html.replace(/<link\b[^>]*data-ltc-visual[^>]*>/g,'').replace(/<script\b[^>]*data-ltc-visual[^>]*><\/script>/g,'');
 html=html.replace(/<html\b([^>]*)>/i,(tag,attrs)=>/class=/.test(attrs)?tag.replace(/class="([^"]*)"/,(_,classes)=>`class="${[...new Set([...classes.split(/\s+/),'ltc-visual'])].join(' ')}"`):`<html${attrs} class="ltc-visual">`);
 const suffix=app?'':'?v='+version;
 const resources=`<link data-ltc-visual rel="stylesheet" href="/assets/visual-system.css${suffix}"><script data-ltc-visual src="/assets/visual-system.js${suffix}" defer></script>`;
 if(html.includes('</head>'))html=html.replace('</head>',resources+'</head>');
 else{const styles=[...html.matchAll(/<\/style>|<link\b[^>]*rel="stylesheet"[^>]*>/g)];const last=styles.at(-1)||[...html.matchAll(/<\/title>|<meta\b[^>]*>/g)].at(-1);if(!last)throw Error('No head injection point: '+file);const at=last.index+last[0].length;html=html.slice(0,at)+resources+html.slice(at);}
 await fs.writeFile(file,html);count++;
}
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(entry.name==='vendor')continue;const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.name.endsWith('.html'))await apply(file,file===path.join(publicDir,'app/index.html'));}}
await walk(publicDir);
// Vite's source document carries the same external, cache-versioned presentation.
await apply(path.join(root,'index.html'));
console.log(`Unified visual system applied to ${count} documents (${version}).`);
