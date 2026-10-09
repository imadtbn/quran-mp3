/* Single media-control implementation used by the library and detail pages.
   Trust HTMLMediaElement events, not cross-origin HEAD requests. */
(function(){
'use strict';
const timeoutMs=20000;
function audioUrl(reciter,n){
 n=Number(n);
 if(!reciter||!Number.isInteger(n)||n<1||n>114||
   !Array.isArray(reciter.surahs)||!reciter.surahs.includes(n))return null;
 try{
   const base=new URL(reciter.base);
   if(base.protocol!=='https:'||base.username||base.password)return null;
   if(!base.pathname.endsWith('/'))base.pathname+='/';
   return new URL(String(n).padStart(3,'0')+'.mp3',base).href;
 }catch{return null}
}
window.QuranAudio={
 url:audioUrl,
 attach(audio,handlers={}){
   let watchdog=null,revision=0,broken=false,loadFailed=false;
   const status=(v)=>{try{handlers.status?.(v)}catch(e){console.warn(e)}};
   const clear=()=>{clearTimeout(watchdog);watchdog=null};
   const arm=()=>{
     clear();
     const token=revision;
     watchdog=setTimeout(()=>{
       if(token===revision&&!audio.paused&&audio.readyState<3){
         broken=true;loadFailed=true;audio.pause();status('timeout');
       }
     },timeoutMs);
   };
   const handleError=()=>{clear();broken=true;loadFailed=true;status('error')};
   audio.addEventListener('loadstart',()=>{if(audio.src){status('loading');arm()}});
   audio.addEventListener('waiting',()=>{status('buffering');if(!audio.paused)arm()});
   audio.addEventListener('stalled',()=>{status('buffering');if(!audio.paused)arm()});
   audio.addEventListener('loadedmetadata',()=>{clear();broken=false;status('ready')});
   audio.addEventListener('canplay',()=>{clear();broken=false;status('ready')});
   audio.addEventListener('playing',()=>{clear();broken=false;loadFailed=false;status('playing')});
   audio.addEventListener('pause',()=>{if(!audio.ended&&!broken)status('paused')});
   audio.addEventListener('error',handleError);
   audio.addEventListener('abort',clear);
   audio.addEventListener('emptied',clear);
   async function play(){
     const token=revision;
     if(!audio.src){status('unavailable');return false}
     try{await audio.play();if(token!==revision)return false;return true}
     catch(e){
       if(token!==revision)return false;
       clear();
       if(e?.name==='NotAllowedError')status('gesture');
       else if(e?.name!=='AbortError'){broken=true;loadFailed=true;status('error')}
       return false;
     }
   }
   return {
     url:audioUrl,
     load(reciter,n,{autoplay=false}={}){
       const source=audioUrl(reciter,n);
       revision++;clear();broken=false;loadFailed=false;audio.pause();
       if(!source){audio.removeAttribute('src');audio.load();status('unavailable');return false}
       audio.src=source;audio.load();
       if(autoplay)play();
       return true;
     },
     play,
     retry(){
       if(!audio.src)return false;
       revision++;clear();broken=false;loadFailed=false;
       const pos=Number.isFinite(audio.currentTime)?audio.currentTime:0;
       audio.load();
       if(pos>0)audio.addEventListener('loadedmetadata',()=>{
         if(Number.isFinite(audio.duration))audio.currentTime=Math.min(pos,Math.max(0,audio.duration-1));
       },{once:true});
       return play();
     },
     failed(){return loadFailed},
     destroy(){revision++;clear();audio.pause()}
   };
 }
};
})();