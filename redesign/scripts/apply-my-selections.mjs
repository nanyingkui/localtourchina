import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(project,'public'),source=path.join(project,'src/selections');
const files=new Map();
for(const name of (await fs.readdir(source)).sort())if(/\.(mjs|css)$/.test(name))files.set(name,await fs.readFile(path.join(source,name)));
// Shared pricing and the existing Kakao channel remain canonical.
for(const name of ['furong-transfer.mjs','chat-handoff.mjs'])files.set(name,await fs.readFile(path.join(project,'src',name)));
files.set('start.js',Buffer.from("import(new URL('./ui.mjs',document.currentScript.src).href).catch(error=>console.error('My selections could not load',error));\n"));
const hash=crypto.createHash('sha256');for(const [name,bytes]of files)hash.update(name).update(bytes);
const version=hash.digest('hex').slice(0,12),base='/assets/my-selections/'+version;
const output=path.join(publicDir,base.slice(1));await fs.mkdir(output,{recursive:true});
for(const [name,bytes]of files)await fs.writeFile(path.join(output,name),bytes);
const markup=`<link data-ltc-selections rel="stylesheet" href="${base}/style.css"><script data-ltc-selections src="${base}/start.js" defer></script>`;
async function apply(file){let html=await fs.readFile(file,'utf8');html=html.replace(/<link\b[^>]*data-ltc-selections[^>]*>/g,'').replace(/<script\b[^>]*data-ltc-selections[^>]*><\/script>/g,'');if(!html.includes('</head>'))return;await fs.writeFile(file,html.replace('</head>',markup+'</head>'));}
let count=0;
for(const locale of ['','zh','en'])for(const name of await fs.readdir(path.join(publicDir,locale))){
 if(!name.endsWith('.html')||/^(admin|inquiry-status|privacy|404)(?:[.-]|$)/.test(name))continue;
 await apply(path.join(publicDir,locale,name));count++;
}
await apply(path.join(project,'index.html'));
console.log(`My selections: ${count} public documents, version ${version}. Admin, order-status and traveler app unchanged.`);
