const PREFIX='ltc-ms-inline-draft-v1:';
export const ACTIVE_DRAFT=PREFIX+'active';
export const draftKey=(kind,id='new')=>PREFIX+kind+':'+id;
export function readDraft(storage,key){
 const raw=storage.getItem(key);if(!raw)return null;const value=JSON.parse(raw);
 if(value.version!==1||!['custom','question','manual'].includes(value.kind)||typeof value.id!=='string'||!value.values||typeof value.values!=='object'||typeof value.path!=='string')throw Error('INVALID_DRAFT');
 return value;
}
export function writeDraft(storage,key,value){
 const raw=JSON.stringify(value);storage.setItem(key,raw);if(storage.getItem(key)!==raw)throw Error('DRAFT_STORAGE');
 storage.setItem(ACTIVE_DRAFT,key);if(storage.getItem(ACTIVE_DRAFT)!==key)throw Error('DRAFT_STORAGE');
}
export function clearDraft(storage,key){storage.removeItem(key);if(storage.getItem(ACTIVE_DRAFT)===key)storage.removeItem(ACTIVE_DRAFT);}
export function activeDraft(storage,path,lang){const key=storage.getItem(ACTIVE_DRAFT);if(!key?.startsWith(PREFIX))return null;const value=readDraft(storage,key);return value?.open&&value.path===path&&value.lang===lang?{key,value}:null;}
