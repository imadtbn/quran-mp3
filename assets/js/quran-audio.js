(()=>{'use strict';
const el=id=>document.getElementById(id),audio=el('qaAudio'),reciterEl=el('qaReciter'),surahEl=el('qaSurah');
if(!audio||typeof QuranAudio==='undefined'||typeof catalogReady==='undefined')return;
const KEY='qmp3-audio-handoff-v1',status=el('qaStatus');
const controller=QuranAudio.attach(audio,{status:v=>{status.textContent=({loading:'جارٍ تحميل التلاوة…',buffering:'جارٍ جلب الصوت…',ready:'جاهز للتشغيل',playing:'التلاوة قيد التشغيل',paused:'التلاوة متوقفة مؤقتًا',error:'تعذر تشغيل الصوت من المصدر الخارجي.',timeout:'تأخر التحميل، حاول مجددًا.',gesture:'اضغط تشغيل لبدء الاستماع',unavailable:'السورة غير متاحة للقارئ المختار'})[v]||v;updatePlay()}});
let current=1,reader=null,restoreTime=0,restoring=false,ready=false;
const fmt=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
const getReaders=()=>RECITERS.filter(r=>/حفص/.test(r.riwaya)&&Array.isArray(r.surahs)&&r.surahs.length);
const getReader=()=>getReaders().find(r=>r.id===reciterEl.value);
const setText=()=>{const item=SURAHS.find(s=>s.n===current);el('qaTrack').textContent=(item?.name||'السورة')+' — '+(reader?.name||'اختر قارئًا')};
const updatePlay=()=>{el('qaPlay').textContent=audio.paused?'تشغيل التلاوة':'إيقاف مؤقت';el('qaPlay').setAttribute('aria-label',audio.paused?'تشغيل التلاوة':'إيقاف مؤقت')};
const save=()=>{if(!reader)return;try{sessionStorage.setItem(KEY,JSON.stringify({reciterId:reader.id,surah:current,seconds:Math.floor(audio.currentTime||0),wasPlaying:!audio.paused,updatedAt:Date.now()}))}catch{}};
function setSurah(n,{play=false}={}){if(!Number.isInteger(n)||n<1||n>114)return;current=n;reader=getReader();surahEl.value=String(n);setText();if(!reader||!reader.surahs.includes(n)){status.textContent='السورة غير متوفرة لهذا القارئ';audio.pause();audio.removeAttribute('src');audio.load();updatePlay();return}controller.load(reader,n,{autoplay:play});save();}
function populate(){const readers=getReaders();reciterEl.replaceChildren(...readers.map(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.name+' — '+r.riwaya;return o}));surahEl.replaceChildren(...SURAHS.map(s=>{const o=document.createElement('option');o.value=s.n;o.textContent=s.n+' — '+s.name;return o}));if(!readers.length){status.textContent='لا توجد تسجيلات حفص متاحة حاليًا';el('qaPlay').disabled=true;return}let handoff=null;try{handoff=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{}let stored=localStorage.getItem('qmp3-reciter');let found=readers.find(r=>r.id===handoff?.reciterId)||readers.find(r=>r.id===stored)||readers[0];reciterEl.value=found.id;reader=found;let url=new URLSearchParams(location.search),incoming=Number(url.get('surah'));current=incoming>=1&&incoming<=114?incoming:(handoff?.surah||1);setSurah(current);ready=true;if(handoff?.surah===current&&handoff?.reciterId===reader.id&&handoff?.seconds>0){restoreTime=handoff.seconds;restoring=true;status.textContent='يمكنك استئناف التلاوة من آخر موضع.'}}
reciterEl.addEventListener('change',()=>{reader=getReader();localStorage.setItem('qmp3-reciter',reader.id);setSurah(current)});
surahEl.addEventListener('change',()=>setSurah(Number(surahEl.value),{play:!audio.paused}));
el('qaPrev').onclick=()=>setSurah(Math.max(1,current-1),{play:!audio.paused});
el('qaNext').onclick=()=>setSurah(Math.min(114,current+1),{play:!audio.paused});
el('qaPlay').onclick=()=>{if(audio.paused){if(controller.failed())controller.retry();else controller.play()}else audio.pause()};
el('qaSeek').oninput=e=>{if(Number.isFinite(audio.duration))audio.currentTime=(Number(e.target.value)/1000)*audio.duration};
el('qaVolume').oninput=e=>{audio.volume=Number(e.target.value)/100};
audio.addEventListener('loadedmetadata',()=>{if(restoring){audio.currentTime=Math.min(restoreTime,Math.max(0,(audio.duration||restoreTime+1)-1));restoring=false;restoreTime=0}});
audio.addEventListener('timeupdate',()=>{el('qaCurrent').textContent=fmt(audio.currentTime);el('qaDuration').textContent=fmt(audio.duration);el('qaSeek').value=Number.isFinite(audio.duration)&&audio.duration>0?String(Math.floor(audio.currentTime/audio.duration*1000)):'0'});
audio.addEventListener('play',updatePlay);audio.addEventListener('pause',()=>{updatePlay();save()});audio.addEventListener('ended',()=>{updatePlay();save()});audio.addEventListener('error',updatePlay);
window.addEventListener('pagehide',save);
window.addEventListener('quran:surah',e=>{if(ready&&el('qaFollow').checked&&e.detail?.surah!==current)setSurah(Number(e.detail.surah),{play:!audio.paused})});
el('qaCollapse').onclick=()=>{const body=el('qaBody');body.hidden=!body.hidden;el('qaCollapse').textContent=body.hidden?'إظهار المشغل':'تصغير المشغل';el('qaCollapse').setAttribute('aria-expanded',String(!body.hidden))};
catalogReady.then(populate).catch(err=>{status.textContent='تعذر تحميل قائمة القراء';console.error(err)});
})();