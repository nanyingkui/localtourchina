(()=>{
  const cfg=window.LOCALTOUR_SUPABASE;if(!cfg)return;
  const en=document.documentElement.lang==='en';
  const text=en?{
    title:'Save this inquiry',desc:'Get a private link to check your inquiry, quote and itinerary later.',button:'Save inquiry & get link',modal:'Save your inquiry',help:'Enter only the contact details we need to reply. Do not enter passport or payment information.',name:'Name',contact:'KakaoTalk ID, WhatsApp, email or phone',cancel:'Cancel',submit:'Save inquiry',saving:'Saving…',missing:'Please enter your name and contact details.',empty:'Complete the inquiry first.',done:'Inquiry saved',copy:'Copy private link',copied:'Link copied',fail:'Could not save yet. Please try again or contact us on KakaoTalk.'
  }:{
    title:'문의 기록 저장',desc:'나중에 문의 상태, 견적과 일정표를 확인할 수 있는 전용 링크를 받으세요.',button:'문의 저장하고 조회 링크 받기',modal:'문의 기록 저장',help:'답변에 필요한 연락처만 입력해 주세요. 여권·결제 정보는 입력하지 않습니다.',name:'이름',contact:'KakaoTalk ID, 이메일 또는 전화번호',cancel:'취소',submit:'문의 저장',saving:'저장 중…',missing:'이름과 연락처를 입력해 주세요.',empty:'먼저 문의 내용을 완성해 주세요.',done:'문의가 저장되었습니다',copy:'전용 링크 복사',copied:'링크가 복사되었습니다',fail:'지금 저장하지 못했습니다. 다시 시도하거나 KakaoTalk으로 문의해 주세요.'
  };
  const q=s=>document.querySelector(s), service=document.body.dataset.initialService||document.body.dataset.service||'unknown';
  function inquiry(){
    if(en)return q('#message')?.value.trim()||'';
    const map={ticket:'#inquiry',daytour:'#dayInquiry',guide:'#guideInquiry',vehicle:'#vehicleInquiry',private:'#privateInquiry',combo:'#comboInquiry'};
    return q(map[service]||'#comboInquiry')?.value.trim()||'';
  }
  if(!en&&['home','company'].includes(service))return;
  const host=en?q('#inquiry'):q(`#service-${service} .summary`);if(!host)return;
  const box=document.createElement('div');box.className='record-box';box.innerHTML=`<h3>${text.title}</h3><p>${text.desc}</p><button class="record-save" type="button">${text.button}</button>`;host.append(box);
  const dialog=document.createElement('dialog');dialog.className='record-dialog';dialog.innerHTML=`<form class="record-dialog-inner" method="dialog"><h2>${text.modal}</h2><p>${text.help}</p><label>${text.name}<input name="customer_name" autocomplete="name" maxlength="100" required></label><label>${text.contact}<input name="contact" autocomplete="email" maxlength="200" required></label><label class="record-honeypot">Website<input name="website" tabindex="-1" autocomplete="off"></label><p class="record-error" hidden></p><div class="record-dialog-actions"><button class="record-cancel" value="cancel">${text.cancel}</button><button class="record-submit" value="save">${text.submit}</button></div></form>`;document.body.append(dialog);
  const form=dialog.querySelector('form'),name=form.elements.customer_name,contact=form.elements.contact,error=dialog.querySelector('.record-error'),submit=dialog.querySelector('.record-submit');
  if(en){name.value=q('#name')?.value||'';contact.value=q('#contact')?.value||''}
  box.querySelector('button').addEventListener('click',()=>{if(inquiry().length<5){alert(text.empty);return}if(en){name.value=q('#name')?.value||name.value;contact.value=q('#contact')?.value||contact.value}error.hidden=true;dialog.showModal()});
  form.addEventListener('submit',async e=>{
    if(e.submitter?.value!=='save')return;
    e.preventDefault();if(form.elements.website.value)return;
    if(!name.value.trim()||!contact.value.trim()){error.textContent=text.missing;error.hidden=false;return}
    submit.disabled=true;submit.textContent=text.saving;error.hidden=true;
    try{
      const res=await fetch(`${cfg.url}/rest/v1/rpc/create_public_inquiry`,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify({p_language:en?'en':'ko',p_service:service,p_customer_name:name.value.trim(),p_contact:contact.value.trim(),p_inquiry_text:inquiry()})});
      if(!res.ok)throw new Error(await res.text());const rows=await res.json(),row=Array.isArray(rows)?rows[0]:rows;if(!row?.access_token)throw new Error('No token');
      const statusPath=en?'en/inquiry-status.html':'inquiry-status.html',url=`https://localtourchina.com/${statusPath}?token=${encodeURIComponent(row.access_token)}`;
      form.innerHTML=`<div class="record-result"><strong>${text.done}</strong><span>${row.reference}</span><a href="${url}">${url}</a><button type="button" class="record-submit" data-copy-link style="width:100%;margin-top:12px">${text.copy}</button></div>`;
      form.querySelector('[data-copy-link]').addEventListener('click',async ev=>{await navigator.clipboard.writeText(url);ev.currentTarget.textContent=text.copied});
      if(typeof gtag==='function')gtag('event','inquiry_saved',{language:en?'en':'ko',service});
    }catch(err){console.error(err);error.textContent=text.fail;error.hidden=false;submit.disabled=false;submit.textContent=text.submit}
  });
})();
