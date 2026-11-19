import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {addIndependentHome,renderIndependent} from '../redesign/independent-travel/independent.mjs';

const root = fileURLToPath(new URL('..',import.meta.url));
const dist = path.join(root,'redesign/dist/client');
const source = 'redesign/independent-travel';
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const json = file => JSON.parse(read(file));
const manifestFile = 'public-release-manifest.json';
const inventoryFile = 'redesign/notebook/page-inventory.json';
const manifest = new Set(json(manifestFile));
const inventory = new Map(json(inventoryFile).map(page => [page.path,page]));
const photos = json('redesign/brand-upgrade/archive-photos.json');
const hubRecords = json(source+'/independent-data.json');
const cityRecords = json(source+'/independent-city-data.json');

function publish(relative,content) {
  for(const dir of [root,dist]){
    const target = path.join(dir,relative);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,content);
  }
  manifest.add(relative);
}

const assets = ['independent.css','independent.js'].map(name => [name,read(source+'/'+name)]);
const hash = createHash('sha256');
for(const [name,content] of assets) hash.update(name).update(content);
const styleBase = '/assets/independent/'+hash.digest('hex').slice(0,12)+'/';
for(const [name,content] of assets) publish(styleBase.slice(1)+name,content);

for(const [lang,prefix] of [['ko',''],['zh','zh/'],['en','en/']]){
  const homePath = prefix+'index.html';
  const home = addIndependentHome(read(homePath),lang,styleBase);
  const assetBase = home.match(/\/assets\/notebook\/[a-f0-9]+\//)?.[0];
  const editorialBase = home.match(/<link data-editorial-style[^>]*href="(\/assets\/editorial\/[a-f0-9]+\/)editorial\.css"/)?.[1];
  if(!assetBase || !editorialBase) throw Error('Published home styles missing for '+lang);
  publish(homePath,home);

  const common = {lang,home,assetBase,editorialBase,styleBase};
  for(const [file,options] of [
    ['independent-travel.html',{records:hubRecords,cover:photos.tianzi?.[0],hasCity:true}],
    ['independent-city.html',{records:cityRecords,cover:photos.tianmen?.[1],city:true}],
  ]){
    const relative = prefix+file;
    publish(relative,renderIndependent({...common,...options}));
    inventory.set(relative,{path:relative,kind:'travel'});
  }
}

fs.writeFileSync(path.join(root,manifestFile),JSON.stringify([...manifest].sort(),null,2)+'\n');
fs.writeFileSync(path.join(root,inventoryFile),JSON.stringify([...inventory.values()].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0),null,2)+'\n');
console.log('Built independent travel guides in Korean, Chinese and English.');
