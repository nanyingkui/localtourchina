const CACHE='ltc-traveler-white-bfeacd45dd7d';
const SHELL=["/assets/contact-gate.js","/assets/home-20261013/mascot-clean.webp","/assets/visual-system.css","/assets/visual-system.js","/app/","/app/index.html","/app/app.css","/app/app.mjs","/app/manifest.webmanifest","/app/icons/icon-192.png","/app/icons/icon-512.png","/app/icons/apple-touch-icon.png","/assets/supabase-config.js","/assets/media/attractions/tianmen-cave-jpg-960.webp","/assets/notebook/bfeacd45dd7d/white-notebook.css","/assets/notebook/bfeacd45dd7d/sitewide.js","/assets/notebook/bfeacd45dd7d/fonts/Pretendard-Regular.woff2","/assets/notebook/bfeacd45dd7d/fonts/Pretendard-Bold.woff2","/assets/notebook/bfeacd45dd7d/fonts/NanumPenScript-Regular.ttf","/assets/notebook/bfeacd45dd7d/fonts/LongCang-Regular.ttf","/assets/notebook/bfeacd45dd7d/icons/orange-hat-32.png","/assets/notebook/bfeacd45dd7d/icons/orange-hat-48.png","/assets/notebook/bfeacd45dd7d/icons/orange-hat-180.png","/assets/notebook/bfeacd45dd7d/brand/rotucha-orange-hat-master.png"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));});
// Wait for old windows to close; never reload or replace an in-progress booking.
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ltc-traveler-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // NEVER intercept Auth, RPCs, customer data, posts, other sites or admin pages.
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&['/app/','/app/index.html'].includes(url.pathname)){
   // Do not persist callback query strings, codes or auth errors in Cache Storage.
   event.respondWith(fetch(request).catch(()=>caches.match('/app/')));return;
 }
 if(url.search||!SHELL.includes(url.pathname))return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
