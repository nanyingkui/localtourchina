import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const read=p=>fs.readFile(new URL(p,import.meta.url),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('review sources preserve original text, attribution and context without inflated counts',async()=>{
 const cafe=JSON.parse(await read('../../src/reviews.json')),yt=JSON.parse(await read('../../src/youtube-reviews.json'));
 assert.equal(cafe.length,22);assert.equal(new Set(cafe.map(x=>x.id)).size,22);
 assert.equal(yt.length,23);assert.equal(yt.filter(x=>x.kind==='review').length,14);
 assert.equal(cafe.find(x=>x.id==='54').kind,'guide');
 const family=['146','148','150','153','154','155'].map(id=>cafe.find(x=>x.id===id));assert.equal(new Set(family.map(x=>x.groupId)).size,1);assert.ok(family.every(x=>x.groupId));
 for(const r of cafe){assert.ok(r.text&&r.author&&r.publishedAt&&r.sourceUrl&&r.contextNote);assert.ok(!r.sourceUrl.includes('youtube'));for(const p of r.photos||[])assert.ok(p.src.endsWith('.webp'));}
 for(const r of yt){assert.ok(r.text&&r.author&&r.displayDate);assert.match(r.sourceUrl,/&lc=/);assert.ok(!r.id.includes('.'),'no replies presented as top-level reviews');}
});
test('all localized review pages contain original text and link to exact sources',async()=>{
 const cafe=JSON.parse(await read('../../src/reviews.json')),yt=JSON.parse(await read('../../src/youtube-reviews.json'));
 for(const lang of ['','zh/','en/']){const page=await read('../dist/client/'+lang+'reviews.html');
 assert.equal((page.match(/class="review-entry"/g)||[]).length,45);
 for(const r of [...cafe,...yt]){assert.ok(page.includes(esc(r.text)),`${lang} full original ${r.id}`);assert.ok(page.includes(esc(r.sourceUrl)),`${lang} source ${r.id}`);}
 assert.doesNotMatch(page,/VERIFIED COMMENTS|publication_permission|private backup|workspace\/|libfile_/);
 assert.match(page,/id="review-search"/);assert.match(page,/loading="lazy"/);
 }
});
test('homepages have visible full-browse entry and previews from both sources',async()=>{
 for(const lang of ['','zh/','en/']){const home=await read('../dist/client/'+lang+'index.html');assert.match(home,/review-browse/);assert.match(home,/youtube-stories/);assert.match(home,/reviews\.html/);assert.equal((home.match(/class="story-source-link"/g)||[]).length,5);}
});
