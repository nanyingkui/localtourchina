import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
for(const [lang,label] of [['ko','확인된 자료 0개'],['zh-CN','已核实资料 0条'],['en','Reviewed items 0']])test('public library has a working localized empty state: '+lang,async()=>{
 const fields=new Map();const node=()=>({value:'',textContent:'',children:[],addEventListener(){},replaceChildren(){this.children=[]},append(...children){this.children.push(...children)}});
 const document={documentElement:{lang},getElementById(id){if(!fields.has(id))fields.set(id,node());return fields.get(id)},createElement:node};
 const code=fs.readFileSync(new URL('../public/assets/knowledge-library.mjs',import.meta.url),'utf8');let url;
 vm.runInNewContext(code,{document,window:{LOCALTOUR_SUPABASE:{url:'https://example.invalid',key:'public-fixture'}},URL,fetch:async u=>{url=u;return {ok:true,json:async()=>[]}}});
 await new Promise(setImmediate);assert.match(url,/status=eq.published/);assert.equal(fields.get('libraryStatus').textContent,label);assert.equal(fields.get('libraryItems').children.length,1);
});
test('new maintained modules and all locale entries survive the production build',()=>{
 for(const name of ['admin-hub.mjs','admin-hub.css','knowledge-library.mjs','knowledge-library.css'])assert.equal(fs.readFileSync(new URL('../public/assets/'+name,import.meta.url),'utf8'),fs.readFileSync(new URL('../../assets/'+name,import.meta.url),'utf8'));
 for(const locale of ['','zh/','en/']){const p=fs.readFileSync(new URL('../../'+locale+'travel-library.html',import.meta.url),'utf8');assert.match(p,/libraryStatus/);assert.match(p,/knowledge-library.mjs/);}
});
