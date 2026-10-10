(()=>{
'use strict';
const $=s=>document.querySelector(s);
const audio=$('#verseAudio');
const BASE='https://everyayah.com/data/Alafasy_128kbps/';
const pad=n=>String(n).padStart(3,'0');
const url=(s,a)=>BASE+pad(s)+pad(a)+'.mp3';
const settingsKey='qmp3-review-settings-v1',progressKey='qmp3-review-progress-v1';
const saveProgress=()=>{if(!plan||!active)return;try{localStorage.setItem(progressKey,JSON.stringify({plan,verseIndex,verseRound,segmentRound,updatedAt:Date.now()}))}catch{};renderSaved()};
function renderSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(progressKey)||'null')}catch{};$('#reviewSavedProgress').textContent=x&&x.plan?'آخر جلسة: سورة '+(SURAHS[x.plan.surah-1]?.name||x.plan.surah)+'، الآية '+(x.plan.from+x.verseIndex)+'، المقطع '+(x.segmentRound+1):'لم تُحفظ جلسة بعد.';$('#resumeSaved').disabled=!x};
let run=0,active=false,paused=false,plan=null,verseIndex=0,verseRound=0,segmentRound=0,delayId=null,loadId=null,delayRemaining=0,delayStarted=0,loadSerial=0;
const message=text=>{$('#reviewStatus').textContent=text};
function cancelTimers(){clearTimeout(delayId);clearTimeout(loadId);delayId=null;loadId=null;loadSerial++}
function stop(show=true){if(active)saveProgress();run++;active=false;paused=false;delayRemaining=0;cancelTimers();audio.pause();audio.removeAttribute('src');audio.load();$('#pauseReview').textContent='إيقاف مؤقت';if(show)message('انتهت جلسة المراجعة. يمكنك بدء جلسة جديدة.')}
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
  b.onclick=()=>{if(!active)return;verseIndex=a-plan.from;verseRound=0;paused=false;$('#pauseReview').textContent='إيقاف مؤقت';cancelTimers();playVerse(run)};
  host.append(b);
 }
}
function arm(token,serial){
 clearTimeout(loadId);
 loadId=setTimeout(()=>{if(token===run&&serial===loadSerial&&active&&!paused&&audio.readyState<2){audio.pause();message('تأخر تحميل التلاوة. تحقق من اتصال الإنترنت أو أعد تشغيل الآية.')}},20000);
}
async function playVerse(token){
 if(!active||paused||token!==run||!plan)return;
 cancelTimers();
 const serial=loadSerial;
 const current=plan.from+verseIndex;
 renderVerses();saveProgress();
 $('#reviewProgress').textContent='الآية '+current+' من '+plan.to+' · تكرار الآية '+(verseRound+1)+' من '+plan.verseRepeat+' · المقطع '+(segmentRound+1)+' من '+plan.segmentRepeat;
 message('جارٍ تحميل الآية '+current+'…');
 audio.src=url(plan.surah,current);
 audio.load();arm(token,serial);
 try{await audio.play();if(token===run&&serial===loadSerial&&!paused){clearTimeout(loadId);message('الاستماع إلى الآية '+current)}}
 catch(e){if(token!==run||serial!==loadSerial||paused)return;clearTimeout(loadId);message(e?.name==='NotAllowedError'?'اضغط تشغيل في المشغل للسماح بالاستماع.':'تعذر تشغيل ملف الآية. جرّب الآية التالية أو تحقق من المصدر.')}
}
function advance(){
 if(!active||paused||!plan)return;
 const token=run;
 if(verseRound+1<plan.verseRepeat)verseRound++;
 else if(plan.from+verseIndex<plan.to){verseIndex++;verseRound=0}
 else if(segmentRound+1<plan.segmentRepeat){segmentRound++;verseIndex=0;verseRound=0}
 else{active=false;cancelTimers();try{localStorage.removeItem(progressKey)}catch{};renderSaved();message('اكتملت مراجعة المقطع.');$('#reviewProgress').textContent='اكتملت الجلسة';return}
 saveProgress();const gap=plan.gap*1000;
 message(gap?'فاصل المراجعة…':'الانتقال إلى الآية التالية…');
 delayRemaining=gap;delayStarted=Date.now();delayId=setTimeout(()=>{delayId=null;delayRemaining=0;playVerse(token)},gap);
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
 if(!paused){paused=true;audio.pause();if(delayId!==null)delayRemaining=Math.max(0,delayRemaining-(Date.now()-delayStarted));cancelTimers();$('#pauseReview').textContent='استئناف';message('المراجعة متوقفة مؤقتًا')}
 else{paused=false;$('#pauseReview').textContent='إيقاف مؤقت';if(delayRemaining>0){delayStarted=Date.now();delayId=setTimeout(()=>{delayId=null;delayRemaining=0;playVerse(run)},delayRemaining);message('فاصل المراجعة…')}else if(audio.src&&audio.readyState>=2&&!audio.ended)audio.play().catch(()=>message('اضغط زر التشغيل للسماح بالاستماع'));else playVerse(run)}
});
$('#skipVerse').addEventListener('click',()=>{
 if(!active)return;cancelTimers();delayRemaining=0;audio.pause();verseRound=plan.verseRepeat-1;paused=false;$('#pauseReview').textContent='إيقاف مؤقت';advance();
});
$('#restartVerse').addEventListener('click',()=>{if(!active)return;cancelTimers();delayRemaining=0;verseRound=0;paused=false;$('#pauseReview').textContent='إيقاف مؤقت';playVerse(run)});
$('#stopReview').addEventListener('click',()=>stop());
function readSharedPlan(){
 const q=new URLSearchParams(location.search),keys=['surah','from','to','verseRepeat','segmentRepeat','gap'];
 if(!keys.every(k=>q.has(k)))return null;
 const p=Object.fromEntries(keys.map(k=>[k,Number(q.get(k))]));
 const max=SURAHS[p.surah-1]?.ayahs;
 if(!max||!keys.every(k=>Number.isInteger(p[k]))||p.from<1||p.to>max||p.from>p.to||p.to-p.from+1>60||![1,2,3,5,10].includes(p.verseRepeat)||![1,2,3,5].includes(p.segmentRepeat)||![0,2,5,10].includes(p.gap))return null;
 return p;
}
function applyPlan(p){for(const [id,v] of Object.entries({verseSurah:p.surah,fromVerse:p.from,toVerse:p.to,verseRepeat:p.verseRepeat,segmentRepeat:p.segmentRepeat,pauseBetween:p.gap}))$('#'+id).value=String(v);syncBounds()}
$('#shareReview').addEventListener('click',async()=>{
 const p=getPlan();if(!p)return;
 const link=new URL(location.pathname,location.origin);
 for(const [k,v] of Object.entries(p))link.searchParams.set(k,String(v));
 try{
  if(navigator.share)await navigator.share({title:'مقطع للمراجعة القرآنية',text:'راجع هذا المقطع من القرآن الكريم',url:link.href});
  else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(link.href);message('تم نسخ رابط المراجعة')}
  else{message('رابط المشاركة: '+link.href)}
 }catch(e){if(e?.name!=='AbortError')message('تعذرت المشاركة؛ يمكنك نسخ رابط الصفحة يدويًا.')}
});
$('#resumeSaved').addEventListener('click',()=>{
 let x;try{x=JSON.parse(localStorage.getItem(progressKey)||'null')}catch{return}
 if(!x?.plan)return;
 applyPlan(x.plan);const p=getPlan();if(!p)return;
 stop(false);plan=p;verseIndex=Math.max(0,Math.min(p.to-p.from,Number(x.verseIndex)||0));
 verseRound=Math.max(0,Math.min(p.verseRepeat-1,Number(x.verseRound)||0));
 segmentRound=Math.max(0,Math.min(p.segmentRepeat-1,Number(x.segmentRound)||0));
 active=true;paused=false;playVerse(run);
});
$('#resetSaved').addEventListener('click',()=>{try{localStorage.removeItem(progressKey)}catch{};renderSaved();message('تم مسح تقدم المراجعة المحفوظ.')});
$('#saveReview').addEventListener('click',()=>{
 const p=getPlan();if(!p)return;
 try{localStorage.setItem(settingsKey,JSON.stringify(p));message('حُفظت إعدادات المراجعة على هذا الجهاز.')}catch{message('تعذر حفظ الإعدادات في المتصفح.')}
});
try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'null');if(saved&&SURAHS[saved.surah-1]){for(const [id,val] of Object.entries({verseSurah:saved.surah,fromVerse:saved.from,toVerse:saved.to,verseRepeat:saved.verseRepeat,segmentRepeat:saved.segmentRepeat,pauseBetween:saved.gap})){const el=$('#'+id);if(el)el.value=String(val)}}}catch{}
const shared=readSharedPlan();if(shared){applyPlan(shared);message('تم تحميل إعدادات المقطع المشترك. اضغط ابدأ المراجعة.')}else syncBounds();renderSaved();
})();