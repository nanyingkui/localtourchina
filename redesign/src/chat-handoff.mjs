export const CUSTOMER_CHAT_URL='https://pf.kakao.com/_hvrmn/chat';
// Copy while this document has focus; navigate only after confirmed success.
export async function copyInquiryAndOpenChat(text,{navigate=url=>window.location.assign(url),write=value=>navigator.clipboard.writeText(value),timeoutMs=5000}={}){
 if(!String(text||'').trim())return {copied:false,opened:false};
 let timer;
 try{await Promise.race([write(text),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('clipboard_timeout')),timeoutMs);})]);}catch{return {copied:false,opened:false};}finally{clearTimeout(timer);}
 try{navigate(CUSTOMER_CHAT_URL);return {copied:true,opened:true};}catch{return {copied:true,opened:false};}
}
