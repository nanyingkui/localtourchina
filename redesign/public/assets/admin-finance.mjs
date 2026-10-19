export function money(value){
 const text=String(value??'').trim();
 if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(text))throw Error('金额应为非负数字，最多两位小数。');
 return Math.round(Number(text)*100);
}
export function quoteTotal(items){
 if(items.length>50)throw Error('每份报价最多50项。');
 let total=0;
 for(const item of items){if(!String(item.name||'').trim()||String(item.name).length>200)throw Error('请填写报价项目名称（最多200字）。');
 const qty=Number(item.quantity);if(!Number.isInteger(qty)||qty<1||qty>9999)throw Error('数量应为1至9999的整数。');total+=money(item.unit_price)*qty;}
 if(!Number.isSafeInteger(total)||total>999999999999)throw Error('报价总额超出支持范围。');return total/100;
}
export function paymentBalance(payments,currency){
 let total=0;
 for(const row of payments){if(row.currency!==currency)continue;total+=(row.kind==='refund'?-1:1)*money(row.amount);}
 return total/100;
}
export function prepareFinance(existing,items,deposit,payment,currency,ackLegacy=false){
 const data=structuredClone(existing||{}),history=data.payments||[];
 quoteTotal(items);data.quote_items=items;
 data.deposit_due=deposit===''?null:money(deposit)/100;
 if(data.deposit_due!==null&&items.length&&data.deposit_due>quoteTotal(items))throw Error('应收定金不能超过报价总额。');
 if(history.some(row=>row.currency!==currency))throw Error('已有付款记录，不能更改报价币种。');
 if(payment){
  if(!/^[A-Z]{3}$/.test(currency))throw Error('请先填写三位报价币种，例如 KRW、CNY。');
  if(money(payment.amount)<=0)throw Error('收款或退款金额必须大于0。');
  if(!payment.occurred_at||!Number.isFinite(Date.parse(payment.occurred_at)))throw Error('请填写实际收款或退款时间。');
  if(!['receipt','refund'].includes(payment.kind))throw Error('付款记录类型无效。');
  if(!history.length&&payment.legacy_paid&&!ackLegacy)throw Error('历史只有收款标记，请先核对并确认本次录入已包含历史收款。');
  const {legacy_paid,...entry}=payment;
  const normalized={...entry,currency,amount:money(payment.amount)/100},previous=history.find(row=>row.id===entry.id);
  if(previous&&['kind','currency','amount','occurred_at','method','note'].some(key=>String(previous[key]??'')!==String(normalized[key]??'')))throw Error('该笔记账编号已使用，请刷新核对，不能覆盖原记录。');
  data.payments=previous?history:[...history,normalized];
  if(paymentBalance(data.payments,currency)<0)throw Error('退款累计不能超过已记录收款。');
  if(ackLegacy)data.legacy_reconciled=true;
 }
 return data;
}
export function bindFinanceEditor({host,order,draft,onChange,escape:esc}){
 let items=structuredClone(draft?.quote_items??order.admin_data?.quote_items??[]);
 const payments=order.admin_data?.payments||[],currency=(order.quote_currency||'KRW').toUpperCase();
 const net=paymentBalance(payments,currency),legacyUnknown=order.payment_received&&!payments.length;
 const balance=legacyUnknown?'历史收款金额待核对，暂不计算剩余应收。':order.quote_amount!=null?'剩余应收：'+currency+' '+Math.max(0,Math.round((Number(order.quote_amount)-net)*100)/100)+(net>Number(order.quote_amount)?' · 存在超收，请核对。':''):'尚未确认报价总额，暂不计算剩余应收。';
 host.innerHTML=`<h4>逐项报价</h4><p class="admin-section-help">这里是人工确认的报价，不改变网站产品价格。无明细时保留原总额报价。</p><div id="quoteItems"></div><button type="button" class="secondary" id="addQuoteItem">添加报价项目</button><p id="itemTotal" role="status"></p><label>应收定金<input id="fDepositDue" type="number" min="0" step="0.01" value="${esc(draft?.deposit_due??order.admin_data?.deposit_due??'')}"></label><h4>收款与退款记录</h4><p class="admin-section-help">只记录实际发生的款项，不会发起扣款或退款。按报价币种记账，保存处理进度后生效；已有流水不可覆盖，录错请追加更正记录。</p><div class="readbox">${payments.length?payments.map(p=>`${p.kind==='refund'?'退款':'收款'} · ${p.currency} ${p.amount} · ${new Date(p.occurred_at).toLocaleString('zh-CN')} · ${p.method||'方式未填'}${p.note?' · '+p.note:''}`).map(esc).join('\n'):order.payment_received?'历史已标记收款，但金额尚未核对。':'暂无付款记录。'}</div><p>已记录净收款：${esc(currency)} ${net}</p><p>${esc(balance)}</p><div class="form-grid"><label>本次记账<select id="fPaymentKind"><option value="">本次不新增</option><option value="receipt">实际收款</option><option value="refund">实际退款</option></select></label><label>本次金额<input id="fPaymentAmount" type="number" min="0.01" step="0.01"></label><label>发生时间<input id="fPaymentDate" type="datetime-local"></label><label>方式<input id="fPaymentMethod" maxlength="100" placeholder="例如：银行转账"></label><label class="wide">记账备注<input id="fPaymentEntryNote" maxlength="500"></label>${order.payment_received&&!payments.length?'<label class="wide"><input id="fLegacyReconciled" type="checkbox">已核对历史收款，本次录入包含全部历史收款</label>':''}</div>`;
 const list=host.querySelector('#quoteItems'),status=host.querySelector('#itemTotal');
 const read=()=>Array.from(list.querySelectorAll('[data-quote-item]')).map(row=>({name:row.querySelector('[data-name]').value.trim(),quantity:Number(row.querySelector('[data-qty]').value),unit_price:row.querySelector('[data-price]').value}));
 const update=()=>{items=read();try{const total=quoteTotal(items);status.textContent=items.length?'逐项合计：'+total:'未使用明细，沿用原报价总额。';if(items.length){const amount=document.getElementById('fAmount');amount.value=total;}}catch(err){status.textContent=err.message;}onChange();};
 const render=()=>{list.innerHTML=items.map((item,i)=>`<div class="quote-item" data-quote-item><label>项目 ${i+1}<input data-name aria-label="报价项目 ${i+1} 名称" maxlength="200" value="${esc(item.name)}"></label><label>数量<input data-qty aria-label="报价项目 ${i+1} 数量" type="number" min="1" max="9999" step="1" value="${esc(item.quantity)}"></label><label>单价<input data-price aria-label="报价项目 ${i+1} 单价" type="number" min="0" step="0.01" value="${esc(item.unit_price)}"></label><button type="button" class="secondary" data-remove="${i}">移除项目 ${i+1}</button></div>`).join('');list.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{items=read();items.splice(Number(button.dataset.remove),1);render();update();});};
 render();list.addEventListener('input',update);host.querySelector('#addQuoteItem').onclick=()=>{items=read();if(items.length>=50){status.textContent='每份报价最多50项。';return;}items.push({name:'',quantity:1,unit_price:0});render();onChange();};
 return {read:()=>({quote_items:read(),deposit_due:host.querySelector('#fDepositDue').value})};
}
