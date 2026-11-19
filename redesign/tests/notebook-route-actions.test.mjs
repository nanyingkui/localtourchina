import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'../..');
const source=path.join(root,'redesign/notebook');
const routes={regular34:'zhangjiajie-4days.html',experience45:'zhangjiajie.html',regular56:'zhangjiajie-6days.html'};

test('home features three distinct multiday trips with photo stories and a separate online guide service',()=>{
  for(const prefix of ['','zh/','en/']){
    const html=fs.readFileSync(path.join(root,prefix+'index.html'),'utf8');
    const cards=[...html.matchAll(/<article class="[^"]*\btrip-card\b[^"]*">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
    assert.equal(cards.length,3,prefix+' route cards');
    for(const [index,card] of cards.entries()){
      const photo=card.match(/<button\b[^>]*data-route-story="([^"]+)"[^>]*>/);
      assert.ok(photo,prefix+' photo is a button, not a duplicate route link');
      assert.ok(photo[0].includes('aria-haspopup="dialog"'));
      const links=[...card.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
      assert.equal(photo[1],['regular34','experience45','regular56'][index]);
      assert.ok(links.some(href=>href===routes[photo[1]]||href==='/'+prefix+routes[photo[1]]),prefix+' correct itinerary action');
    }
    const services=html.match(/<section\b[^>]*id="services"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(services,prefix+' independent travel services stay visible');
    assert.ok(services.includes(`href="/${prefix}online-guide.html"`),prefix+' online support keeps its own clear service entry');
    assert.match(html,/src="[^"]+route-stories\.js"/);
  }
});

test('three photo stories contain twelve distinct existing photos, with experience and preparation content',()=>{
  const context={window:{}};vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(source,'ko/route-story-data.js'),'utf8'),context);
  const stories=context.window.RoutePhotoStories;
  assert.deepEqual(Object.keys(stories).sort(),Object.keys(routes).sort());
  const files=[];
  for(const story of Object.values(stories)){
    assert.equal(story.scenes.length,4);
    for(const scene of story.scenes){
      assert.ok(fs.existsSync(path.join(source,'assets',scene.file)),scene.file);
      for(const key of ['day','title','experience','preparation','credit']) assert.ok(scene[key]?.length>3,key);
      files.push(scene.file);
    }
  }
  assert.equal(new Set(files).size,12,'no recycled photo between the three stories');
});

test('the photo-story dialog is available on both home and product selection, in all languages',()=>{
  for(const prefix of ['','zh/','en/']) for(const page of ['index.html','trips.html']){
    const html=fs.readFileSync(path.join(root,prefix+page),'utf8');
    for(const file of ['route-stories.css','route-story-data.js','route-stories.js']) assert.ok(html.includes(file),prefix+page+' '+file);
    assert.ok(html.indexOf('journey-data.js')<html.indexOf('route-stories.js'));
  }
});

test('route meal galleries do not recycle the same photos and every photo has a source',()=>{
  const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(source,'ko/photo-sets.js'),'utf8'),ctx);
  const {photos,sets}=ctx.window.TravelPhotoSets,files=[];
  for(const id of Object.keys(routes)){
    assert.ok(sets[id].length>=3,id+' needs a varied meal gallery');
    for(const key of sets[id]){const p=photos[key];assert.ok(p.url.startsWith('https://cafe.naver.com/'));assert.ok(fs.existsSync(path.join(source,'assets',p.file)));files.push(p.file);}
  }
  assert.equal(new Set(files).size,files.length,'no repeated food photos across route galleries');
});

test('all route locales offer three hotel comparisons with complete albums and inquiry preferences',()=>{
  for(const prefix of ['','zh/','en/']) for(const file of Object.values(routes)){
    const html=fs.readFileSync(path.join(root,prefix+file),'utf8');
    const hotel=html.match(/<section class="hotel-choices"[\s\S]*?<\/section>/)?.[0];assert.ok(hotel);
    assert.equal((hotel.match(/class="hotel-option"/g)||[]).length,3);
    assert.equal((hotel.match(/data-media-photo/g)||[]).length,12);
    assert.equal((hotel.match(/name="moments"/g)||[]).length,3);
    assert.ok(html.includes('class="real-case pad"'));
    assert.ok(html.includes('rich-media.js'));
  }
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(source,'missing-translations.json'),'utf8')),[]);
});
