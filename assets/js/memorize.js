(()=>{
'use strict';
const $=s=>document.querySelector(s);
const audio=$('#verseAudio');
const BASE='https://everyayah.com/data/Alafasy_128kbps/';
const pad=n=>String(n).padStart(3,'0');
const url=(s,a)=>BASE+pad(s)+pad(a)+'.mp3';
const settingsKey='qmp3-review-settings-v1';
let run=0,active=false,paused=false,plan=null,verseIndex=0,verseRound=0,segmentRound=0,delayId=null,loadId=null;
const message=text=>{$('#reviewStatus').textContent=text};
function cancelTimers(){clearTimeout(delayId);clearTimeout(loadId);delayId=null;loadId=null}
function stop(show=true){run++;active=false;paused=false;cancelTimers();audio.pause();audio.removeAttribute('src');audio.load();$('#pauseReview').textContent='إيقاف مؤقت';if(show)message('انتهت جلسة المراجعة. يمكنك بدء جلسة جديدة.')}
function selectedSurah(){return SURAHS[Number($('#verseSurah').value)-1]}
function syncBounds(){
 const count=selectedSurah()?.ayahs||7;
 for(const id of ['fromVerse','toVerse']){$(('#'+id)).max=String(count);$(('#'+id)).min='1'}
 $('#fromVerse').value=String(Math.min(count,Math.max(1,Number($('#fromVerse').value)||1)));
 $('#toVerse').value=String(Math.min(count,Math.max(Number($('#fromVerse').value),Number($('#toVerse').value)||count)));
}
for(const s of SURAHS){const o=document.createElement('option');o.value=String(s.n);o.textContent=s.n+' — '+s.name;$('#verseSurah').append(o)}
$('#verseSurah').addEventListener('change',()=>{$('#fromVerse').value='1';$('#toVerse').value=String(selectedSurah().ayahs);syncBounds()});
$('#fromVerse').addEventListener('change',syncBounds);
const statusError=text=>{$('#validation').hidden=false;$('#validation').textContent=text};
function getPlan(){
 const surah=Number($('#verseSurah').value),from=Number($('#fromVerse').value),to=Number($('#toVerse').value),max=SURAHS[surah-1]?.ayahs;
 if(!max||!Number.isInteger(from)||!Number.isInteger(to)||from<1||to>max||from>to){statusError('حدد نطاقًا صحيحًا من آيات السورة.');return null}
 if(to-from+1>60){statusError('لضمان سهولة المراجعة، اختر مقطعًا لا يتجاوز 60 آية في الجلسة.');return null}
 $('#validation').hidden=true;
 return {surah,from,to,verseRepeat:Number($('#verseRepeat').value),segmentRepeat:Number($('#segmentRepeat').value),gap:Number($('#pauseBetween').value)};
}
function renderVerses(){
 const host=$('#reviewVerses');host.replaceChildren();
 if(!plan)return;
 for(let a=plan.from;a<=plan.to;a++){
  const b=document.createElement('button');b.type='button';b.textContent='الآية '+a;b.dataset.verse=String(a);
  b.className=a===plan.from+verseIndex?'active':'';b.setAttribute('aria-current',a===plan.from+verseIndex?'true':'false');
  b.onclick=()=>{if(!active)return;verseIndex=a-plan.from;verseRound=0;cancelTimers();playVerse(run)};
  host.append(b);
 }
}
function arm(token){
 clearTimeout(loadId);
 loadId=setTimeout(()=>{if(token===run&&active&&!paused&&audio.readyState<2){audio.pause();message('تأخر تحميل التلاوة. تحقق من اتصال الإنترنت أو أعد تشغيل الآية.')}},20000);
}
async function playVerse(token){
 if(!active||paused||token!==run||!plan)return;
 cancelTimers();
 const current=plan.from+verseIndex;
 renderVerses();
 $('#reviewProgress').textContent='الآية '+current+' من '+plan.to+' · تكرار الآية '+(verseRound+1)+' من '+plan.verseRepeat+' · المقطع '+(segmentRound+1)+' من '+plan.segmentRepeat;
 message('جارٍ تحميل الآية '+current+'…');
 audio.src=url(plan.surah,current);
 audio.load();arm(token);
 try{await audio.play();if(token===run){clearTimeout(loadId);message('الاستماع إلى الآية '+current)}}
 catch(e){if(token!==run||paused)return;clearTimeout(loadId);message(e?.name==='NotAllowedError'?'اضغط تشغيل في المشغل للسماح بالاستماع.':'تعذر تشغيل ملف الآية. جرّب الآية التالية أو تحقق من المصدر.')}
}
function advance(){
 if(!active||paused||!plan)return;
 const token=run;
 if(verseRound+1<plan.verseRepeat)verseRound++;
 else if(plan.from+verseIndex<plan.to){verseIndex++;verseRound=0}
 else if(segmentRound+1<plan.segmentRepeat){segmentRound++;verseIndex=0;verseRound=0}
 else{active=false;cancelTimers();message('اكتملت مراجعة المقطع.');$('#reviewProgress').textContent='اكتملت الجلسة';return}
 const gap=plan.gap*1000;
 message(gap?'فاصل المراجعة…':'الانتقال إلى الآية التالية…');
 delayId=setTimeout(()=>playVerse(token),gap);
}
audio.addEventListener('ended',advance);
audio.addEventListener('error',()=>{if(active)message('تعذر تحميل الآية الحالية. يمكن إعادة تشغيلها أو تخطيها.');clearTimeout(loadId)});
audio.addEventListener('loadedmetadata',()=>clearTimeout(loadId));
$('#reviewForm').addEventListener('submit',e=>{
 e.preventDefault();const next=getPlan();if(!next)return;
 stop(false);plan=next;verseIndex=0;verseRound=0;segmentRound=0;active=true;paused=false;
 playVerse(run);
});
$('#pauseReview').addEventListener('click',()=>{
 if(!active)return;
 if(!paused){paused=true;audio.pause();cancelTimers();$('#pauseReview').textContent='استئناف';message('المراجعة متوقفة مؤقتًا')}
 else{paused=false;$('#pauseReview').textContent='إيقاف مؤقت';if(audio.src&&audio.readyState>=2&&!audio.ended)audio.play().catch(()=>message('اضغط زر التشغيل للسماح بالاستماع'));else playVerse(run)}
});
$('#skipVerse').addEventListener('click',()=>{
 if(!active)return;cancelTimers();audio.pause();verseRound=plan.verseRepeat-1;paused=false;$('#pauseReview').textContent='إيقاف مؤقت';advance();
});
$('#restartVerse').addEventListener('click',()=>{if(!active)return;cancelTimers();verseRound=0;paused=false;$('#pauseReview').textContent='إيقاف مؤقت';playVerse(run)});
$('#stopReview').addEventListener('click',()=>stop());
$('#saveReview').addEventListener('click',()=>{
 const p=getPlan();if(!p)return;
 try{localStorage.setItem(settingsKey,JSON.stringify(p));message('حُفظت إعدادات المراجعة على هذا الجهاز.')}catch{message('تعذر حفظ الإعدادات في المتصفح.')}
});
try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'null');if(saved&&SURAHS[saved.surah-1]){for(const [id,val] of Object.entries({verseSurah:saved.surah,fromVerse:saved.from,toVerse:saved.to,verseRepeat:saved.verseRepeat,segmentRepeat:saved.segmentRepeat,pauseBetween:saved.gap})){const el=$('#'+id);if(el)el.value=String(val)}}}catch{}
syncBounds();
})();