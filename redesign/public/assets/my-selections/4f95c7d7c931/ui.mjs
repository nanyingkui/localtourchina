import {KEY,readState,commit,totals,selectionIdentity} from './model.mjs';
import {activeProduct,captureProduct,restoreProduct} from './bridge.mjs';
import {makeCustomItem,reviewWarnings,SERVICE_OPTIONS,serviceLabel} from './custom-trip.mjs';
import {draftKey,readDraft,writeDraft,clearDraft,activeDraft} from './drafts.mjs';
import {copyChannelBrief} from './chat-handoff.mjs';
import {contactChannel} from './contact-channels.mjs';
import {canonicalItem,conditionText,referenceQuote,formatReferenceQuote,latestExchangeRates} from './catalog-config.mjs';
import {channelBrief} from './channel-brief.mjs';
const lang=document.documentElement.lang.startsWith('zh')?'zh':document.documentElement.lang==='en'?'en':'ko';
const w=(ko,zh,en)=>lang==='zh'?zh:lang==='en'?en:ko;
const channel=contactChannel(lang);
let catalog={};try{const response=await fetch('/customer-catalog.json');if(response.ok)catalog=await response.json();}catch{}
function readCatalogState(){
 const current=readState(localStorage);
 const clear=item=>{const record=catalog[item.productId||item.id?.replace(/^product:/,'')];if(!record?.pricing?.requires_manual_review&&!(['vehicles','tickets','local-guide'].includes(record?.id)&&item.catalogRevision!==record.revision))return item;return {...item,quote:null,amountKRW:null,details:item.kind==='catalog'?canonicalItem(record,lang,item.conditions||{},null).details:item.details.split('\n').filter(line=>!/(예상.*금액|예상.*비용|预计金额|預計金額|Estimated.*(?:price|total)|KRW|₩)/i.test(line)).join('\n')+'\n'+w('요금: 변경된 조건으로 다시 확인','价格：须按最新条件重新确认','Price: recheck against the current conditions')};};
 current.items=current.items.map(clear);if(current.undo?.item)current.undo.item=clear(current.undo.item);return current;
}
const localize=item=>{
 const record=catalog[item.productId||item.id?.replace(/^product:/,'')];if(!record)return item;
 const raw=item.kind==='catalog'?referenceQuote(record,item.conditions||{}):item.quote;
 const quote=raw?formatReferenceQuote(raw,lang,marketFx||(item.quote?.fx?.rates?item.quote.fx:null)):null;
 const localized=item.kind==='catalog'?canonicalItem(record,lang,item.conditions||{},quote):null;
 return {...item,quote,amountKRW:item.kind==='catalog'?(quote?.totalKRW??null):item.amountKRW,title:item.kind==='furong'?w('부용진 이동','芙蓉镇接送','Furong transfer'):record.locales[lang].title,sourcePath:item.kind==='furong'?'/?view=furong&lang='+lang:record.paths[lang],...(localized?{summary:localized.summary,missing:localized.missing,details:localized.details}:item.conditions?{summary:conditionText(item.conditions,lang).replaceAll('\n',' · ')||item.summary}:{}),displayAmountText:quote?.priceLabel|| (item.kind!=='catalog'&&item.amountKRW!==null?itemMoney(item):labels.quote)};
};
const prefix=lang==='ko'?'/':`/${lang}/`;
let marketFx=null,displayFx=null;

