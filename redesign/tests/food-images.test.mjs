import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { isVerifiedFoodImage, renderFoodPhoto } from '../../scripts/food-images.mjs';
const read=p=>fs.readFile(new URL('../../'+p,import.meta.url),'utf8');
test('shop photos fail closed unless an exact image has documented source verification',()=>{
 const image='assets/food/exact-store.jpg';
 const proof={status:'verified',matchedImage:image,sourceUrl:'https://example.com/source',checkedAt:'2026-10-10',evidence:'Visible store name and matching article image.'};
 assert.equal(isVerifiedFoodImage(image,proof),true);
 for(const p of [undefined,{}, {...proof,status:'pending'}, {...proof,matchedImage:'other.jpg'}, {...proof,evidence:''}, {...proof,sourceUrl:''}]) assert.equal(isVerifiedFoodImage(image,p),false);
});
test('unverified photos are replaced with explicit text in both languages, never a stock substitute',()=>{
 const item={name:'후스푸',chinese:'胡师傅',image:'assets/city/local-snacks-mobile.jpg'};
 for(const locale of ['ko','zh']){const html=renderFoodPhoto(item,'식당',locale);assert.doesNotMatch(html,/<img|local-snacks|undefined/);assert.match(html,/food-photo-unavailable/);}
 assert.match(renderFoodPhoto(item,'餐厅','zh'),/暂无经核实的门店照片/);
});
test('all published food images carry an explicit review status and mismatched city images are rejected',async()=>{
 const data=JSON.parse(await read('src/restaurants.json')).filter(i=>!['draft','rejected','needs_reverification'].includes(i.status));
 assert.equal(data.length,20);
 for(const i of data){assert.ok(['pending','verified','rejected'].includes(i.imageVerification?.status));if(i.image.startsWith('assets/city/'))assert.equal(i.imageVerification.status,'rejected');}
});
test('photo layout overrides intrinsic height and preserves the entire photo',async()=>{
 const css=await read('assets/food-map.css');assert.match(css,/\.food-photo img\s*\{[^}]*height: 100%/);assert.match(css,/object-fit: contain/);assert.match(css,/max-height: 260px/);assert.match(css,/\.food-gallery img\s*\{[^}]*height: auto/);
});
test('food heading, filter states and narrow search fields use shared readable colors',async()=>{
 const css=await read('redesign/public/assets/brand-system.css');assert.match(css,/\.food-hub-head \{ background: var\(--soft\)!important/);assert.match(css,/\.food-hub-head h2 \{ color: var\(--ink\)!important/);assert.match(css,/\.food-toolbar label \{ min-width: 0/);assert.match(css,/\.food-kind-nav button.active \{ background: var\(--orange\)/);
});
test('generated food cards preserve all locations, filters, source and map links without unverified photos',async()=>{
 const data=JSON.parse(await read('src/restaurants.json'));
 for(const p of ['food-map.html','zh/food-map.html']){
 const html=await read(p);const cards=[...html.matchAll(/<article id="[^"]+" class="food-card"[\s\S]*?<\/article>/g)].map(m=>m[0]);assert.equal(cards.length,20);
 for(const c of cards){assert.match(c,/data-food-region=/);assert.match(c,/data-food-kind=/);assert.match(c,/data-prep-copy=/);assert.match(c,/amap\.com/);assert.match(c,/cafe\.naver\.com/);const id=c.match(/<article id="([^"]+)"/)[1]; const item=data.find(i=>i.id===id); if(!isVerifiedFoodImage(item.image,item.imageVerification))assert.doesNotMatch(c,/<img/);}
 }
});
