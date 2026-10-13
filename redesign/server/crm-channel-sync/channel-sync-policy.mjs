export const STATES=['opened','queued','snoozed','closed','initial','missed'];
export function publicMessages(chatId,messages){
 if(!Array.isArray(messages))throw Error('invalid_messages');
 return messages.filter(m=>m.chatType==='userChat'&&m.chatId===chatId&&!m.private&&!m.isPrivate&&['user','manager','bot','account'].includes(m.personType)).map(m=>{
  if(!m.id||!Number.isFinite(Date.parse(m.createdAt)))throw Error('invalid_message');
  return m;
 });
}
export function nextCursor(page){
 if(typeof page.hasNext!=='boolean')throw Error('invalid_pagination');
 if(!page.hasNext)return null;
 if(typeof page.nextCursor!=='string'||!page.nextCursor)throw Error('missing_cursor');
 return page.nextCursor;
}
