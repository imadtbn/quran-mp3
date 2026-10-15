const VERSION='quran-mp3-shell-v44';
const BASE=new URL(self.registration.scope);
const SHELL=['stories/audio.html','stories/audio/adam.html','stories/audio/nuh.html','stories/audio/ibrahim.html','stories/audio/yusuf.html','stories/audio/musa.html','stories/audio/isa.html','assets/data/stories-audio.json','assets/css/stories-audio.css','assets/js/stories-player.js','stories.html','stories/yusuf.html','stories/ashab-al-kahf.html','stories/maryam.html','stories/dhul-qarnayn.html','stories/musa.html','stories/qarun.html','assets/css/stories.css','assets/js/stories.js','dua-hifz.html','assets/css/dua-hifz.css?v=20261013','assets/js/dua-hifz.js?v=20261013','assets/css/quran.css?v=20261013-actions','assets/js/quran-actions.js?v=20261013-actions','assets/css/ruqyah.css?v=20261013-actions','assets/js/ruqyah.js?v=20261013-actions','assets/js/site-shell.js?v=20261013-nav-fix','assets/css/site-navigation.css?v=20261013-nav-fix','assets/js/ruqyah.js?v=20261013-nav-fix','assets/js/site-shell.js?v=20261013-unified-nav','assets/css/site-navigation.css?v=20261013-unified-nav','assets/js/site-shell.js?v=20261013-nav','assets/css/site-shell.css?v=20261013-nav','','index.html','assets/js/home-share.js','offline.html','memorize.html','adhkar.html','ruqyah.html','assets/css/ruqyah.css','assets/js/ruqyah.js','assets/data/ruqyah.json','prayer-times.html','assets/css/prayer-times.css','assets/css/prayer-times.css?v=20261013-icons','assets/js/prayer-times.js','assets/js/prayer-times.js?v=20261013-icons','assets/js/prayer-context.js','assets/css/prayer-context.css','assets/js/prayer-adhan.js','assets/js/quran-adhan-bridge.js','assets/js/prayer-push.js?v=20261011-pilot2','assets/data/prayer-push-config.json','assets/css/adhkar.css','assets/css/adhkar.css?v=20261013-actions','assets/js/adhkar.js','assets/js/adhkar.js?v=20261013-actions','assets/data/adhkar.json','assets/img/adhkar-morning.svg','assets/img/adhkar-sleep.svg','assets/img/adhkar-prayer.svg','assets/img/adhkar-duaa.svg','adhkar-sleep.html','adhkar-prayer.html','adhkar-duaa.html','assets/data/adhkar-categories.json','assets/js/adhkar-categories.js','assets/js/adhkar-categories.js?v=20261013-sleep-actions','assets/js/adhkar-search.js','readers.html','riwayat.html','mushafs.html','manifest.webmanifest','assets/icons/quran-icon.svg','assets/css/style.css','assets/css/details.css','assets/css/memorize.css','assets/js/data.js','assets/js/app.js','assets/js/audio-core.js','assets/js/ads.js','assets/js/memorize.js','assets/js/directory.js','assets/js/directory.js?v=20261011-portraits','assets/css/readers.css?v=20261011-portraits','assets/data/reciter-portraits.json','quran.html','assets/css/quran.css','assets/js/quran.js','assets/js/quran-audio.js','assets/js/quran-offline.js','assets/js/quran-sync.js','assets/data/quran/timings.json'];
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
 if(req.destination==='audio'||req.headers.has('range'))return;
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

self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL('prayer-times.html',BASE).href;const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});const match=clientsList.find(c=>c.url.startsWith(BASE.href));if(match){await match.focus();if('navigate' in match&& !match.url.includes('prayer-times.html'))await match.navigate(url)}else await self.clients.openWindow(url)})())});

self.addEventListener('push',event=>{let data={};try{data=event.data?.json()||{}}catch{};event.waitUntil(self.registration.showNotification(data.title||'تذكير الصلاة',{body:data.body||'حان وقت الصلاة',icon:appUrl('assets/icons/quran.png'),tag:data.tag||'prayer-push',data:{url:appUrl('prayer-times.html')}}))});
