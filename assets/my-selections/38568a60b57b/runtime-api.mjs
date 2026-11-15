const cloud='https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/ltc-runtime';
export const runtimeURL=path=>(typeof location==='undefined'||(['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('runtime')!=='cloud')?'':cloud)+path;
export const runtimeFetch=(path,options={})=>fetch(runtimeURL(path),{...options,cache:'no-store'});
let catalogRequest;
export function loadCatalog(){return catalogRequest||(catalogRequest=runtimeFetch('/customer-catalog.json',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('Product library unavailable');return r.json();}).catch(e=>{catalogRequest=null;throw e;}));}
