const VERSION='quran-mp3-shell-v3';
const BASE=new URL(self.registration.scope);
const SHELL=['','index.html','offline.html','memorize.html','readers.html','riwayat.html','mushafs.html','manifest.webmanifest','assets/css/style.css','assets/css/details.css','assets/css/memorize.css','assets/js/data.js','assets/js/app.js','assets/js/audio-core.js','assets/js/memorize.js','assets/js/directory.js'];
const appUrl=p=>new URL(p,BASE).href;
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(async cache=>{
 await Promise.allSettled(SHELL.map(p=>cache.add(appUrl(p))));
 await self.skipWaiting();
})));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('quran-mp3-shell-')&&k!==VERSION).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const u=new URL(req.url);
 if(u.origin!==self.location.origin||!u.pathname.startsWith(BASE.pathname))return;
 if(u.pathname.includes('/catalog/')||u.pathname.endsWith('/recordings.json'))return;
 const isNav=req.mode==='navigate';
 e.respondWith((async()=>{
   try{
     const res=await fetch(req);
     if(res.ok&&res.type==='basic'){const cache=await caches.open(VERSION);cache.put(req,res.clone()).catch(()=>{})}
     return res;
   }catch{
     const found=await caches.match(req);
     if(found)return found;
     if(isNav)return (await caches.match(appUrl('offline.html')))||Response.error();
     return Response.error();
   }
 })());
});
