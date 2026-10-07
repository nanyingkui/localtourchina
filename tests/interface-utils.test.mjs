import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('../assets/interface-utils.js',import.meta.url),'utf8');
function setup({clipboard, fallback=false, reduced=false, lang='ko'}={}){
  const toast={textContent:'',classList:{add(){},remove(){}}};
  const source={value:'inquiry',getClientRects:()=>[{}],focus(){this.focused=true},select(){this.selected=true}};
  const state={removed:0,fallbackCalls:0};
  const context={window:{LTCImageSizes:{'assets/photo.jpg':[1200,800]}},navigator:{clipboard:{writeText:clipboard||(async()=>{})}},matchMedia:()=>({matches:reduced}),setTimeout:()=>1,clearTimeout(){},document:{documentElement:{lang},activeElement:{focus(){}},body:{append(){}},createElement:()=>({style:{},select(){},remove(){state.removed++}}),execCommand:()=>{state.fallbackCalls++;if(fallback==='throw')throw Error('blocked');return fallback},getElementById:()=>toast,querySelectorAll:()=>[source]}};
  vm.runInNewContext(code,context);
  return {api:context.window.LTCInterface,toast,source,state};
}
const blocked=async()=>{throw Error('clipboard denied')};
for(const fallback of [false,'throw']){const x=setup({clipboard:blocked,fallback});assert.equal(await x.api.copyText('inquiry',x.source),false);assert.match(x.toast.textContent,/복사하지 못/);assert.ok(x.source.focused&&x.source.selected);assert.equal(x.state.removed,1)}
{const x=setup({clipboard:blocked,fallback:true});assert.equal(await x.api.copyText('inquiry'),true);assert.match(x.toast.textContent,/복사되었습니다/);assert.equal(x.state.removed,1)}
{const x=setup();assert.equal(await x.api.copyText('inquiry'),true);assert.equal(x.state.fallbackCalls,0)}
{const x=setup({clipboard:blocked,lang:'zh-CN'});await x.api.copyText('inquiry');assert.match(x.toast.textContent,/复制失败/)}
assert.equal(setup({reduced:true}).api.scrollBehavior(),'instant');
assert.equal(setup().api.scrollBehavior(),'smooth');
assert.equal(setup().api.imageDimensions('../assets/photo.jpg'),'width="1200" height="800"');
console.log('Clipboard success/failure, fallback cleanup, focus recovery, localization, reduced motion and image dimensions: passed');
