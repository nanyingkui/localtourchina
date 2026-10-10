// Shared click-to-load player. No YouTube iframe or player request before open().
const activePlayers=new WeakMap();
let playerCounter=0;
const languageCopy={ko:{close:'영상 닫기',fallback:'재생되지 않으면 YouTube에서 열기',ready:'YouTube 플레이어에서 재생을 눌러 주세요.',title:'여행 영상'},zh:{close:'关闭视频',fallback:'无法播放？在 YouTube 打开',ready:'请在 YouTube 播放器中点击播放。',title:'旅行视频'},en:{close:'Close video',fallback:'Trouble playing? Open on YouTube',ready:'Press Play in the YouTube player.',title:'Travel video'}};
export function videoEmbedUrl(id){if(!/^[A-Za-z0-9_-]{11}$/.test(id))throw new TypeError('Invalid YouTube video ID');return `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&playsinline=1&rel=0`;}
export const videoCategories=['all','routes','transport','local','prepare'];
export function matchesVideoCategory(video,category){const paths=video.servicePaths||[];if(category==='routes')return paths.some(p=>['tickets.html','day-tours.html'].includes(p));if(category==='transport')return paths.includes('vehicles.html');if(category==='local')return paths.some(p=>['local-guide.html','food-map.html'].includes(p));if(category==='prepare')return paths.some(p=>['travel-info.html','online-guide.html','multi-booking.html'].includes(p));return true;}
export function selectVideos(videos,{page='home',destination='zhangjiajie',attraction='',category='all'}={},limit=4){
 const eligible=videos.filter(v=>v.destination===destination&&(page==='home'?!(v.servicePaths||[]).every(p=>p==='reviews.html'):(v.servicePaths||[]).includes(page))&&matchesVideoCategory(v,category));
 if(page==='home'&&category==='all'){
  const selected=[],add=v=>{if(v&&!selected.includes(v)&&selected.length<limit)selected.push(v);};
  eligible.filter(v=>v.homepage).slice(0,2).forEach(add);
  for(const kind of ['transport','prepare','local'])add(eligible.find(v=>matchesVideoCategory(v,kind)&&!selected.includes(v)));
  eligible.forEach(add);return selected;
 }
 return eligible.map((v,index)=>({v,index,rank:attraction&&(v.attractions||[]).includes(attraction)?0:1})).sort((a,b)=>a.rank-b.rank||a.index-b.index).slice(0,limit).map(x=>x.v);
}
export function serviceVideoContext(page,doc,href){
 const chosen=page==='day-tours.html'?(doc.querySelector('input[name="dayProduct"]:checked')?.value||''):'';
 const active=page==='tickets.html'?(doc.querySelector('#service-ticket .config.active')?.id||''):'';
 const params=new URL(href,'https://localtourchina.com').searchParams,region=params.get('destination')||params.get('region')||'';
 const destination=chosen.startsWith('sanya')||['sanya','hainan'].includes(region)?'hainan':'zhangjiajie';
 const found=['tianmen','canyon','forest','furong','fenghuang','phoenix'].find(x=>chosen.includes(x)||active.includes(x))||'';
 return {page,destination,attraction:found==='phoenix'?'fenghuang':found};
}
export function createVideoPlayer(host,{lang='ko'}={}){
 const doc=host.ownerDocument,win=doc.defaultView,t=languageCopy[lang]||languageCopy.ko;let opener=null,videoId=null,disposed=false;
 host.hidden=true;if(!host.id)host.id=`ltc-video-player-${++playerCounter}`;
 function close({restoreFocus=true}={}){const focusTarget=opener;opener?.setAttribute('aria-expanded','false');host.querySelectorAll('iframe').forEach(frame=>frame.remove());host.replaceChildren();host.hidden=true;videoId=null;opener=null;if(activePlayers.get(doc)===api)activePlayers.delete(doc);if(restoreFocus&&focusTarget?.isConnected)focusTarget.focus();}
 function open(video,trigger){if(disposed)return;const src=videoEmbedUrl(video.id);if(videoId===video.id){host.querySelector('.video-player-close')?.focus();return;}activePlayers.get(doc)?.close({restoreFocus:false});close({restoreFocus:false});opener=trigger;opener?.setAttribute('aria-expanded','true');opener?.setAttribute('aria-controls',host.id);videoId=video.id;activePlayers.set(doc,api);
  const panel=doc.createElement('section');panel.className='video-player-panel';panel.setAttribute('role','region');panel.setAttribute('aria-label',video.title[lang]||video.title.ko||t.title);
  const toolbar=doc.createElement('div');toolbar.className='video-player-toolbar';const heading=doc.createElement('h3');heading.textContent=video.title[lang]||video.title.ko;const button=doc.createElement('button');button.type='button';button.className='video-player-close';button.textContent=t.close+' ×';button.addEventListener('click',()=>close());toolbar.append(heading,button);
  const frameBox=doc.createElement('div');frameBox.className='video-player-screen'+(video.format==='short'?' is-short':'');const iframe=doc.createElement('iframe');iframe.src=src;iframe.title=heading.textContent;iframe.width='960';iframe.height='540';iframe.allow='encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';frameBox.append(iframe);
  const actions=doc.createElement('div');actions.className='video-player-actions';const note=doc.createElement('p');note.textContent=t.ready;const fallback=doc.createElement('a');fallback.href=video.url;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent=t.fallback+' ↗';actions.append(note,fallback);panel.append(toolbar,frameBox,actions);host.append(panel);host.hidden=false;button.focus();
 }
 const escape=e=>{if(e.key==='Escape'&&!e.defaultPrevented&&activePlayers.get(doc)===api){e.preventDefault();close();}};
 const leave=()=>close({restoreFocus:false});doc.addEventListener('keydown',escape);win.addEventListener('pagehide',leave);win.addEventListener('popstate',leave);
 const api={open,close,dispose(){close({restoreFocus:false});disposed=true;doc.removeEventListener('keydown',escape);win.removeEventListener('pagehide',leave);win.removeEventListener('popstate',leave);},get currentId(){return videoId;}};return api;
}
