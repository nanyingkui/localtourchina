(()=>{
  if(document.body.dataset.initialService!=='onlineguide')return;
  const zh=document.documentElement.lang==='zh-CN';
  const cfg=window.LOCALTOUR_SUPABASE, form=document.getElementById('onlineGuideForm');
  if(!cfg||!form)return;
  const q=id=>document.getElementById(id), status=q('onlineStatus'), submit=q('onlineSubmit');
  const start=q('onlineStart'),end=q('onlineEnd'),now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());start.min=end.min=now.toISOString().slice(0,10);
  let token='',reference='';const storageKey='localtour-online-guide-order-v1';
  const setStatus=(node,message,error=false)=>{node.textContent=message;node.style.color=error?'#b12a2a':'#17664b'};
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(end.value<start.value){setStatus(status,zh?'旅行结束日期不能早于开始日期。':'여행 종료일은 시작일보다 빠를 수 없습니다.',true);end.focus();return}
    const days=Math.round((new Date(end.value)-new Date(start.value))/86400000)+1;if(days>7){setStatus(status,zh?'基础产品最多支持7天；8天及以上请通过微信或KakaoTalk咨询补充报价。':'기본 상품은 최대 7일까지 이용할 수 있습니다. 8일 이상은 카카오톡으로 추가 견적을 요청해 주세요.',true);end.focus();return}
    const helps=[...document.querySelectorAll('[name="onlineHelp"]:checked')].map(x=>x.value);
    const text=zh?['[罗途查在线旅行支持申请]',`旅行日期：${start.value} 至 ${end.value}（${days}天）`,`旅行目的地：${q('onlineDestination').value}`,`总人数：${q('onlinePeople').value}人`,`酒店、航班和现有行程：${q('onlineHotel').value.trim()||'待定'}`,`需要的帮助：${helps.join(' · ')||'需要综合协助'}`,'','产品：一个团队 · 一次旅行 · 最长7天 · 50,000韩元','咨询时间：中国时间08:00–20:00','已同意服务规则：v2026.10.02'].join('\n'):['[로투차 온라인 안심지원 신청]',`여행 기간: ${start.value} ~ ${end.value} (${days}일)`,`여행지: ${q('onlineDestination').value}`,`인원: ${q('onlinePeople').value}명`,`호텔·항공·일정: ${q('onlineHotel').value.trim()||'미정'}`,`필요한 도움: ${helps.join(' · ')||'전체 안내 필요'}`,'','상품: 한 팀 · 한 번의 여행 · 최대 7일 · 50,000원','여행 중 상담시간: 중국시간 08:00–20:00','이용 규칙 동의: v2026.10.02'].join('\n');
    submit.disabled=true;submit.textContent=zh?'正在保存…':'저장 중…';setStatus(status,'');
    try{
      const res=await fetch(`${cfg.url}/rest/v1/rpc/create_public_inquiry`,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify({p_language:zh?'zh':'ko',p_service:'online-guide',p_customer_name:q('onlineName').value.trim(),p_contact:q('onlineContact').value.trim(),p_inquiry_text:text})});
      if(!res.ok)throw new Error(await res.text());const rows=await res.json(),row=Array.isArray(rows)?rows[0]:rows;if(!row?.access_token)throw new Error('No access token');
      token=row.access_token;reference=row.reference;localStorage.setItem(storageKey,JSON.stringify({token,reference,uploaded:false}));showPending(false);
      if(typeof gtag==='function')gtag('event','online_guide_application',{language:zh?'zh':'ko',service:'onlineguide'});
    }catch(error){console.error(error);setStatus(status,zh?'申请保存失败，请稍后重试，或通过微信、KakaoTalk联系我们。':'신청서를 저장하지 못했습니다. 잠시 후 다시 시도하거나 카카오톡 채널로 문의해 주세요.',true);submit.disabled=false;submit.textContent=zh?'保存申请并进入付款步骤':'신청서 저장하고 입금 단계로'}
  });
  q('onlineReceiptUpload').addEventListener('click',async()=>{
    const file=q('onlineReceiptFile').files[0],uploadStatus=q('onlineUploadStatus'),button=q('onlineReceiptUpload');
    if(!token){setStatus(uploadStatus,zh?'请先保存申请。':'먼저 신청서를 저장해 주세요.',true);return}
    if(!file){setStatus(uploadStatus,zh?'请选择转账截图。':'이체 화면 이미지를 선택해 주세요.',true);return}
    if(file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){setStatus(uploadStatus,zh?'仅支持JPG、PNG或WEBP图片，最大5MB。':'JPG·PNG·WEBP 이미지(최대 5MB)만 올릴 수 있습니다.',true);return}
    button.disabled=true;button.textContent=zh?'正在上传…':'업로드 중…';
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type],path=`${token}/${Date.now()}.${ext}`;
    try{
      const res=await fetch(`${cfg.url}/storage/v1/object/online-guide-receipts/${path}`,{method:'POST',headers:{apikey:cfg.key,Authorization:`Bearer ${cfg.key}`,'Content-Type':file.type,'x-upsert':'false'},body:file});
      if(!res.ok)throw new Error(await res.text());setStatus(uploadStatus,`${zh?'付款凭证已提交':'증빙이 접수되었습니다'} · ${reference}`);localStorage.setItem(storageKey,JSON.stringify({token,reference,uploaded:true}));q('onlineKakao').hidden=false;q('onlineKakao').scrollIntoView({behavior:'smooth',block:'center'});button.textContent=zh?'上传完成':'업로드 완료';
      if(typeof gtag==='function')gtag('event','online_guide_receipt_uploaded',{language:zh?'zh':'ko',service:'onlineguide'});
    }catch(error){console.error(error);setStatus(uploadStatus,zh?'目前无法上传，请通过微信或KakaoTalk发送申请编号和转账截图。':'현재 업로드할 수 없습니다. 카카오톡 채널로 신청번호와 이체 화면을 보내 주세요.',true);button.disabled=false;button.textContent=zh?'重新上传':'다시 업로드'}
  });
  function showPending(restored=true){q('onlineReference').textContent=`${zh?'申请编号':'신청번호'} ${reference}`;q('onlineStatusLink').href=`${zh?'../inquiry-status.html?lang=zh&':'inquiry-status.html?'}token=${encodeURIComponent(token)}`;q('onlineResult').hidden=false;q('onlineReceipt').hidden=false;form.hidden=true;if(!restored)q('onlineReceipt').scrollIntoView({behavior:'smooth',block:'center'})}
  q('onlineStatusCopy').addEventListener('click',async event=>{const url=new URL(q('onlineStatusLink').getAttribute('href'),location.href).href;try{await navigator.clipboard.writeText(url);event.currentTarget.textContent=zh?'专属链接已复制':'전용 링크를 복사했습니다'}catch{window.prompt(zh?'请复制下方专属链接。':'아래 전용 링크를 복사해 주세요.',url)}});
  q('onlineAccountCopy').addEventListener('click',async event=>{try{await navigator.clipboard.writeText('82820104226025');event.currentTarget.textContent=zh?'账号已复制':'계좌번호를 복사했습니다'}catch{window.prompt(zh?'请复制下方账号。':'아래 계좌번호를 복사해 주세요.','82820104226025')}});
  q('onlineNewOrder').addEventListener('click',()=>{localStorage.removeItem(storageKey);location.reload()});
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.token&&saved?.reference){token=saved.token;reference=saved.reference;showPending();if(saved.uploaded){setStatus(q('onlineUploadStatus'),`${zh?'付款凭证已提交':'증빙이 접수되었습니다'} · ${reference}`);q('onlineKakao').hidden=false;q('onlineReceiptUpload').disabled=true;q('onlineReceiptUpload').textContent=zh?'上传完成':'업로드 완료'}}}catch{}
})();
