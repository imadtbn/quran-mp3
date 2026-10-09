const CACHE='quran-mp3-shell-v1';
const APP_SHELL=['./','./index.html','./offline.html','./manifest.webmanifest','./assets/css/style.css','./assets/js/data.js','./assets/js/app.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;let url=new URL(event.request.url);if(url.origin!==location.origin)return;event.respondWith(fetch(event.request).then(response=>{let copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(response=>response||caches.match('./offline.html'))))});
