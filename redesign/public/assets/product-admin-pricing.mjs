import {adminFetch} from './product-admin-access.mjs';
const $=id=>document.getElementById(id),money=n=>n==null?'待确认':new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(n),e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={tickets:'景区门票及演出／人',meal:'游客正餐／人／餐',massage:'按摩／人',guide_small:'2–6人导游／天',guide_large:'7人起每位导游／天',guide_meal:'每位导游餐补／天',car7:'7座车／天',car9:'9座车／天',car14:'14座车／天'};
let rules,rows=[],dirty=false,busy=false,request=0,editVersion=0,timer,renderedContext;
const context=()=>({hotel:$('hotel').value,date:$('date').value,scenario:$('scenario').value});
const key=()=>[...Object.values(context()),$('party').value].join('|');
$('party').innerHTML=Array.from({length:29},(_,i)=>`<option value="${i+2}">${i+2}人</option>`).join('');$('party').value='4';
function setScenario(){const s=rules.scenarios[$('scenario').value];$('days').value=s.days;$('meals').value=s.meals;}
function setOverride(){$('override').value=rules.quote_overrides?.[key()]??rules.overrides[$('party').value]??'';}
function setFields(){
 const chosen=$('hotel').value;
 $('hotel').innerHTML=Object.entries(rules.hotels).map(([id,h])=>`<option value="${e(id)}">${h.area==='city'?'市区':'武陵源'} · ${e(h.names.zh)}</option>`).join('');
 $('hotel').value=rules.hotels[chosen]?chosen:'HT-139';
 $('reserve').value=rules.reserve*100;$('fees').value=rules.fees*100;$('growth').value=rules.growth_floor;
 $('fx-date').value=rules.fx.date;$('fx-cny').value=rules.fx.rates.CNY;$('fx-usd').value=rules.fx.rates.USD;
 $('cost-fields').innerHTML=Object.entries(labels).map(([k,v])=>`<label>${e(v)}（元）<input data-cost="${k}" type="number" min="0" step="0.1" value="${rules.costs[k]}"></label>`).join('');setScenario();setOverride();
}
function readCommon(){
 rules.reserve=+$('reserve').value/100;rules.fees=+$('fees').value/100;rules.growth_floor=+$('growth').value;
 rules.fx={date:$('fx-date').value,rates:{CNY:+$('fx-cny').value,USD:+$('fx-usd').value}};
 for(const el of document.querySelectorAll('[data-cost]'))rules.costs[el.dataset.cost]=+el.value;
 rules.scenarios[$('scenario').value]={days:+$('days').value,meals:+$('meals').value};
}
function captureNights(){
 if(!renderedContext)return;
 const h=rules.hotels[renderedContext.hotel],r=rows.find(x=>x.party===+$('party').value);if(!r)return;
 for(const input of document.querySelectorAll('[data-night]')){
  const day=input.dataset.night,rate=input.value?+input.value:null,check=document.querySelector(`[data-confirm="${day}"]`),confirmed=rate!==null&&check.checked;
  if(rate===null)check.checked=false;
  const old=h.overrides[day]||h.rates[day]||{rate:null,confirmed:false};
  if(rate!==old.rate||confirmed!==old.confirmed)h.overrides[day]={rate,confirmed,source:'manual'};
 }
}
function render(){
 const h=rules.hotels[$('hotel').value],r=rows.find(x=>x.party===+$('party').value);if(!r)return;renderedContext=context();
 $('hotel-description').textContent=h.names.zh+' · '+(h.room||'含双早标间，最终房型确认')+' · '+(h.area==='city'?'市区':'武陵源')+'。'+(h.price_basis==='trip_inclusive'?'已查 Trip.com 含税双早价格作为采购价，保留原优惠与退改条件。':'保留酒店经理采购方式；须录入当晚可用于核价的采购价。');
 $('guard').className='banner'+(r.pending?' pending':r.safe?'':' warn');
 $('guard').textContent=r.pending?'住宿价待确认：'+r.nights.filter(x=>!x.confirmed||x.rate==null).map(x=>x.date).join('、')+'。不显示总售价或利润。':r.safe?'✓ 预计利润达到 25% 与每团 ¥2,500 底线。已按所选三晚分别计算，房态与最终支出仍需确认。':'需调整：'+r.warnings.join('；')+'。此条件在客人端显示待确认。';
 const metrics=r.pending?[['整团售价','待确认','请补齐三晚采购价'],['直接成本','待确认','已知成本见下方明细'],['整团预计利润','待确认','不把缺失采购价当作0元'],['预计利润率','待确认','25% / 每团 ¥2,500']]:[['整团售价',`₩${money(r.totalKRW)}`,`每人 ₩${money(r.perPersonKRW)}`],['直接成本',`¥${money(r.direct)}`,`预备金 ¥${money(r.reserve)} · 收款费 ¥${money(r.fees)}`],['整团预计利润',`¥${money(r.profit)}`,'已扣成本、预备金、收款费'],['预计利润率',`${(r.margin*100).toFixed(2)}%`,'底线 25% / 每团 ¥2,500']];
 $('metrics').innerHTML=metrics.map(([a,b,c],i)=>`<article class="${r.pending?'pending':!r.safe&&i>=2?'warn':''}"><small>${a}</small><strong>${b}</strong><small>${c}</small></article>`).join('');
 $('nights').innerHTML=r.nights.map((x,i)=>`<article class="${x.confirmed?'':'pending'}"><strong>第${i+1}晚 · ${x.date}</strong><label style="margin-top:14px">采购价（元／间）<input data-night="${x.date}" type="number" min="0.01" step="0.01" value="${x.rate??''}" placeholder="待确认"></label><label class="inline"><input type="checkbox" data-confirm="${x.date}" ${x.confirmed?'checked':''}>可用于核价</label><small>${x.source==='manual'?'手动覆盖采购价':x.source==='trip'?'Trip.com 已查含税价':'尚无价格记录'} · ${r.rooms}间${x.checked_at?' · 查价 '+e(x.checked_at):''}</small>${x.url?`<a class="source-link" href="${e(x.url)}" target="_blank" rel="noopener">查看来源 ↗</a>`:''}<button type="button" data-reset="${x.date}" style="margin-top:12px">清除手动覆盖</button></article>`).join('');
 $('costs').innerHTML=Object.entries(r.parts).map(([k,v])=>`<div class="row"><span>${k}</span><strong>${v==null?'待确认':'¥'+money(v)}</strong></div>`).join('')+`<div class="row"><span>成本预备金 ${rules.reserve*100}%</span><strong>${money(r.reserve)}</strong></div><div class="row"><span>收款费 ${rules.fees*100}%</span><strong>${money(r.fees)}</strong></div>`;
 $('scope').textContent=`${r.rooms}间 × 3晚 · ${r.vehicle} × ${r.days}天 · ${r.guides}位导游 × ${r.days}天 · 正餐${r.meals}次`;
 $('rows').innerHTML=rows.map(x=>`<tr class="${x.pending?'pending':x.safe?'':'warn'} ${x.party===r.party?'selected':''}"><td><button class="cell-action" data-party="${x.party}">${x.party}人 ↗</button></td><td>${money(x.perPersonKRW)}</td><td>${money(x.direct)}</td><td>${money(x.pending?null:x.direct+x.reserve+x.fees)}</td><td>${money(x.profit)}</td><td>${x.margin==null?'待确认':(x.margin*100).toFixed(2)+'%'}</td><td>${money(x.minimumKRW)}</td><td>${x.safe?'达标':e(x.warnings.join('；'))}</td></tr>`).join('');
 const dates=[...new Set([...Object.keys(h.rates),...Object.keys(h.overrides)])].sort();
 $('source-rows').innerHTML=dates.map(day=>{const x=h.overrides[day]||h.rates[day];return `<tr><th>${day}</th><td>${money(x.rate)}</td><td>${x.confirmed?'可用于核价':'待确认'}</td><td style="text-align:left;white-space:normal;min-width:240px">${h.overrides[day]?'手动覆盖':x.url?`<a href="${e(x.url)}" target="_blank" rel="noopener">Trip.com ↗</a>`:'待确认'} · ${e(x.checked_at||'')}<div class="source-note">${e(x.terms||'')}</div></td></tr>`}).join('')||'<tr><td colspan="4">尚无逐晚采购记录，可在上方填写。</td></tr>';
}
async function calculate(action='calculate'){
 if(!rules)return;if(busy&&action!=='save')return;
 const id=++request,version=editVersion,ctx=context();
 try{
  if(action==='save')captureNights();readCommon();$('message').textContent=action==='save'?'正在保存…':'试算中…';
  const res=await adminFetch('/api/admin/pricing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,rules,revision:rules.revision,...ctx})});const data=await res.json();if(!res.ok)throw Error(data.error);
  if(id!==request)return;
  if(action==='save'){rules.revision=data.rules.revision;if(version===editVersion)dirty=false;}
  if(version!==editVersion||JSON.stringify(ctx)!==JSON.stringify(context())){schedule();return;}
  rows=data.rows;render();$('message').textContent=dirty?'草稿已试算，尚未保存。':'已保存于产品库 · 版本 '+rules.revision+'';
 }catch(err){$('message').textContent=err.message;}
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>calculate(),300);}
function changed(){dirty=true;editVersion++;schedule();}
async function load(){request++;const res=await adminFetch('/api/admin/pricing');if(!res.ok)throw Error('读取失败');rules=await res.json();dirty=false;setFields();await calculate();}
for(const id of ['hotel','date','scenario'])$(id).onchange=()=>{editVersion++;setScenario();setOverride();calculate();};
$('party').onchange=()=>{setOverride();render()};
for(const id of ['reserve','fees','growth','fx-date','fx-cny','fx-usd','days','meals'])$(id).onchange=()=>{readCommon();changed();};
$('cost-fields').onchange=()=>{readCommon();changed();};
$('override').oninput=()=>{const v=$('override').value;if(v)rules.quote_overrides[key()]=+v;else delete rules.quote_overrides[key()];dirty=true;editVersion++;$('message').textContent='售价已修改，尚未保存。';};
$('override').onchange=schedule;
$('nights').oninput=()=>{captureNights();dirty=true;editVersion++;$('message').textContent='房价已修改，尚未保存。';};
$('nights').onchange=()=>{captureNights();changed();};
$('nights').onclick=ev=>{if(ev.target.dataset.reset){const day=ev.target.dataset.reset,h=rules.hotels[$('hotel').value];delete h.overrides[day];const original=h.rates[day];document.querySelector(`[data-night="${day}"]`).value=original?.rate??'';document.querySelector(`[data-confirm="${day}"]`).checked=!!original?.confirmed;changed();}};
$('rows').onclick=ev=>{if(ev.target.dataset.party){$('party').value=ev.target.dataset.party;setOverride();render();}};
$('clear-override').onclick=()=>{delete rules.quote_overrides[key()];$('override').value='';changed();};
$('save').onclick=async()=>{clearTimeout(timer);busy=true;$('save').disabled=true;await calculate('save');busy=false;$('save').disabled=false;};
$('reload').onclick=()=>{if(!dirty||confirm('放弃尚未保存的修改？'))load();};
window.addEventListener('beforeunload',ev=>{if(dirty){ev.preventDefault();ev.returnValue='';}});
load().catch(err=>$('message').textContent=err.message);
