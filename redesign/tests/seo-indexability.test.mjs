import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
for(const prefix of ['', 'zh/'])for(const [file,service] of [['local-guide.html','guide'],['vehicles.html','vehicle'],['tickets.html','ticket'],['private-tour.html','private'],['day-tours.html','daytour']]){
 test(prefix+file+' exposes its own service without JavaScript',async()=>{
  const html=await fs.readFile(new URL(prefix+file,root),'utf8');
  if(file==='local-guide.html'||file==='day-tours.html'){
    assert.match(html,/<main[^>]*>/);assert.match(html,/<h1/);assert.match(html,/rel="canonical"/);
    if(file==='local-guide.html'){assert.match(html,/catalog-current/);assert.ok(html.includes(prefix?'服务与时长':'가이드'));}
    else {assert.match(html,/data-product-card="forest"/);assert.match(html,/data-product-card="fenghuang"/);}
    return;
  }
  const panels=[...html.matchAll(/<(?:section|div)\b[^>]*class="[^"]*\bservice-panel\b[^"]*"[^>]*>/g)].map(x=>x[0]);
  assert.deepEqual(panels.filter(tag=>! /\s+hidden\b/.test(tag)).map(tag=>tag.match(/id="([^"]+)"/)[1]),['service-'+service]);
  assert.match(html,new RegExp('rel="canonical" href="https://localtourchina.com/'+prefix+file+'"'));
  if(!prefix){assert.match(html,/seo-service-overview/);assert.match(html,/BreadcrumbList/);}
 });
}
