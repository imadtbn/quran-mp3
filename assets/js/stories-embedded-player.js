/* Licensed narration player: only authorized external audio files can play.
   Official publisher links remain visible and functional. */
(()=>{
'use strict';
const page=document.querySelector('.qsa-page');if(!page)return;
const root=page.dataset.qsaRoot||'../',checkpointKey='qmp3-narrator-checkpoint-v1';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const format=sec=>{if(!Number.isFinite(sec)||sec<0)return '0:00';const n=Math.floor(sec);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
const getCheckpoint=()=>{try{return JSON.parse(localStorage.getItem(checkpointKey)||'null')}catch{return null}};
const saveCheckpoint=v=>{try{localStorage.setItem(checkpointKey,JSON.stringify(v))}catch{}};
function verifiedTracks(data){
 const a=data?.authorization;
 if(data?.version!==1||!a||a.status!=='granted'||a.publicPlaybackAllowed!==true||
 typeof a.grantReference!=='string'||a.grantReference.trim().length<4||
 !Array.isArray(a.approvedOrigins)||!Array.isArray(data.tracks))return [];
 const domains=new Set(a.approvedOrigins.filter(s=>{try{const u=new URL(s);return u.protocol==='https:'&&u.origin===s}catch{return false}}));
 return data.tracks.filter(t=>{
   if(!t||t.permitted!==true||!/^118(69[5-9]|70[0-4])$/.test(String(t.episodeId))||
      (data.pilotOnly!==false&&String(t.episodeId)!==String(data.pilotEpisodeId||'118700'))||
      !['audio/mpeg','audio/mp4','audio/ogg'].includes(t.mediaType)||typeof t.title!=='string'||!t.title.trim())return false;
   try{const u=new URL(t.mediaUrl);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&domains.has(u.origin)}catch{return false}
 }).map(t=>({id:String(t.episodeId),title:t.title.trim(),src:t.mediaUrl,mime:t.mediaType}));
}
function setup(tracks){
 const byId=new Map(tracks.map(t=>[t.id,t]));
 const anchors=$$('a[data-open-episode]').filter(a=>byId.has(a.dataset.openEpisode));
 if(!anchors.length)return;
 const dock=document.createElement('section');
 dock.className='qsa-embedded-player';dock.id='qsaEmbeddedPlayer';dock.hidden=true;
 dock.setAttribute('aria-label','مشغل قصص الأنبياء المسموعة');
 dock.innerHTML=[
 '<div class="qsa-embedded-head"><div class="qsa-embedded-meta"><small>قصة مسموعة بصوت نبيل العوضي</small>',
 '<strong id="qsaEmbedTitle">اختر قصة للاستماع</strong><span id="qsaEmbedStatus" role="status" aria-live="polite"></span></div>',
 '<button type="button" id="qsaEmbedClose" aria-label="إغلاق المشغل">×</button></div>',
 '<div class="qsa-embedded-controls"><button type="button" id="qsaEmbedBack" aria-label="رجوع 15 ثانية">↶15</button>',
 '<button type="button" id="qsaEmbedPlay" aria-label="تشغيل أو إيقاف">▶</button>',
 '<button type="button" id="qsaEmbedForward" aria-label="تقديم 15 ثانية">15↷</button>',
 '<span id="qsaEmbedTime">0:00</span><input type="range" id="qsaEmbedSeek" min="0" max="1000" value="0" aria-label="التقدم في التسجيل">',
 '<span id="qsaEmbedDuration">0:00</span></div>',
 '<div class="qsa-embedded-more"><label>السرعة <select id="qsaEmbedSpeed">',
 '<option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option>',
 '<option value="1.5">1.5×</option><option value="2">2×</option></select></label>',
 '<label>مؤقت النوم <select id="qsaEmbedSleep"><option value="0">متوقف</option><option value="15">15 دقيقة</option><option value="30">30 دقيقة</option></select></label>',
 '<label><input type="checkbox" id="qsaEmbedRepeat"> تكرار</label>',
 '<a href="#" id="qsaEmbedSource" target="_blank" rel="noopener noreferrer">صفحة التسجيل الأصلية ↗</a></div>',
 '<audio id="qsaEmbedAudio" preload="none"></audio>'
 ].join('');
 document.body.append(dock);
 const audio=$('#qsaEmbedAudio',dock),play=$('#qsaEmbedPlay',dock),status=$('#qsaEmbedStatus',dock),
 speed=$('#qsaEmbedSpeed',dock),seek=$('#qsaEmbedSeek',dock),clock=$('#qsaEmbedTime',dock),duration=$('#qsaEmbedDuration',dock);
 let active=null,lastSaved=0,resume=0,sleepTimer=null;
 const message=t=>status.textContent=t;
 const syncPlay=()=>{play.textContent=audio.paused?'▶':'Ⅱ';play.setAttribute('aria-pressed',String(!audio.paused))};
 const persist=()=>{if(active&&Number.isFinite(audio.currentTime))saveCheckpoint({id:active.id,position:Math.max(0,audio.currentTime),updatedAt:Date.now()})};
 async function open(track,source){
   persist();audio.pause();audio.removeAttribute('src');audio.load();clearTimeout(sleepTimer);
   $('#qsaEmbedSleep',dock).value='0';active=track;dock.hidden=false;document.body.classList.add('qsa-embed-open');
   $('#qsaEmbedTitle',dock).textContent=track.title;$('#qsaEmbedSource',dock).href=source.href;
   const cp=getCheckpoint();resume=cp?.id===track.id&&Number.isFinite(Number(cp.position))?Math.max(0,Number(cp.position)):0;
   audio.src=track.src;audio.playbackRate=Number(speed.value);audio.load();message('جارٍ تجهيز القصة…');
   try{await audio.play();message('يُشغَّل السرد القصصي الآن')}catch(e){if(e?.name!=='AbortError')message('تعذر التشغيل، افتح الرابط الأصلي.')}
 }
 anchors.forEach(a=>{const track=byId.get(a.dataset.openEpisode);
   const b=document.createElement('button');b.type='button';b.className='qsa-btn qsa-btn-embed';
   b.textContent='▶ استمع داخل المكتبة';b.setAttribute('aria-label','تشغيل '+track.title+' داخل المكتبة');
   b.addEventListener('click',()=>open(track,a));a.before(b);
 });
 $('#qsaEmbedClose',dock).addEventListener('click',()=>{persist();audio.pause();audio.removeAttribute('src');audio.load();active=null;dock.hidden=true;document.body.classList.remove('qsa-embed-open');clearTimeout(sleepTimer)});
 play.addEventListener('click',async()=>{if(!active||!audio.src)return;if(audio.paused){try{await audio.play()}catch{message('تعذر التشغيل، استخدم المصدر الأصلي.')}}else audio.pause()});
 $('#qsaEmbedBack',dock).addEventListener('click',()=>{if(audio.src)audio.currentTime=Math.max(0,audio.currentTime-15)});
 $('#qsaEmbedForward',dock).addEventListener('click',()=>{if(audio.src&&Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15)});
 seek.addEventListener('input',()=>{if(audio.src&&Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=audio.duration*Number(seek.value)/1000});
 speed.addEventListener('change',()=>audio.playbackRate=Number(speed.value));
 audio.addEventListener('loadedmetadata',()=>{duration.textContent=format(audio.duration);if(resume>0&&Number.isFinite(audio.duration))audio.currentTime=Math.min(resume,Math.max(0,audio.duration-2));resume=0});
 audio.addEventListener('timeupdate',()=>{clock.textContent=format(audio.currentTime);duration.textContent=format(audio.duration);
   seek.value=Number.isFinite(audio.duration)&&audio.duration>0?String(Math.round(1000*audio.currentTime/audio.duration)):'0';
   if(Date.now()-lastSaved>4000){lastSaved=Date.now();persist()}
 });
 audio.addEventListener('play',syncPlay);audio.addEventListener('pause',()=>{syncPlay();persist()});
 audio.addEventListener('playing',()=>message('يُشغَّل السرد القصصي الآن'));
 audio.addEventListener('waiting',()=>message('جارٍ انتظار الصوت من المصدر…'));
 audio.addEventListener('error',()=>message('تعذر تحميل الملف، افتح صفحة الناشر.'));
 audio.addEventListener('ended',()=>{if($('#qsaEmbedRepeat',dock).checked){audio.currentTime=0;audio.play().catch(()=>message('تعذر إعادة التشغيل'))}else message('انتهى التسجيل')});
 $('#qsaEmbedSleep',dock).addEventListener('change',e=>{clearTimeout(sleepTimer);const min=Number(e.target.value);if(min>0)sleepTimer=setTimeout(()=>{audio.pause();message('انتهى مؤقت النوم');e.target.value='0'},min*60000)});
 window.addEventListener('pagehide',persist);
}
async function init(){
 try{const res=await fetch(root+'assets/data/stories-audio-playback.json',{cache:'no-store'});if(!res.ok)return;
   const tracks=verifiedTracks(await res.json());if(tracks.length)setup(tracks);
 }catch(err){console.warn('Licensed stories player unavailable',err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();