const money=n=>displayFx?new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-US',{style:'currency',currency:displayFx.currency}).format(n*displayFx.rate):'₩'+n.toLocaleString('en-US');
const itemMoney=item=>{if(displayFx)return money(item.amountKRW);const fx=item.quote?.fx;return fx&&fx.currency===(lang==='zh'?'CNY':lang==='en'?'USD':'KRW')?new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-US',{style:'currency',currency:fx.currency}).format(item.amountKRW*fx.rate)+' · '+w('참고 금액','参考价','reference'):money(item.amountKRW);};
const $=s=>document.querySelector(s);
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function button(text,fn,cls=''){const b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
const labels={title:w('내 선택','我的选择','My selections'),add:w('내 선택에 담기','加入我的选择','Add to my selections'),save:w('수정 내용 저장','保存修改','Save changes'),edit:w('수정','修改','Edit'),remove:w('제거','移除','Remove'),cancel:w('취소','取消','Cancel'),quote:w('별도 문의','待报价','Quote required'),partial:w('추가 입력 필요','待补充','Needs details'),saved:w('이 브라우저에 저장됨','已保存在此浏览器','Saved in this browser')};
const errors={STORAGE:w('저장하지 못했습니다. 입력 내용은 그대로 두었습니다. 저장 공간을 확인하고 다시 시도해 주세요.','未能保存，刚填写的内容仍保留着。请检查浏览器存储后重试。','Could not save. Your inputs are retained. Check browser storage and retry.'),CORRUPT:w('저장된 선택을 읽을 수 없습니다. 기존 자료를 덮어쓰지 않았습니다.','无法读取原清单，未覆盖已有资料。','Could not read saved choices. Nothing was overwritten.'),CONFLICT:w('다른 창에서 이 선택을 수정했습니다. 최신 내용을 확인한 뒤 다시 저장해 주세요.','另一窗口已修改此项，请核对最新内容后再保存。','This choice changed in another tab. Review the latest version before saving.'),LIMIT:w('선택 내용이 너무 많습니다. 필요 없는 항목을 정리해 주세요.','清单内容已达到保存上限，请整理不需要的项目。','The saved list is full. Remove unused items.'),MISSING:w('이 항목이 변경되었거나 제거되었습니다. 목록을 확인해 주세요.','此项已变更或移除，请查看清单。','This item changed or was removed. Check the list.')};
let state,storageError=false,activeId='',editItem=null,saveBusy=false,addIntent=null,reviewIds=null,reviewText='',returnFocus=null,questionEdit=null,restoredId='',restoring=false,editDirty=false,workingStored=true,inlineDraft=null,inlineStored=true;
const inlineMemory=new Map(),volatileDrafts=new Set();
const workingKey=id=>'ltc-ms-edit-working-v1:'+id;
function clearWorking(id){try{sessionStorage.removeItem(workingKey(id));}catch{}}
function persistWorking(){if(!editItem||restoring)return;const product=captureProduct(lang);if(!product)return;editDirty=true;try{const serialized=JSON.stringify({expectedRevision:editItem.revision,product});sessionStorage.setItem(workingKey(editItem.id),serialized);workingStored=sessionStorage.getItem(workingKey(editItem.id))===serialized;}catch{workingStored=false;}}
window.addEventListener('beforeunload',event=>{if(editDirty&&!workingStored||volatileDrafts.size){event.preventDefault();event.returnValue='';}});
try{state=readCatalogState();}catch(error){state={version:1,revision:0,items:[],undo:null};storageError=true;}
document.body.classList.add('ms-selections');
const entry=button('',()=>openList(),'ms-entry');entry.dataset.msUi='';entry.setAttribute('aria-haspopup','dialog');(document.querySelector('[data-selection-slot]')||document.body).append(entry);
const toast=el('div','ms-toast');toast.dataset.msUi='';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);let toastTimer;
function announce(text,error=false){clearTimeout(toastTimer);toast.replaceChildren(el('span','',text));toast.classList.toggle('ms-error',error);toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true;},6500);}
toast.hidden=true;
const dialog=el('dialog','ms-dialog');dialog.dataset.msUi='';dialog.setAttribute('aria-labelledby','ms-heading');
const head=el('header','ms-head'),heading=el('h2','',labels.title);heading.id='ms-heading';heading.tabIndex=-1;
const close=button(w('닫기','关闭','Close'),()=>closeDialog(),'ms-close');head.append(heading,close);
const subtitle=el('p','ms-subtitle',w('담아 둔 서비스와 궁금한 점을 한곳에서 확인하세요.','选好的服务和想问的问题，都在这里。','Your chosen services and questions, together.'));
const body=el('div','ms-body'),foot=el('footer','ms-footer');dialog.append(head,subtitle,body,foot);document.body.append(dialog);
dialog.addEventListener('input',e=>e.stopPropagation());dialog.addEventListener('change',e=>e.stopPropagation());
dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
function closeDialog(){pauseInline();dialog.close();entry.setAttribute('aria-expanded','false');(returnFocus?.isConnected?returnFocus:entry).focus();reviewIds=null;questionEdit=null;}
function refreshState(){try{state=readCatalogState();storageError=false;}catch(error){storageError=true;announce(errors[error.code]||errors.STORAGE,true);}updateEntry();}
function updateEntry(){entry.replaceChildren(el('span','ms-entry-icon',''),el('span','',labels.title),el('b','ms-entry-count',String(state.items.length)),el('small','',storageError?w('저장 확인 필요','保存异常','Check storage'):labels.saved));entry.setAttribute('aria-label',labels.title+' · '+state.items.length+w('개, 보기','项，查看',' items, view'));}
async function mutate(action){
 const run=()=>{const current=readCatalogState();return commit(localStorage,action,current.revision);};
 const result=navigator.locks?await navigator.locks.request('ltc-selections-write-v1',run):run();
 state=readCatalogState();storageError=false;updateEntry();return result;
}
function showError(error){announce(errors[error.code]||w('저장하지 못했습니다. 입력을 유지한 채 다시 시도해 주세요.','未保存，请保留当前内容后重试。','Not saved. Your inputs are retained; retry.'),true);}
function openDialog(){if(!dialog.open){returnFocus=document.activeElement;dialog.showModal();}entry.setAttribute('aria-expanded','true');heading.focus();}
document.addEventListener('catalog:saved',event=>{refreshState();if(event.detail.inquire)review(['product:'+event.detail.productId]);else openList('product:'+event.detail.productId);});
function openList(id=''){refreshState();reviewIds=null;questionEdit=null;if(id)activeId=id;renderList();openDialog();}
function infoTotal(target,items){const sum=totals(items),row=el('div','ms-total');row.append(el('span','',w('개별 항목 참고 소계','单项参考小计','Individual-item reference subtotal')),el('strong','',sum.priced?money(sum.amount):sum.quoted?labels.quote:w('금액 항목 없음','尚无计价项目','No priced items')));target.append(row);if(displayFx)target.append(el('small','ms-total-rate',w('환율 기준일: ','汇率日期：','Exchange rate dated: ')+displayFx.date));target.append(el('p','ms-total-note',`${sum.count}${w('개 선택','项已勾选',' selected')}${sum.quoted?' · '+sum.quoted+w('개 별도 견적','项待报价',' quote required'):''}${sum.questions?' · '+sum.questions+w('개 질문','个问题',' questions'):''}${sum.incomplete?' · '+sum.incomplete+w('개 추가 입력 필요','项待补充',' need details'):''}`));}

latestExchangeRates().then(fx=>{
 if(!fx?.date||!(fx.rates?.USD>0)||!(fx.rates?.CNY>0))return;
 marketFx=fx;const currency=lang==='zh'?'CNY':'USD';if(lang!=='ko')displayFx={currency,rate:fx.rates[currency],date:fx.date};
 if(dialog.open){if(reviewIds)review(reviewIds);else if(heading.textContent===labels.title)renderList();}
});

