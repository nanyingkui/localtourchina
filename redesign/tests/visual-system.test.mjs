import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const publicDir=new URL('../public/',import.meta.url);
async function documents(dir){const result=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){if(item.name==='vendor')continue;const file=new URL(item.name+(item.isDirectory()?'/':''),dir);if(item.isDirectory())result.push(...await documents(file));else if(item.name.endsWith('.html'))result.push(file);}return result;}
test('every existing public document and storefront loads exactly one shared visual system',async()=>{
 const files=[...await documents(publicDir),new URL('../index.html',import.meta.url)];assert.ok(files.length>=53);
 for(const file of files){const html=await fs.readFile(file,'utf8');assert.equal((html.match(/href="\/assets\/visual-system\.css/g)||[]).length,1,file.pathname);assert.equal((html.match(/src="\/assets\/visual-system\.js/g)||[]).length,1,file.pathname);assert.match(html,/<html[^>]*class="[^"]*ltc-visual/,file.pathname);}
});
test('app visual resources remain available offline as static shell assets without opening a data cache',async()=>{
 const html=await fs.readFile(new URL('app/index.html',publicDir),'utf8'),worker=await fs.readFile(new URL('../src/traveler/service-worker.js',import.meta.url),'utf8');
 assert.match(html,/href="\/assets\/visual-system\.css"/);assert.match(html,/src="\/assets\/visual-system\.js"/);
 for(const resource of ['/assets/visual-system.css','/assets/visual-system.js','/assets/home-20261013/mascot-clean.webp'])assert.ok(worker.includes(resource));
 assert.match(worker,/url\.search\|\|!SHELL\.includes/);
});
test('the shared presentation cannot submit data and supports reduced motion and visible focus',async()=>{
 const js=await fs.readFile(new URL('assets/visual-system.js',publicDir),'utf8'),css=await fs.readFile(new URL('assets/visual-system.css',publicDir),'utf8');
 assert.doesNotMatch(js,/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\s*[.(]/);
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/:focus-visible/);assert.match(css,/forced-colors:active/);
});
