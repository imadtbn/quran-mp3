/* Shared external-audio controller for library and detail views.
 * Never probes third-party MP3s with fetch/HEAD: most audio hosts do not enable CORS.
 * The media element is the authoritative test of whether a URL can play.
 */
window.QuranAudio={
  url(reciter,surah){
    const n=Number(surah);
    if(!reciter||!/^https:\/\//i.test(reciter.base||'')||!Number.isInteger(n)||n<1||n>114)return null;
    if(Array.isArray(reciter.surahs)&&!reciter.surahs.includes(n))return null;
    return reciter.base.replace(/\/?$/,'/')+String(n).padStart(3,'0')+'.mp3';
  },
  attach(audio,handlers={}){
    let timer=null,playToken=0;
    const status=(key)=>{if(typeof handlers.status==='function')handlers.status(key)};
    const clear=()=>{if(timer){clearTimeout(timer);timer=null}};
    const failure=()=>{clear();status('error')};
    audio.addEventListener('loadstart',()=>{status('loading');clear();timer=setTimeout(()=>{if(audio.readyState<2&&audio.networkState!==HTMLMediaElement.NETWORK_EMPTY){audio.pause();failure()}},20000)});
    audio.addEventListener('waiting',()=>status('buffering'));
    audio.addEventListener('stalled',()=>status('buffering'));
    audio.addEventListener('canplay',()=>{clear();status('ready')});
    audio.addEventListener('playing',()=>{clear();status('playing')});
    audio.addEventListener('pause',()=>{if(!audio.ended)status('paused')});
    audio.addEventListener('error',failure);
    audio.addEventListener('abort',clear);
    audio.addEventListener('emptied',clear);
    return {
      load(reciter,n,{autoplay=false}={}){
        const src=this.url(reciter,n);
        ++playToken;clear();audio.pause();
        if(!src){audio.removeAttribute('src');audio.load();status('unavailable');return false}
        audio.src=src;audio.load();status('loading');
        if(autoplay)this.play();
        return true;
      },
      async play(){
        const token=++playToken;
        if(!audio.currentSrc&&!audio.src){status('unavailable');return false}
        try{await audio.play();return true}
        catch(err){if(token!==playToken)return false;clear();status(err?.name==='NotAllowedError'?'gesture':'error');return false}
      },
      retry(){if(!audio.src)return false;const pos=Number.isFinite(audio.currentTime)?audio.currentTime:0;audio.load();audio.addEventListener('loadedmetadata',()=>{if(pos>0&&Number.isFinite(audio.duration))audio.currentTime=Math.min(pos,Math.max(0,audio.duration-1))},{once:true});return this.play()},
      url(reciter,n){return window.QuranAudio.url(reciter,n)},
      destroy(){clear();++playToken}
    };
  }
};