function showReviewWarnings(target,items){for(const warning of reviewWarnings(items,lang,state.items))target.append(el('p','ms-scope-warning',warning.message));}
function renderList(){
 pauseInline();
 heading.textContent=labels.title;subtitle.textContent=w('카드를 열어 확인하고, 필요한 항목만 함께 문의하세요.','点开卡片查看详情，勾选本次想咨询的项目。','Open a card to review it. Include only what you want to ask about.');body.replaceChildren();foot.replaceChildren();
 const intro=el('div','ms-list-top');intro.append(el('strong','',state.items.length+w('개 담았어요','项已保存',' items saved')),el('span','',storageError?errors.CORRUPT:labels.saved));body.append(intro);
 const custom=el('section','ms-custom-entry');custom.append(el('p','ms-eyebrow',w('아직 일정이 정해지지 않았나요?','还没想好怎么选？','Still deciding on a trip?')),el('h3','',w('원하는 여행부터 알려 주세요','先告诉我，你想怎样旅行','Tell us what your trip should feel like')),el('p','',w('짧은 생각만 남겨도 괜찮아요. 날짜·예산은 나중에 확인할 수 있어요.','简单说说想法就行，日期和预算可以以后再确认。','A few words are enough. Dates and budget can follow later.')),button(w('내 취향대로 여행 상담','按我的想法定制行程','Plan a trip around me'),()=>customForm(),'ms-custom-start'));if(!state.items.length)body.append(custom);
 showReviewWarnings(body,state.items);
 if(!state.items.length){const empty=el('div','ms-empty');empty.append(el('h3','',w('필요한 것부터 하나씩 담아 보세요','先把需要的内容，一项项放进来','Start with what you need')),el('p','',w('기존 상품 화면에서 날짜·인원·옵션을 고른 뒤 담아 주세요. 질문만 먼저 저장해도 괜찮아요.','按原来的方式选择产品、日期、人数和选项，再加入清单；也可以先存一个问题。','Use the existing product screens, then add your selections. You can save a question first.')));body.append(empty);}
 const stack=el('div','ms-stack');body.append(stack);
 for(const [index,item]of state.items.map(localize).entries()){
  const expanded=activeId===item.id,card=el('article','ms-card'+(expanded?' ms-active':'')+(item.included?'':' ms-not-included'));card.dataset.selectionId=item.id;card.style.setProperty('--card-index',index);
  const top=el('div','ms-card-top'),check=el('input');check.type='checkbox';check.checked=item.included;check.setAttribute('aria-label',w('문의에 포함: ','纳入本次咨询：','Include in inquiry: ')+item.title);
  check.addEventListener('change',async()=>{try{await mutate({type:'include',id:item.id,included:check.checked});renderList();}catch(error){check.checked=!check.checked;showError(error);}});
  const expand=button('',()=>{activeId=expanded?'':item.id;renderList();body.querySelector(`[data-selection-id="${item.id}"] .ms-card-expand`)?.focus();},'ms-card-expand');expand.setAttribute('aria-expanded',String(expanded));expand.setAttribute('aria-controls','ms-details-'+item.id);
  const text=el('span','ms-card-title');text.append(el('b','',item.title),el('small','',item.summary));
  const picture=catalog[item.productId]?.discovery?.image;if(picture){const image=el('img','ms-item-photo');image.src=picture.startsWith('/')?picture:'/'+picture.replace(/^(\.\.\/)+/,'');image.alt='';image.loading='lazy';expand.append(image);}
  expand.append(text,el('span','ms-chevron',expanded?'−':'+'));top.append(check,expand);card.append(top);
  const meta=el('div','ms-card-meta');meta.append(el('strong','',item.kind==='question'?w('상담 질문','咨询问题','Question'):item.quote?.priceLabel||(item.amountKRW===null?labels.quote:itemMoney(item))),el('span',item.missing?.length?'ms-status ms-pending':'ms-status',item.missing?.length?labels.partial:item.briefVersion?w('요청 저장됨','需求已保存','Request saved'):w('조건 저장됨','条件已保存','Details saved')));card.append(meta);
  if(expanded){const detail=el('div','ms-card-detail');detail.id='ms-details-'+item.id;if(item.missing?.length)detail.append(el('p','ms-missing',w('확인할 내용: ','待补充：','Still needed: ')+item.missing.join('、')));
   const full=el('details','ms-full'),label=el('summary','',w('세부 조건·포함 사항 보기','查看详细条件与包含项目','Details and inclusions'));full.append(label,el('pre','',item.details));detail.append(full);
   const actions=el('div','ms-card-actions');actions.append(button(labels.edit,()=>edit(item),'ms-action-main'),button(labels.remove,()=>remove(item),'ms-action-quiet'),button(w('이 항목만 문의','只咨询这一项','Ask about this item'),()=>review([item.id]),'ms-action-quiet'));detail.append(actions);card.append(detail);
  }
  stack.append(card);
 }
 const add=el('div','ms-add-actions');add.append(button(w('다른 여행·서비스 추가','继续挑选产品或服务','Add tours or services'),()=>{closeDialog();location.href=prefix+'products.html';},'ms-add-service'),button(w('궁금한 점 추가','添加想问的问题','Add a question'),()=>questionForm(),'ms-add-question'));body.append(add);if(state.items.length)body.append(custom);
 if(state.undo){const undo=el('div','ms-undo');undo.append(el('span','',w('제거한 항목: ','已移除：','Removed: ')+state.undo.item.title),button(w('되돌리기','撤销','Undo'),async()=>{try{const result=await mutate({type:'undo'});activeId=result.item.id;renderList();announce(w('다시 담았습니다.','已恢复到清单。','Restored to your list.'));}catch(error){showError(error);}}));body.append(undo);}
 infoTotal(foot,state.items);
 const ask=button(w('선택한 항목 문의하기','咨询已选项目','Ask about selected items'),()=>review(state.items.filter(x=>x.included).map(x=>x.id)),'ms-primary');ask.disabled=!totals(state.items).count||storageError;foot.append(ask,el('small','ms-local-note',w('현재 브라우저에 저장 · 실제 예약 확정 아님','保存在当前浏览器 · 尚未确认预订','Saved in this browser · not a confirmed booking')));
}
async function remove(item){try{await mutate({type:'remove',id:item.id,expectedItemRevision:item.revision});if(activeId===item.id)activeId='';renderList();announce(w('제거했습니다. 목록에서 되돌릴 수 있어요.','已移除，可在清单中撤销。','Removed. You can undo this in the list.'));}catch(error){showError(error);}}
function edit(item){
 if(item.briefVersion==='custom-trip-brief-v1'){customForm(item);return;}
 if(item.kind==='question'||item.kind==='manual'){questionForm(item);return;}
 const target=new URL(item.sourcePath,location.origin);if(target.origin!==location.origin||!target.pathname.startsWith('/')){showError({code:'INVALID'});return;}
 target.searchParams.set('msEdit',item.id);location.href=target.pathname+target.search+target.hash;
}
function beginInline(kind,item,seed={}){
 pauseInline();const key=draftKey(kind,item?.id);let draft=inlineMemory.get(key),broken=false;
 if(!draft)try{draft=readDraft(sessionStorage,key);}catch{announce(errors.CORRUPT,true);return null;}
 if(draft&&!item&&state.items.some(x=>x.id===draft.id)){try{clearDraft(sessionStorage,key);}catch{}draft=null;}
 const resumed=!!draft;
 draft=draft||{version:1,kind,id:item?.id||crypto.randomUUID(),baseItem:item||null,initial:seed,values:kind==='custom'?(item?.customBrief||{}):{content:(item||seed)?.details||''},path:location.pathname,lang};
 draft.open=true;inlineDraft={key,value:draft};inlineMemory.set(key,draft);questionEdit=draft.baseItem||{draft:true};
 return {key,draft,resumed,broken};
}
function storeInline(session,values,notice){
 session.draft.values=values;session.draft.open=true;inlineMemory.set(session.key,session.draft);
 try{writeDraft(sessionStorage,session.key,session.draft);inlineStored=true;volatileDrafts.delete(session.key);notice.textContent=session.draft.baseItem?w('수정 임시 저장됨 · 저장 버튼을 누르기 전에는 원래 선택이 바뀌지 않아요.','修改草稿已暂存；点击“保存修改”才会更新原卡片。','Edit draft retained. Your original card changes only when you save.'):w('임시 저장됨 · 아래 버튼을 눌러야 내 선택에 담겨요.','草稿已暂存；点击下方按钮才会加入“我的选择”。','Draft retained. Use the button below to add it to your list.');}
 catch{inlineStored=false;volatileDrafts.add(session.key);notice.textContent=w('임시 저장 실패 · 이 창을 닫기 전에 선택 목록에 저장해 주세요.','草稿暂存失败，请在关闭页面前保存到清单。','Draft could not be retained. Save to the list before leaving this page.');}
}
function pauseInline(){if(!inlineDraft)return;const {key,value}=inlineDraft;value.open=false;inlineMemory.set(key,value);try{writeDraft(sessionStorage,key,value);volatileDrafts.delete(key);}catch{volatileDrafts.add(key);}inlineDraft=null;}
function finishInline(session){try{clearDraft(sessionStorage,session.key);}catch{}inlineMemory.delete(session.key);volatileDrafts.delete(session.key);inlineDraft=null;questionEdit=null;}
function draftNotice(session){const notice=el('p','ms-draft-note',session.resumed?w('저장 전 입력을 복원했습니다. 저장된 선택은 그대로입니다.','已恢复未加入清单的草稿，原选择保持不变。','Unsaved draft restored. Saved selections are unchanged.'):w('닫았다 다시 열거나 새로고침해도 이 탭에서 입력을 이어갈 수 있어요.','关闭后再打开，或在当前标签页刷新，可以接着填写。','Close and reopen, or refresh this tab, to continue your draft.'));notice.setAttribute('role','status');return notice;}
function questionForm(item=null,initial=null){
 const session=beginInline((item||initial)?.kind==='manual'?'manual':'question',item,initial||{});if(!session)return;const base=session.draft.baseItem,seed=base||session.draft.initial;
 heading.textContent=base?labels.edit:w('궁금한 점 담기','添加想问的问题','Save a question');subtitle.textContent=w('날짜나 인원을 몰라도 질문을 저장할 수 있어요.','日期、人数尚未确定，也可以先保存问题。','You can save a question before you know dates or group size.');body.replaceChildren();foot.replaceChildren();if(seed?.kind==='manual')heading.textContent=seed.title;
 const label=el('label','ms-question-label',w('궁금한 점','想咨询什么？','What would you like to ask?')),input=el('textarea');input.rows=7;input.maxLength=2000;input.value=session.draft.values.content||'';input.placeholder=w('예: 계단을 적게 걷는 일정으로 바꿀 수 있을까요?','例如：希望少走台阶，可以怎样调整行程？','For example: Could we plan a route with fewer stairs?');label.append(input);body.append(label);
 const notice=draftNotice(session),status=el('p','ms-form-error');status.setAttribute('role','alert');body.append(notice,status);input.addEventListener('input',()=>storeInline(session,{content:input.value},notice));
 const save=button(base?labels.save:labels.add,async()=>{if(input.value.trim().length<3){status.textContent=w('질문을 조금 더 적어 주세요.','请写下想问的具体内容。','Please add a little more detail.');input.focus();return;}save.disabled=true;try{const content=input.value.trim(),selection={id:session.draft.id,kind:session.draft.kind,title:seed?.kind==='manual'?seed.title:w('궁금한 점','想问的问题','Question'),summary:content.slice(0,90),details:content,fields:[],amountKRW:null,missing:[],language:lang,sourcePath:prefix+'index.html'};const result=await mutate({type:'save',item:selection,...(base?{expectedItemRevision:base.revision}:{})});activeId=result.item.id;finishInline(session);renderList();announce(w('질문을 저장했습니다.','问题已保存。','Question saved.'));}catch(error){showError(error);}finally{save.disabled=false;}},'ms-primary');
 foot.append(save,button(labels.cancel,()=>{finishInline(session);renderList();},'ms-secondary'));storeInline(session,{content:input.value},notice);if(session.resumed)notice.textContent=w('저장 전 질문을 복원했습니다. 원래 선택은 그대로입니다.','已恢复尚未保存的问题，原选择保持不变。','Unsaved question restored. Your saved choice is unchanged.');openDialog();input.focus();
}
function customForm(item=null){
 const session=beginInline('custom',item);if(!session)return;const base=session.draft.baseItem,values=session.draft.values;
 heading.textContent=base?w('맞춤 요청 수정','修改定制需求','Edit custom request'):w('내 취향대로 여행 상담','按我的想法定制行程','Plan a trip around me');subtitle.textContent=w('잘 모르는 항목은 비워 두세요. 원하는 여행만 간단히 알려 주시면 됩니다.','不确定的可以留空，先简单告诉我想怎样玩。','Leave uncertain details blank. Start with what you would enjoy.');body.replaceChildren();foot.replaceChildren();
 const form=el('div','ms-custom-form'),controls={};
 function field(key,title,placeholder='',textarea=false,parent=form){const label=el('label','ms-custom-field',title),input=el(textarea?'textarea':'input');input.id='ms-custom-'+key;input.name=key;input.value=values[key]||'';input.maxLength=textarea?2000:300;input.placeholder=placeholder;if(textarea)input.rows=4;else input.type='text';label.append(input);parent.append(label);controls[key]=input;return input;}
 function select(key,title,options,parent){const label=el('label','ms-custom-field',title),input=el('select');input.id='ms-custom-'+key;input.setAttribute('aria-label',title);for(const [value,text]of options){const option=el('option','',text);option.value=value;input.append(option);}input.value=values[key]||options[0][0];label.append(input);parent.append(label);controls[key]=input;return input;}
 field('wish',w('어떤 여행을 원하세요?','最想怎样旅行？','What would you love to do?'),w('예: 가족 4명, 천천히 여행하고 부용진 야경을 보고 싶어요.','例如：一家四口，想轻松玩张家界和芙蓉镇夜景，酒店已订。','For example: Four of us, a relaxed trip and Furong at night. Hotels already booked.'),true);
 const grid=el('div','ms-custom-grid');form.append(grid);
 field('destination',w('가고 싶은 곳','想去哪里','Where to go'),w('장가계·부용진 등, 미정도 괜찮아요','张家界、芙蓉镇等，也可以还没想好','Zhangjiajie, Furong, or undecided'),false,grid);
 field('when',w('여행 시기·기간','大概什么时候、玩几天','When and how long'),w('예: 12월 말, 4박 5일','例如：12月底，5天4晚','For example: Late December, five days'),false,grid);
 field('party',w('인원·동반자','几位同行、有无儿童','Travellers and children'),w('예: 성인 4명, 어린이 1명(7세)','例如：4位成人、1位7岁儿童','For example: 4 adults and one child aged 7'),false,grid);
 const services=el('fieldset','ms-custom-services');services.append(el('legend','',w('어떤 도움이 필요한가요? (선택)','希望我帮你安排什么？（可选）','What help would you like? (optional)')));const serviceInputs=[];
 for(const key of SERVICE_OPTIONS){const label=el('label'),input=el('input');input.type='checkbox';input.value=key;input.checked=values.services?.includes(key)||false;label.append(input,el('span','',serviceLabel(key,lang)));services.append(label);serviceInputs.push(input);}form.append(services);
 const extra=el('details','ms-custom-extra');extra.append(el('summary','',w('예산·숙소·여행 속도 더 알려 주기 (선택)','再补充预算、住宿或节奏（可选）','Add budget, accommodation or pace (optional)')));form.append(extra);
 field('budget',w('희망 예산 (통화·1인/전체 기준)','预算（注明币种、每人或全团）','Budget (currency and per person / group)'),w('예: 1인 50만 원 / 미정이면 비워 두세요','例如：每人50万韩元，未定可留空','For example: KRW 500,000 per person, or leave blank'),false,extra);
 select('hotel',w('숙소 상황','住宿情况','Accommodation'),[['unknown',w('아직 미정','尚未确定','Undecided')],['arrange',w('숙소도 부탁해요','希望一并安排住宿','Please arrange hotels')],['self',w('직접 예약한 숙소가 있어요','已有自行预订的住宿','Some hotels already booked')]],extra);
 select('pace',w('여행 속도','旅行节奏','Travel pace'),[['unknown',w('상담 후 결정','咨询后再决定','Decide during consultation')],['relaxed',w('여유롭게·걷기 적게','轻松一些、少走路','Relaxed, less walking')],['standard',w('보통','常规节奏','Standard')],['active',w('걷기·트레킹 가능','愿意多走或徒步','Active / walking')]],extra);
 if(state.items.some(x=>x.included&&x.kind!=='custom'))select('relationship',w('이미 담은 선택은 어떻게 할까요?','原来选好的项目怎样处理？','How should existing selections fit?'),[['ask',w('포함 여부부터 상담','先商量是否纳入整体方案','Discuss how they fit first')],['include',w('맞춤 일정에 함께 반영','希望纳入整体定制方案','Include them in the custom plan')],['separate',w('기존 선택과 별개로 요청','与原选择分开安排','Keep them separate')]],extra);
 body.append(form);const notice=draftNotice(session),status=el('p','ms-form-error');status.setAttribute('role','alert');body.append(notice,status,el('p','ms-custom-next',w('생각 남기기 → 담당자와 확인 → 일정·견적 제안 → 확인 후 예약','留下想法 → 客服沟通确认 → 收到行程和报价 → 确认后安排预订','Share wishes → clarify with us → itinerary and quote → booking after confirmation')));
 const gather=()=>({...Object.fromEntries(Object.entries(controls).map(([k,input])=>[k,input.value])),services:serviceInputs.filter(x=>x.checked).map(x=>x.value)});
 form.addEventListener('input',()=>storeInline(session,gather(),notice));form.addEventListener('change',()=>storeInline(session,gather(),notice));
 const save=button(base?labels.save:w('맞춤 요청을 내 선택에 담기','把定制需求加入我的选择','Add custom request to my selections'),async()=>{status.textContent='';save.disabled=true;try{refreshState();const selection=makeCustomItem(gather(),session.draft.id,lang,state.items);const result=await mutate({type:'save',item:selection,...(base?{expectedItemRevision:base.revision}:{})});activeId=result.item.id;finishInline(session);renderList();announce(w('맞춤 요청을 저장했습니다. 아직 상담 접수·예약 확정은 아닙니다.','定制需求已保存，尚未提交咨询或确认预订。','Custom request saved. It is not yet submitted or booked.'));}catch(error){if(error.message==='EMPTY_CUSTOM_BRIEF'){status.textContent=w('원하는 여행이나 목적지 중 하나만 알려 주세요.','至少简单说说想怎样玩，或填写一个目的地。','Tell us a little about your trip or add a destination.');controls.wish.focus();}else if(error.message==='INVALID_CUSTOM_BRIEF')status.textContent=w('입력 내용을 확인해 주세요.','请核对填写内容。','Please check your inputs.');else showError(error);}finally{save.disabled=false;}},'ms-primary');
 foot.append(save,button(labels.cancel,()=>{finishInline(session);renderList();},'ms-secondary'));storeInline(session,gather(),notice);if(session.resumed)notice.textContent=w('저장 전 맞춤 요청을 복원했습니다. 원래 선택은 그대로입니다.','已恢复尚未保存的定制需求，原选择保持不变。','Unsaved custom request restored. Saved choices are unchanged.');openDialog();controls.wish.focus();
}
function review(ids){
 refreshState();reviewIds=ids;const items=state.items.filter(x=>ids.includes(x.id)).map(x=>({...localize(x),included:true}));if(!items.length)return openList();
 heading.textContent=w('카카오톡 문의 전 확인','微信咨询前核对','Review before WhatsApp inquiry');subtitle.textContent=w('선택한 상품과 조건을 확인한 뒤 카카오톡으로 보내 주세요.','核对产品和条件后，复制给微信客服。','Review your products and conditions, then share them on WhatsApp.');body.replaceChildren();foot.replaceChildren();
 body.append(button(w('선택 목록으로 돌아가기','返回选择清单','Back to selections'),()=>{reviewIds=null;renderList();},'ms-back'));showReviewWarnings(body,items);
 for(const item of items){const row=el('article','ms-review-row');row.append(el('h3','',item.title),el('p','',item.summary),el('strong','',item.kind==='question'?w('상담 질문','咨询问题','Question'):item.quote?.priceLabel||(item.amountKRW===null?labels.quote:itemMoney(item))));if(item.quote?.displayText)row.append(el('p','ms-quote-snapshot',item.quote.displayText));if(item.missing?.length)row.append(el('p','ms-missing',w('상담 시 확인: ','咨询时补充：','To confirm: ')+item.missing.join('、')));const detail=el('details');detail.append(el('summary','',w('세부 내용','详细内容','Full details')),el('pre','',item.details));row.append(detail);body.append(row);}
 const area=el('textarea','ms-inquiry-text');area.readOnly=true;area.rows=9;area.setAttribute('aria-label',w('문의 내용 미리보기','咨询内容预览','Inquiry preview'));reviewText=channelBrief(items,lang,state.items);if(displayFx)reviewText=reviewText.replace(/KRW ([\d,]+)/g,(_,v)=>money(Number(v.replaceAll(',',''))));area.value=reviewText;
 const full=el('details','ms-full-text');full.append(el('summary','',w('전체 문의 내용 확인','查看完整咨询内容','Show full inquiry text')),area);body.append(full);
 infoTotal(foot,items);
 const handoffNote=el('p','ms-local-note',w('붙여넣고 직접 보내 주세요. 열기만 하면 전달되지 않아요. 지금 결제하거나 예약하지 않습니다.','请在微信中粘贴并自行发送。复制内容不会发送消息，也不会付款或预订。','Paste and send in the channel. Opening it sends nothing; no payment or booking.'));handoffNote.setAttribute('role','status');
 const openChannel=button(w('내용 복사 · 카카오톡 열기','复制咨询内容','Copy request · open WhatsApp'),async()=>{
  openChannel.disabled=true;
  try{const copied=await copyChannelBrief(reviewText);if(!copied){full.open=true;area.focus();area.select();handoffNote.textContent=w('아래 내용을 직접 복사해 주세요.','请手动复制下方完整内容。','Please copy the full text below.');return;}
   handoffNote.textContent=w('복사했습니다. 카카오톡에서 직접 붙여넣고 보내 주세요.','咨询内容已复制，请粘贴给微信客服 nanyingkui 并自行发送。','Copied. Paste and send in WhatsApp.');
   if(channel.url){const url=lang==='en'?channel.url+'?text='+encodeURIComponent(reviewText):channel.url;window.open(url,'_blank','noopener,noreferrer');}
  }finally{openChannel.disabled=false;}
 },'ms-primary');
 const copyOnly=button(w('내용만 복사','复制微信号 nanyingkui','Copy request only'),async()=>{const content=lang==='zh'?channel.id:reviewText;const copied=await copyChannelBrief(content);handoffNote.textContent=copied?w('복사했습니다. 메시지는 전송되지 않았습니다.','已复制；未发送消息。','Copied. No message sent.'):w('직접 복사해 주세요.','请手动复制。','Please copy manually.');if(!copied){full.open=true;area.focus();area.select();}},'ms-secondary');
 foot.append(openChannel,copyOnly);
 if(channel.url){const manual=el('a','ms-channel-manual',w('카카오톡 직접 열기','打开客服','Open WhatsApp'));manual.href=channel.url;manual.dataset.msChannelOpen='true';manual.target='_blank';manual.rel='noopener noreferrer';foot.append(manual);}
 else foot.append(el('p','ms-channel-manual','微信：'+channel.id));
 foot.append(handoffNote);
 openDialog();
}
async function saveProduct(){
 if(saveBusy)return;const product=captureProduct(lang);if(!product){openList();return;}
 saveBusy=true;document.querySelectorAll('.ms-save-product').forEach(x=>x.disabled=true);
 let record;try{record=JSON.parse(document.querySelector('#catalog-current')?.textContent||'null');}catch{}
 if(!addIntent)addIntent=record?selectionIdentity(record.id,product.kind):editItem?.id||crypto.randomUUID();
 if(record){product.catalogRevision=record.revision;product.productId=record.id;if(product.kind!=='furong')product.title=record.locales[lang].title;product.sourcePath=product.kind==='furong'?'/?view=furong&lang='+lang:record.paths[lang];}
 try{
  const result=await mutate({type:'save',item:{...product,id:addIntent},...((editItem||state.items.find(x=>x.id===addIntent))?{expectedItemRevision:(editItem||state.items.find(x=>x.id===addIntent)).revision}:{})});
  if(editItem)clearWorking(editItem.id);editItem=null;editDirty=false;addIntent=null;const url=new URL(location.href);url.searchParams.delete('msEdit');history.replaceState(history.state,'',url);
  activeId=result.item.id;renderSavebars();openList(result.item.id);
  announce(result.duplicate?w('같은 선택이 이미 저장되어 있어요. 기존 항목을 보여 드립니다.','相同选择已保存，已为你打开原项目。','This selection is already saved. Showing the existing item.'):product.missing.length?w('추가 입력이 필요한 항목으로 저장했습니다.','已保存，未填齐的内容已标为“待补充”。','Saved. Missing details are clearly marked.'):w('저장했습니다. 계속 고르거나 목록에서 수정할 수 있어요.','已保存，可以继续选择或在清单中修改。','Saved. Continue choosing or edit it in your list.'));
 }catch(error){showError(error);}finally{saveBusy=false;document.querySelectorAll('.ms-save-product').forEach(x=>x.disabled=false);}
}
function renderSavebars(){
 const current=activeProduct();
 for(const legacy of document.querySelectorAll('#copyBtn,#dayCopy,#guideCopy,#vehicleCopy,#privateCopy,#comboCopy')){const label=w('선택을 저장하고 확인하기','保存选择并核对','Save and review selections');if(legacy.textContent!==label)legacy.textContent=label;}
 for(const bar of document.querySelectorAll('.ms-savebar')){const hidden=!current||!current.scope.contains(bar);if(bar.hidden!==hidden)bar.hidden=hidden;}
 if(!current)return;
 if(current.kind==='guide'){
  const dates=[...current.scope.querySelectorAll('.guide-date')],amount=current.scope.querySelector('#guideSummary .price');
  if(amount&&(dates.some(x=>!x.value||!x.checkValidity())||new Set(dates.map(x=>x.value)).size!==dates.length)&&amount.textContent!==labels.quote)amount.textContent=labels.quote;
  for(const input of dates.slice(1)){const remove=input.parentElement.querySelector('button'),label=w('날짜 삭제','删除日期','Remove date');if(remove&&remove.textContent!==label)remove.textContent=label;}
 }
 let bar=current.scope.querySelector('.ms-savebar');
 if(!bar){bar=el('section','ms-savebar');bar.dataset.msUi='';const host=current.kind==='furong'?current.scope.querySelector('form'):current.scope.querySelector('aside.summary,.online-summary')||current.scope;host.append(bar);}
 const signature=(editItem?'edit:'+editItem.id:'add')+':'+current.kind;if(bar.dataset.mode===signature)return;bar.dataset.mode=signature;bar.replaceChildren();bar.hidden=false;
 const words=el('div','ms-savebar-copy');words.append(el('b','',editItem?w('저장한 항목을 수정 중이에요','正在修改已保存的项目','Editing your saved item'):w('선택한 조건을 보관하세요','把刚选好的条件保存下来','Keep the choices you just made')),el('small','',editItem?w('저장하기 전에는 원래 선택이 바뀌지 않습니다.','保存修改前，原项目不会改变。','Your saved item stays unchanged until you save.'):w('날짜가 미정이어도 먼저 담아 둘 수 있어요.','日期未定也可以先存为待补充。','You can save first and fill missing details later.')));bar.append(words,button(editItem?labels.save:labels.add,saveProduct,'ms-save-product ms-primary'));
 if(current.kind==='furong')bar.append(button(w('9명 이상 차량·요금 문의','9人以上车辆安排及报价咨询','Ask about transport for 9+ guests'),()=>{openDialog();questionForm(null,{kind:'manual',title:w('부용진 9명 이상 · 별도 견적','芙蓉镇9人以上 · 单独询价','Furong 9+ guests · request quote'),details:w('부용진 9명 이상 차량 배정과 왕복 요금을 문의합니다. 희망 날짜, 인원, 출발 지역을 아래에 적어 주세요.','想咨询芙蓉镇9人以上车辆安排及往返报价。请在下方补充希望日期、人数和出发区域。','Please confirm vehicle arrangements for 9+ guests and a Furong round-trip quote. Add dates, group size and departure area below.')});},'ms-secondary'));
 if(editItem)bar.append(button(labels.cancel,async()=>{const original=editItem;try{restoring=true;await restoreProduct(original);clearWorking(original.id);editItem=null;editDirty=false;addIntent=null;const u=new URL(location.href);u.searchParams.delete('msEdit');history.replaceState(history.state,'',u);renderSavebars();openList(original.id);announce(w('수정을 취소했습니다. 원래 선택을 유지합니다.','已取消修改，保留原选择。','Edit cancelled. Original choice retained.'));}catch(error){showError(error);}finally{restoring=false;}},'ms-secondary'));
 // Save is beside the existing summary/action, rather than hidden below the whole page.
 const anchor=current.scope.querySelector('.redesign-submit');
 if(anchor&&anchor.parentElement===bar.parentElement)anchor.before(bar);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(async()=>{scheduled=false;renderSavebars();const id=new URLSearchParams(location.search).get('msEdit');if(id&&restoredId!==id&&!document.querySelector('[data-catalog-form]')){const item=state.items.find(x=>x.id===id);if(!item){restoredId=id;announce(errors.MISSING,true);return;}if(activeProduct()||document.querySelector('[data-shop-category]')){restoredId=id;editItem=JSON.parse(JSON.stringify(item));let working;try{const saved=JSON.parse(sessionStorage.getItem(workingKey(id))||'null');if(saved?.expectedRevision===item.revision)working=saved.product;}catch{}restoring=true;const restored=await restoreProduct(working||item);restoring=false;if(!restored){editItem=null;announce(w('원래 상품을 열지 못했습니다. 목록에서 다시 수정해 주세요.','未能打开原产品，请从清单重新修改。','Could not open the original product. Retry editing from your list.'),true);return;}editDirty=!!working;renderSavebars();$('.ms-savebar:not([hidden])')?.scrollIntoView({block:'center'});announce(working?w('저장 전 수정 내용을 복원했습니다. 원래 선택은 그대로입니다.','已恢复尚未保存的修改，原选择仍保持不变。','Unsaved edits restored. Your saved item remains unchanged.'):w('원래 선택을 불러왔습니다. 수정 후 저장해 주세요.','已带出原选择，修改后请保存。','Original choices loaded. Save when you finish editing.'));}}});}
