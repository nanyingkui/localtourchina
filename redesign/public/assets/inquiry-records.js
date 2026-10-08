(()=>{
  const cfg=window.LOCALTOUR_SUPABASE;if(!cfg)return;
  const lang=document.documentElement.lang==='en'?'en':document.documentElement.lang==='zh-CN'?'zh':'ko';
  const en=lang==='en',zh=lang==='zh';
  const text=en?{
    title:'Save this inquiry',desc:'Get a private link to check your inquiry, quote and itinerary later.',button:'Save inquiry & get link',modal:'Save your inquiry',help:'Enter only the contact details we need to reply. Do not enter passport or payment information.',name:'Name',contact:'KakaoTalk ID, WhatsApp, email or phone',cancel:'Cancel',submit:'Save inquiry',saving:'Saving…',missing:'Please enter your name and contact details.',empty:'Complete the inquiry first.',done:'Inquiry saved',copy:'Copy private link',copied:'Link copied',fail:'Could not save yet. Please try again or contact us on KakaoTalk.'
  }:zh?{
    title:'保存咨询记录',desc:'保存后可通过专属链接随时查看处理进度、报价和行程。',button:'保存咨询并获取专属链接',modal:'保存本次咨询',help:'请仅填写便于我们回复的联系方式，不要填写护照、银行卡等敏感信息。',name:'姓名',contact:'微信、KakaoTalk、WhatsApp、邮箱或手机号',cancel:'取消',submit:'保存咨询',saving:'正在保存…',missing:'请填写姓名和联系方式。',empty:'请先填写咨询内容。',done:'咨询已保存',copy:'复制专属链接',copied:'链接已复制',fail:'暂时无法保存，请稍后重试或通过微信/KakaoTalk联系我们。'
  }:{
    title:'문의 기록 저장',desc:'나중에 문의 상태, 견적과 일정표를 확인할 수 있는 전용 링크를 받으세요.',button:'문의 저장하고 조회 링크 받기',modal:'문의 기록 저장',help:'답변에 필요한 연락처만 입력해 주세요. 여권·결제 정보는 입력하지 않습니다.',name:'이름',contact:'KakaoTalk ID, 이메일 또는 전화번호',cancel:'취소',submit:'문의 저장',saving:'저장 중…',missing:'이름과 연락처를 입력해 주세요.',empty:'먼저 문의 내용을 완성해 주세요.',done:'문의가 저장되었습니다',copy:'전용 링크 복사',copied:'링크가 복사되었습니다',fail:'지금 저장하지 못했습니다. 다시 시도하거나 KakaoTalk으로 문의해 주세요.'
  };
  const q=s=>document.querySelector(s), service=document.body.dataset.initialService||document.body.dataset.service||'unknown';
  function inquiry(){
    if(en)return q('#message')?.value.trim()||'';
    const map={ticket:'#inquiry',daytour:'#dayInquiry',guide:'#guideInquiry',vehicle:'#vehicleInquiry',private:'#privateInquiry',combo:'#comboInquiry'};
    return q(map[service]||'#comboInquiry')?.value.trim()||'';
  }
  if(!en&&['home','company','onlineguide'].includes(service))return;
  const host=en?q('#inquiry'):q(`#service-${service} .summary`);if(!host)return;
  const box=document.createElement('div');box.className='record-box';box.innerHTML=`<h3>${text.title}</h3><p>${text.desc}</p><button class="record-save" type="button">${text.button}</button>`;host.append(box);
  const dialog=document.createElement('dialog');dialog.className='record-dialog';dialog.innerHTML=`<form class="record-dialog-inner"><button class="record-close" type="button" aria-label="${text.cancel}">×</button><h2>${text.modal}</h2><p>${text.help}</p><label>${text.name}<input name="customer_name" autocomplete="name" maxlength="100" required></label><label>${text.contact}<input name="contact" autocomplete="email" maxlength="200" required></label><label class="record-honeypot">Website<input name="website" tabindex="-1" autocomplete="off"></label><p class="record-error" hidden></p><div class="record-dialog-actions"><button class="record-cancel" type="button">${text.cancel}</button><button class="record-submit" type="submit">${text.submit}</button></div></form>`;document.body.append(dialog);
  const form=dialog.querySelector('form'),name=form.elements.customer_name,contact=form.elements.contact,error=dialog.querySelector('.record-error'),submit=dialog.querySelector('.record-submit');
  if(en){name.value=q('#name')?.value||'';contact.value=q('#contact')?.value||''}
  const closeDialog=()=>dialog.close();dialog.querySelector('.record-cancel').addEventListener('click',closeDialog);dialog.querySelector('.record-close').addEventListener('click',closeDialog);dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
  box.querySelector('button').addEventListener('click',()=>{if(inquiry().length<5){alert(text.empty);return}if(en){name.value=q('#name')?.value||name.value;contact.value=q('#contact')?.value||contact.value}error.hidden=true;dialog.showModal()});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(form.elements.website.value)return;
    if(!name.value.trim()||!contact.value.trim()){error.textContent=text.missing;error.hidden=false;return}
    submit.disabled=true;submit.textContent=text.saving;error.hidden=true;
    try{
      const res=await fetch(`${cfg.url}/rest/v1/rpc/create_public_inquiry`,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify({p_language:lang,p_service:service,p_customer_name:name.value.trim(),p_contact:contact.value.trim(),p_inquiry_text:inquiry()})});
      if(!res.ok)throw new Error(await res.text());const rows=await res.json(),row=Array.isArray(rows)?rows[0]:rows;if(!row?.access_token)throw new Error('No token');
      const statusPath=en?'en/inquiry-status.html':zh?'inquiry-status.html?lang=zh&':'inquiry-status.html?',url=`https://localtourchina.com/${statusPath}token=${encodeURIComponent(row.access_token)}`;
      form.innerHTML=`<div class="record-result"><strong>${text.done}</strong><span>${row.reference}</span><a href="${url}">${url}</a><button type="button" class="record-submit" data-copy-link style="width:100%;margin-top:12px">${text.copy}</button></div>`;
      form.querySelector('[data-copy-link]').addEventListener('click',async ev=>{await navigator.clipboard.writeText(url);ev.currentTarget.textContent=text.copied});
      if(typeof gtag==='function')gtag('event','inquiry_saved',{language:lang,service});
    }catch(err){console.error(err);error.textContent=text.fail;error.hidden=false;submit.disabled=false;submit.textContent=text.submit}
  });
})();
