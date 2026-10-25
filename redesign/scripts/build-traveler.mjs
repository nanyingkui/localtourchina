import {build,transformWithEsbuild} from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'public/app');
await build({configFile:false,root,publicDir:false,define:{'process.env.NODE_ENV':'"production"'},build:{lib:{entry:path.join(root,'src/traveler/main.mjs'),formats:['es'],fileName:()=> 'app.mjs'},outDir:out,emptyOutDir:false,target:'es2022',sourcemap:false,minify:true,rollupOptions:{output:{inlineDynamicImports:true}}}});
// Vite preserves whitespace in ES library output; minify the standalone app too.
const bundle=path.join(out,'app.mjs');
const minified=await transformWithEsbuild(await fs.readFile(bundle,'utf8'),bundle,{minify:true,target:'es2022',legalComments:'none',supported:{'template-literal':false}});
await fs.writeFile(bundle,minified.code);
const files=['index.html','app.css','app.mjs','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const digest=crypto.createHash('sha256');for(const f of files)digest.update(await fs.readFile(path.join(out,f)));digest.update(await fs.readFile(path.join(root,'public/assets/supabase-config.js')));
const version=digest.digest('hex').slice(0,16);
let sw=await fs.readFile(path.join(root,'src/traveler/service-worker.js'),'utf8');sw=sw.replace('__CACHE_VERSION__',version);await fs.writeFile(path.join(out,'sw.js'),sw);
console.log('Built traveler PWA '+version+' in existing website.');