document.addEventListener('click',e=>{if(!e.target.closest('[data-ms-ui]')){schedule();if(editItem&&!restoring)requestAnimationFrame(persistWorking);}});document.addEventListener('change',e=>{if(!e.target.closest('[data-ms-ui]')){addIntent=null;schedule();if(editItem&&!restoring)requestAnimationFrame(persistWorking);}});
document.addEventListener('input',e=>{if(!e.target.closest('[data-ms-ui]')&&editItem&&!restoring)requestAnimationFrame(persistWorking);});
// Adapt only customer selection actions. No network, database or order interception.
document.addEventListener('click',event=>{
 const target=event.target.closest?.('button,a');if(!target||target.closest('[data-ms-ui]'))return;
 const link=target.closest('a[href]');
 const url=link?new URL(link.href,location.href):null;
 if(url?.origin===location.origin&&url.hash==='#my-trip-selections'){
  event.preventDefault();event.stopImmediatePropagation();openList();return;
 }
 const current=activeProduct();
 const saveControl=target.matches('#copyBtn,#dayCopy,#guideCopy,#vehicleCopy,#privateCopy,#comboCopy,#copy,#privateGoInquiry,.redesign-submit,.selection-checkout,.combo-apply,.shop-extra-form .shop-product-action');
 const localConsult=url?.origin===location.origin&&url.searchParams.get('view')==='consult';
 if(saveControl||localConsult){
  event.preventDefault();event.stopImmediatePropagation();
  if(current)saveProduct();else openList();
 }
},true);
document.addEventListener('submit',event=>{
 const current=activeProduct();
 // The package details step still advances to its existing review screen.
 if(!current||event.target.matches('.recommended-form')||!current.scope.contains(event.target))return;
 event.preventDefault();event.stopImmediatePropagation();saveProduct();
},true);
window.addEventListener('storage',event=>{if(event.key!==KEY)return;refreshState();if(dialog.open&&!questionEdit&&!reviewIds)renderList();if(dialog.open&&reviewIds){reviewIds=null;renderList();announce(w('다른 창에서 변경했습니다. 내용을 다시 확인해 주세요.','另一窗口有更新，请重新核对清单。','Another tab changed this list. Review the latest choices.'));}});
const observer=new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('[data-ms-ui]')))schedule();});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
updateEntry();schedule();
let pending;try{pending=activeDraft(sessionStorage,location.pathname,lang);}catch{}
if(pending&&!new URLSearchParams(location.search).has('msEdit')){inlineMemory.set(pending.key,pending.value);if(pending.value.kind==='custom')customForm(pending.value.baseItem);else questionForm(pending.value.baseItem,pending.value.initial);}
else if(new URLSearchParams(location.search).has('msOpen')||location.hash==='#my-trip-selections')openList();
