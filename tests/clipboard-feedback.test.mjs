import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('../assets/interface-utils.js',import.meta.url),'utf8');
function setup({clipboard=true,fallback=false,lang='en'}={}){
  const nodes=[],timers=new Map(); let timerId=0;
  const element=(tag='span')=>{
    const classes=new Set();
    const x={tag,textContent:'',value:'',attrs:{},dataset:{},style:{},children:[],classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,v)=>v?classes.add(k):classes.delete(k),contains:k=>classes.has(k)},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},insertAdjacentElement(where,n){this.children.push(n);n.removed=false},getClientRects:()=>[{}],select(){this.selected=true},focus(){this.focused=true},remove(){this.removed=true}};
    nodes.push(x);return x;
  };
  const button=element('button');button.textContent='Copy inquiry';
  const toast=element();
  const context={window:{},navigator:clipboard===false?{}:{clipboard:{writeText:typeof clipboard==='function'?clipboard:async()=>{}}},matchMedia:()=>({matches:false}),setTimeout:f=>{timers.set(++timerId,f);return timerId},clearTimeout:id=>timers.delete(id),document:{documentElement:{lang},activeElement:button,body:{append:n=>{n.appended=true}},createElement:element,execCommand:()=>{if(fallback==='throw')throw Error('copy blocked');return fallback},getElementById:()=>toast,querySelectorAll:()=>[]}};
  vm.runInNewContext(code,context);
  return {api:context.window.LTCInterface,button,toast,nodes,timers,element};
}
for (const lang of ['en','ko','zh-CN']) {
  const x=setup({lang});assert.equal(await x.api.copyText('hello',null,x.button),true);
  const status=x.button.children[0];assert.equal(status.attrs.role,'status');assert.equal(status.dataset.copyResult,'success');assert.ok(x.button.classList.contains('copy-success'));assert.ok(status.textContent);
  [...x.timers.values()].forEach(f=>f());assert.equal(x.button.textContent,'Copy inquiry');assert.ok(status.textContent,'Inline status persists after button reset');
}
for (const clipboard of [false,async()=>{throw Error('denied')}]) for(const fallback of [false,'throw',true]){
  const x=setup({clipboard,fallback});const result=await x.api.copyText('WeChat test',null,x.button);
  assert.equal(result,fallback===true);const status=x.button.children[0];
  assert.equal(status.dataset.copyResult,result?'success':'error');assert.equal(x.button.classList.contains('copy-success'),result);
  if(!result){const area=status.children[0];assert.equal(area.value,'WeChat test');assert.ok(area.focused&&area.selected);assert.ok(!area.style.cssText.includes('-9999'));assert.equal(area.attrs['aria-label'],'Text to copy manually');assert.equal(x.button.textContent,'Copy inquiry');}
}
{
  let fail=true;const x=setup({clipboard:async()=>{if(fail)throw Error('denied')}});
  await x.api.copyText('first',null,x.button);const area=x.button.children[0].children[0];
  fail=false;await x.api.copyText('second',null,x.button);assert.ok(area.removed);assert.equal(x.button.children.length,1,'Reuses one status');
}
{
  const x=setup({clipboard:false});const source=x.element('textarea');source.value='text';
  assert.equal(await x.api.copyText('text',source,x.button),false);assert.ok(source.focused&&source.selected);assert.equal(x.button.children[0].children.length,0);
}
{
  const pending=[];const x=setup({clipboard:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))});
  const first=x.api.copyText('first',null,x.button),second=x.api.copyText('second',null,x.button);
  pending[1].resolve();assert.equal(await second,true);const success=x.button.children[0].textContent;
  pending[0].reject(Error('older denied'));assert.equal(await first,false);assert.equal(x.button.children[0].textContent,success);assert.ok(x.button.classList.contains('copy-success'));
  const oldTimer=[...x.timers.values()][0];const third=x.api.copyText('third',null,x.button);oldTimer();assert.equal(x.button.textContent,'Copying…');pending[2].resolve();await third;
  [...x.timers.values()].forEach(f=>f());assert.equal(x.button.textContent,'Copy inquiry');
}
console.log('PASS: KO/ZH/EN persistent live feedback, success reset, absent/denied clipboard, fallback true/false/throw, selected visible manual fallback, failure cleanup, existing textarea selection, overlapping attempts and stale timers.');

{
  const x=setup();
  await x.api.copyText('first',null,x.button);
  x.button.textContent='Enter required trip details';
  [...x.timers.values()].forEach(f=>f());
  assert.equal(x.button.textContent,'Enter required trip details','Reset preserves the latest form-rendered label');
  x.button.textContent='Copy updated inquiry';
  await x.api.copyText('second',null,x.button);
  [...x.timers.values()].forEach(f=>f());
  assert.equal(x.button.textContent,'Copy updated inquiry','Next copy refreshes its original label from the current form state');
  assert.ok(!x.button.classList.contains('copy-success'));
}
console.log('PASS: Copy reset preserves later form renders and the next copy restores its refreshed label.');
