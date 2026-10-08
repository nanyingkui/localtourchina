import {validateDraft,inquiryText} from './consultation.mjs';
export class InquiryError extends Error{constructor(code){super(code);this.code=code;}}
export async function submitInquiry(draft,language,config,fetcher=fetch){
 const issues=validateDraft(draft);if(Object.keys(issues).length){const error=new InquiryError('validation');error.errors=issues;throw error;}
 if(!config?.url?.startsWith('https://')||!config.key)throw new InquiryError('configuration');
 if(draft.contact.trim().length<2)throw new InquiryError('contact');
 const text=inquiryText(draft,'',language,true);if([...text].length>12000)throw new InquiryError('too-long');
 const payload={p_language:language,p_service:draft.services.includes('private')?'private':draft.services.length>1?'combo':(draft.services[0]==='onlineguide'?'online-guide':draft.services[0]),p_customer_name:draft.nickname.trim()||(language==='zh'?'未提供姓名':language==='en'?'Name not provided':'이름 미입력'),p_contact:draft.contact.trim(),p_inquiry_text:text};
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);let response;
 try{response=await fetcher(config.url+'/rest/v1/rpc/create_public_inquiry',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});}catch{throw new InquiryError('network');}finally{clearTimeout(timeout);}
 if(!response.ok)throw new InquiryError(response.status===429?'rate-limit':'server');
 let rows;try{rows=await response.json();}catch{throw new InquiryError('response');}const row=Array.isArray(rows)?rows[0]:rows;
 if(!row?.reference||!/^LTC-\d{8}-[A-Z0-9]+$/.test(row.reference)||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(row.access_token||''))throw new InquiryError('response');
 const prefix=language==='ko'?'':language+'/';
 return {...draft,reference:row.reference,status:'received',createdAt:new Date().toISOString(),productionSubmitted:true,statusUrl:'/'+prefix+'inquiry-status.html?token='+encodeURIComponent(row.access_token)};
}
