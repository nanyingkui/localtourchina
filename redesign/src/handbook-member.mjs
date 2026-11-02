export const HANDBOOK_RETURN_KEY='ltc-handbook-return-v1';
export function cleanHandbookPath(value){
 if(typeof value!=='string'||value.length>1200||/[\\\r\n]/.test(value))return null;
 try{const u=new URL(value,'https://map.localtourchina.com');if(u.origin!=='https://map.localtourchina.com'||u.pathname!=='/travel'||!value.startsWith('/travel'))return null;const out=new URL('/travel',u.origin);for(const key of ['lang','route','point','step','sky','tenmile']){const v=u.searchParams.get(key);if(!v)continue;if(key==='lang'&&!['ko','zh'].includes(v)||['sky','tenmile'].includes(key)&&!['0','1'].includes(v)||key==='step'&&(!/^[1-9][0-9]?$/.test(v)||Number(v)>80)||!/^[-a-zA-Z0-9_]{1,100}$/.test(v))return null;out.searchParams.set(key,v)}return out.pathname+out.search;}catch{return null}
}
export function captureHandbookReturn({href,storage,replace}){
 const u=new URL(href);const candidate=cleanHandbookPath(u.searchParams.get('handbook'));
 if(u.searchParams.has('handbook')){u.searchParams.delete('handbook');replace(u.pathname+u.search+u.hash)}
 if(candidate){try{storage.setItem(HANDBOOK_RETURN_KEY,candidate)}catch{}return candidate}
 try{return cleanHandbookPath(storage.getItem(HANDBOOK_RETURN_KEY))}catch{return null}
}
