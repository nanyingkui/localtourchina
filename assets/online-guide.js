(()=>{
  if(document.body.dataset.initialService!=='onlineguide')return;
  const cfg=window.LOCALTOUR_SUPABASE, form=document.getElementById('onlineGuideForm');
  if(!cfg||!form)return;
  const q=id=>document.getElementById(id), status=q('onlineStatus'), submit=q('onlineSubmit');
  const start=q('onlineStart'),end=q('onlineEnd'),now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());start.min=end.min=now.toISOString().slice(0,10);
  let token='',reference='';const storageKey='localtour-online-guide-order-v1';
  const setStatus=(node,message,error=false)=>{node.textContent=message;node.style.color=error?'#b12a2a':'#17664b'};
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(end.value<start.value){setStatus(status,'여행 종료일은 시작일보다 빠를 수 없습니다.',true);end.focus();return}
    const days=Math.round((new Date(end.value)-new Date(start.value))/86400000)+1;if(days>7){setStatus(status,'기본 상품은 최대 7일까지 이용할 수 있습니다. 8일 이상은 카카오톡으로 추가 견적을 요청해 주세요.',true);end.focus();return}
    const helps=[...document.querySelectorAll('[name="onlineHelp"]:checked')].map(x=>x.value);
    const text=['[로투차 온라인 안심지원 신청]',`여행 기간: ${start.value} ~ ${end.value} (${days}일)`,`여행지: ${q('onlineDestination').value}`,`인원: ${q('onlinePeople').value}명`,`호텔·항공·일정: ${q('onlineHotel').value.trim()||'미정'}`,`필요한 도움: ${helps.join(' · ')||'전체 안내 필요'}`,'','상품: 한 팀 · 한 번의 여행 · 최대 7일 · 50,000원','여행 중 상담시간: 중국시간 08:00–20:00','이용 규칙 동의: v2026.10.02'].join('\n');
    submit.disabled=true;submit.textContent='저장 중…';setStatus(status,'');
    try{
      const res=await fetch(`${cfg.url}/rest/v1/rpc/create_public_inquiry`,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify({p_language:'ko',p_service:'online-guide',p_customer_name:q('onlineName').value.trim(),p_contact:q('onlineContact').value.trim(),p_inquiry_text:text})});
      if(!res.ok)throw new Error(await res.text());const rows=await res.json(),row=Array.isArray(rows)?rows[0]:rows;if(!row?.access_token)throw new Error('No access token');
      token=row.access_token;reference=row.reference;localStorage.setItem(storageKey,JSON.stringify({token,reference,uploaded:false}));showPending(false);
      if(typeof gtag==='function')gtag('event','online_guide_application',{language:'ko',service:'onlineguide'});
    }catch(error){console.error(error);setStatus(status,'신청서를 저장하지 못했습니다. 잠시 후 다시 시도하거나 카카오톡 채널로 문의해 주세요.',true);submit.disabled=false;submit.textContent='신청서 저장하고 입금 단계로'}
  });
  q('onlineReceiptUpload').addEventListener('click',async()=>{
    const file=q('onlineReceiptFile').files[0],uploadStatus=q('onlineUploadStatus'),button=q('onlineReceiptUpload');
    if(!token){setStatus(uploadStatus,'먼저 신청서를 저장해 주세요.',true);return}
    if(!file){setStatus(uploadStatus,'이체 화면 이미지를 선택해 주세요.',true);return}
    if(file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){setStatus(uploadStatus,'JPG·PNG·WEBP 이미지(최대 5MB)만 올릴 수 있습니다.',true);return}
    button.disabled=true;button.textContent='업로드 중…';
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type],path=`${token}/${Date.now()}.${ext}`;
    try{
      const res=await fetch(`${cfg.url}/storage/v1/object/online-guide-receipts/${path}`,{method:'POST',headers:{apikey:cfg.key,Authorization:`Bearer ${cfg.key}`,'Content-Type':file.type,'x-upsert':'false'},body:file});
      if(!res.ok)throw new Error(await res.text());setStatus(uploadStatus,`증빙이 접수되었습니다 · ${reference}`);localStorage.setItem(storageKey,JSON.stringify({token,reference,uploaded:true}));q('onlineKakao').hidden=false;q('onlineKakao').scrollIntoView({behavior:'smooth',block:'center'});button.textContent='업로드 완료';
      if(typeof gtag==='function')gtag('event','online_guide_receipt_uploaded',{language:'ko',service:'onlineguide'});
    }catch(error){console.error(error);setStatus(uploadStatus,'현재 업로드할 수 없습니다. 카카오톡 채널로 신청번호와 이체 화면을 보내 주세요.',true);button.disabled=false;button.textContent='다시 업로드'}
  });
  function showPending(restored=true){q('onlineReference').textContent=`신청번호 ${reference}`;q('onlineStatusLink').href=`inquiry-status.html?token=${encodeURIComponent(token)}`;q('onlineResult').hidden=false;q('onlineReceipt').hidden=false;form.hidden=true;if(!restored)q('onlineReceipt').scrollIntoView({behavior:'smooth',block:'center'})}
  q('onlineStatusCopy').addEventListener('click',async event=>{const url=new URL(q('onlineStatusLink').getAttribute('href'),location.href).href;try{await navigator.clipboard.writeText(url);event.currentTarget.textContent='전용 링크를 복사했습니다'}catch{window.prompt('아래 전용 링크를 복사해 주세요.',url)}});
  q('onlineAccountCopy').addEventListener('click',async event=>{try{await navigator.clipboard.writeText('82820104226025');event.currentTarget.textContent='계좌번호를 복사했습니다'}catch{window.prompt('아래 계좌번호를 복사해 주세요.','82820104226025')}});
  q('onlineNewOrder').addEventListener('click',()=>{localStorage.removeItem(storageKey);location.reload()});
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.token&&saved?.reference){token=saved.token;reference=saved.reference;showPending();if(saved.uploaded){setStatus(q('onlineUploadStatus'),`증빙이 접수되었습니다 · ${reference}`);q('onlineKakao').hidden=false;q('onlineReceiptUpload').disabled=true;q('onlineReceiptUpload').textContent='업로드 완료'}}}catch{}
})();
