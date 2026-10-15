(()=>{
'use strict';
const $=s=>document.querySelector(s);
const audio=$('#verseAudio');
// Verse-by-verse recitations from EveryAyah; folder names are explicitly allowlisted.
const RECITERS=[{"id":"alafasy","name":"مشاري راشد العفاسي","folder":"Alafasy_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"husary","name":"محمود خليل الحصري","folder":"Husary_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"minshawy","name":"محمد صديق المنشاوي","folder":"Minshawy_Murattal_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"abdulbasit","name":"عبد الباسط عبد الصمد","folder":"Abdul_Basit_Murattal_192kbps","kbps":192,"type":"مرتل","group":"murattal"},{"id":"maher","name":"ماهر المعيقلي","folder":"MaherAlMuaiqly128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"hudhaify","name":"علي الحذيفي","folder":"Hudhaify_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"ayyoub","name":"محمد أيوب","folder":"Muhammad_Ayyoub_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"sudais","name":"عبد الرحمن السديس","folder":"Abdurrahmaan_As-Sudais_192kbps","kbps":192,"type":"مرتل","group":"murattal"},{"id":"shuraym","name":"سعود الشريم","folder":"Saood_ash-Shuraym_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"shaatree","name":"أبو بكر الشاطري","folder":"Abu_Bakr_Ash-Shaatree_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"basfar","name":"عبد الله بصفر","folder":"Abdullah_Basfar_192kbps","kbps":192,"type":"مرتل","group":"murattal"},{"id":"fares","name":"فارس عباد","folder":"Fares_Abbad_64kbps","kbps":64,"type":"مرتل","group":"murattal"},{"id":"hani","name":"هاني الرفاعي","folder":"Hani_Rifai_192kbps","kbps":192,"type":"مرتل","group":"murattal"},{"id":"dussary","name":"ياسر الدوسري","folder":"Yasser_Ad-Dussary_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"qatami","name":"ناصر القطامي","folder":"Nasser_Alqatami_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"ajamy","name":"أحمد العجمي","folder":"ahmed_ibn_ali_al_ajamy_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"ghamadi","name":"سعد الغامدي","folder":"Ghamadi_40kbps","kbps":40,"type":"مرتل","group":"murattal"},{"id":"ali-jaber","name":"علي جابر","folder":"Ali_Jaber_64kbps","kbps":64,"type":"مرتل","group":"murattal"},{"id":"juhany","name":"عبد الله عواد الجهني","folder":"Abdullaah_3awwaad_Al-Juhaynee_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"tablawi","name":"محمد محمود الطبلاوي","folder":"Mohammad_al_Tablaway_128kbps","kbps":128,"type":"تلاوة","group":"murattal"},{"id":"muhsin","name":"محسن القاسم","folder":"Muhsin_Al_Qasim_192kbps","kbps":192,"type":"مرتل","group":"murattal"},{"id":"bukhatir","name":"صلاح بو خاطر","folder":"Salaah_AbdulRahman_Bukhatir_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"jibreel","name":"محمد جبريل","folder":"Muhammad_Jibreel_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"budair","name":"صلاح البدير","folder":"Salah_Al_Budair_128kbps","kbps":128,"type":"مرتل","group":"murattal"},{"id":"husary-teacher","name":"محمود خليل الحصري","folder":"Husary_Muallim_128kbps","kbps":128,"type":"المعلم","group":"teacher"},{"id":"minshawy-teacher","name":"محمد صديق المنشاوي","folder":"Minshawy_Teacher_128kbps","kbps":128,"type":"المعلم","group":"teacher"},{"id":"husary-mujawwad","name":"محمود خليل الحصري","folder":"Husary_128kbps_Mujawwad","kbps":128,"type":"مجود","group":"mujawwad"},{"id":"minshawy-mujawwad","name":"محمد صديق المنشاوي","folder":"Minshawy_Mujawwad_192kbps","kbps":192,"type":"مجود","group":"mujawwad"},{"id":"abdulbasit-mujawwad","name":"عبد الباسط عبد الصمد","folder":"Abdul_Basit_Mujawwad_128kbps","kbps":128,"type":"مجود","group":"mujawwad"}];
const RECITER_BY_ID=new Map(RECITERS.map(reciter=>[reciter.id,reciter]));
const DEFAULT_RECITER='alafasy';
const reciterFor=id=>RECITER_BY_ID.get(id)||RECITER_BY_ID.get(DEFAULT_RECITER);
const reciterSelect=$('#verseReciter');
const RECITER_GROUPS=[['murattal','التلاوات المرتلة'],['teacher','تلاوات التعليم'],['mujawwad','التلاوات المجودة']];
reciterSelect.replaceChildren();
for(const [group,label] of RECITER_GROUPS){
 const optgroup=document.createElement('optgroup');optgroup.label=label;
 for(const reader of RECITERS.filter(r=>r.group===group)){
  const option=document.createElement('option');
  option.value=reader.id;option.textContent=reader.name+' — '+reader.type+' · '+reader.kbps+'kbps';
  optgroup.append(option);
 }
 reciterSelect.append(optgroup);
}
reciterSelect.value=DEFAULT_RECITER;
const reciterHelp=$('#reciterHelp');
function updateReciterHelp(){
 const reader=reciterFor(reciterSelect.value);
 reciterHelp.textContent=reader.name+' · '+reader.type+' · جودة '+reader.kbps+'kbps'+
  (active?' — يبدأ تطبيق الاختيار الجديد عند بدء جلسة أخرى.':' — يمكنك بدء المراجعة بهذا القارئ.');
}
reciterSelect.addEventListener('change',updateReciterHelp);
const BASE='https://everyayah.com/data/';
const pad=n=>String(n).padStart(3,'0');
const url=(reciter,s,a)=>BASE+reciterFor(reciter).folder+'/'+pad(s)+pad(a)+'.mp3';
const settingsKey='qmp3-review-settings-v1',progressKey='qmp3-review-progress-v1';
const saveProgress=()=>{if(!plan||!active)return;try{localStorage.setItem(progressKey,JSON.stringify({plan,verseIndex,verseRound,segmentRound,updatedAt:Date.now()}))}catch{};renderSaved()};
function renderSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(progressKey)||'null')}catch{};$('#reviewSavedProgress').textContent=x&&x.plan?'آخر جلسة: '+reciterFor(x.plan.reciter).name+' · سورة '+(SURAHS[x.plan.surah-1]?.name||x.plan.surah)+'، الآية '+(x.plan.from+x.verseIndex)+'، المقطع '+(x.segmentRound+1):'لم تُحفظ جلسة بعد.';$('#resumeSaved').disabled=!x};
let run=0,active=false,paused=false,plan=null,verseIndex=0,verseRound=0,segmentRound=0,delayId=null,loadId=null,delayRemaining=0,delayStarted=0,loadSerial=0;
const message=text=>{$('#reviewStatus').textContent=text};
function cancelTimers(){clearTimeout(delayId);clearTimeout(loadId);delayId=null;loadId=null;loadSerial++}
function stop(show=true){if(active)saveProgress();run++;active=false;paused=false;delayRemaining=0;cancelTimers();audio.pause();audio.removeAttribute('src');audio.load();$('#pauseReview').textContent='إيقاف مؤقت';updateReciterHelp();if(show)message('انتهت جلسة المراجعة. يمكنك بدء جلسة جديدة.')}
function selectedSurah(){return SURAHS[Number($('#verseSurah').value)-1]}
function syncBounds(){
 const count=selectedSurah()?.ayahs||7;
 for(const id of ['fromVerse','toVerse']){$(('#'+id)).max=String(count);$(('#'+id)).min='1'}
 $('#fromVerse').value=String(Math.min(count,Math.max(1,Number($('#fromVerse').value)||1)));
 $('#toVerse').value=String(Math.min(count,Math.max(Number($('#fromVerse').value),Number($('#toVerse').value)||count)));
}
for(const s of SURAHS){const o=document.createElement('option');o.value=String(s.n);o.textContent=s.n+' — '+s.name;$('#verseSurah').append(o)}
const surahSelect=$('#verseSurah'),surahSearch=$('#verseSurahSearch'),surahResults=$('#surahSearchResults'),surahHint=$('#surahSearchHint');
let surahMatches=[],surahActive=-1,surahSearchPending=false;
const normalizeSurahName=value=>String(value).normalize('NFKD')
 .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/[أإآٱ]/g,'ا')
 .replace(/ى/g,'ي').replace(/ـ/g,'')
 .replace(/[\u0660-\u0669]/g,d=>String(d.charCodeAt(0)-0x660))
 .replace(/[\u06F0-\u06F9]/g,d=>String(d.charCodeAt(0)-0x6f0))
 .replace(/\s+/g,' ').trim();
function closeSurahMatches(){
 surahMatches=[];surahActive=-1;surahResults.hidden=true;surahResults.replaceChildren();
 surahSearch.setAttribute('aria-expanded','false');surahSearch.removeAttribute('aria-activedescendant');
}
function showSelectedSurah(){surahHint.textContent='السورة المختارة: '+(selectedSurah()?.name||'—')}
function commitSurah(s){
 surahSelect.value=String(s.n);surahSelect.dispatchEvent(new Event('change',{bubbles:true}));
 surahSearch.value=s.name;surahSearchPending=false;showSelectedSurah();closeSurahMatches();
}
function highlightSurah(index){
 surahActive=index;
 for(const [i,node] of [...surahResults.children].entries())node.setAttribute('aria-selected',String(i===index));
 const active=surahResults.children[index];
 if(active){surahSearch.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'});}
 else surahSearch.removeAttribute('aria-activedescendant');
}
surahSearch.addEventListener('input',()=>{
 const query=normalizeSurahName(surahSearch.value).replace(/^سورة\s*/, '').trim();
 if(!query){surahSearchPending=false;closeSurahMatches();showSelectedSurah();return}
 const matches=SURAHS.filter(s=>normalizeSurahName(s.name).includes(query)||String(s.n)===query)
  .sort((a,b)=>{
   const rank=s=>normalizeSurahName(s.name).startsWith(query)?0:1;
   return rank(a)-rank(b)||a.n-b.n;
  });
 const exact=matches.find(s=>normalizeSurahName(s.name)===query||String(s.n)===query);
 if(exact){commitSurah(exact);return}
 surahSearchPending=true;closeSurahMatches();
 if(!matches.length){surahHint.textContent='لا توجد سورة مطابقة. جرّب كتابة جزء من الاسم.';return}
 surahMatches=matches.slice(0,10);
 for(const s of surahMatches){
  const option=document.createElement('button');option.type='button';option.id='surah-search-option-'+s.n;
  option.className='surah-search-option';option.setAttribute('role','option');
  option.setAttribute('aria-selected','false');option.textContent=s.n+' — '+s.name;
  option.addEventListener('click',()=>commitSurah(s));surahResults.append(option);
 }
 surahResults.hidden=false;surahSearch.setAttribute('aria-expanded','true');
 surahHint.textContent=matches.length>10?'توجد '+matches.length+' سورة مطابقة؛ تظهر أول 10 نتائج. واصل الكتابة لتضييق البحث.':'اختر السورة من '+matches.length+' نتيجة مطابقة.';
});
surahSearch.addEventListener('keydown',event=>{
 if(event.key==='Escape'){if(!surahResults.hidden||surahSearchPending){event.preventDefault();surahSearch.value='';surahSearchPending=false;closeSurahMatches();showSelectedSurah()}return}
 if((event.key==='ArrowDown'||event.key==='ArrowUp')&&surahMatches.length){
  event.preventDefault();highlightSurah(event.key==='ArrowDown'?Math.min(surahActive+1,surahMatches.length-1):Math.max(surahActive-1,0));return;
 }
 if(event.key==='Enter'&&surahSearchPending){
  event.preventDefault();
  if(surahMatches.length)commitSurah(surahMatches[Math.max(surahActive,0)]);
  else surahHint.textContent='لم يُعثر على سورة. عدّل اسم البحث أو استخدم القائمة المنسدلة.';
 }
});
surahSearch.addEventListener('focus',()=>surahSearch.select());
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.surah-search'))closeSurahMatches()});
$('#verseSurah').addEventListener('change',()=>{$('#fromVerse').value='1';$('#toVerse').value=String(selectedSurah().ayahs);syncBounds();surahSearch.value='';surahSearchPending=false;closeSurahMatches();showSelectedSurah()});
$('#fromVerse').addEventListener('change',syncBounds);
const statusError=text=>{$('#validation').hidden=false;$('#validation').textContent=text};
function getPlan(){
 if(surahSearchPending){statusError('اختر السورة من نتائج البحث أو القائمة المنسدلة أولًا.');surahSearch.focus();return null}
 const reciter=reciterSelect.value;
 if(!RECITER_BY_ID.has(reciter)){statusError('اختر قارئًا متاحًا من القائمة.');return null}
 const surah=Number($('#verseSurah').value),from=Number($('#fromVerse').value),to=Number($('#toVerse').value),max=SURAHS[surah-1]?.ayahs;
 if(!max||!Number.isInteger(from)||!Number.isInteger(to)||from<1||to>max||from>to){statusError('حدد نطاقًا صحيحًا من آيات السورة.');return null}
 if(to-from+1>60){statusError('لضمان سهولة المراجعة، اختر مقطعًا لا يتجاوز 60 آية في الجلسة.');return null}
 $('#validation').hidden=true;
 return {reciter,surah,from,to,verseRepeat:Number($('#verseRepeat').value),segmentRepeat:Number($('#segmentRepeat').value),gap:Number($('#pauseBetween').value)};
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
 $('#reviewProgress').textContent=reciterFor(plan.reciter).name+' · الآية '+current+' من '+plan.to+' · تكرار الآية '+(verseRound+1)+' من '+plan.verseRepeat+' · المقطع '+(segmentRound+1)+' من '+plan.segmentRepeat;
 message('جارٍ تحميل الآية '+current+'…');
 audio.src=url(plan.reciter,plan.surah,current);
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
 stop(false);try{localStorage.removeItem(progressKey)}catch{};plan=next;verseIndex=0;verseRound=0;segmentRound=0;active=true;paused=false;updateReciterHelp();
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
 if(!max||!keys.every(k=>q.get(k)!==''&&Number.isInteger(p[k]))||p.from<1||p.to>max||p.from>p.to||p.to-p.from+1>60||![1,2,3,5,10].includes(p.verseRepeat)||![1,2,3,5].includes(p.segmentRepeat)||![0,2,5,10].includes(p.gap))return null;
 return {...p,reciter:reciterFor(q.get('reciter')).id};
}
function applyPlan(p){for(const [id,v] of Object.entries({verseReciter:reciterFor(p.reciter).id,verseSurah:p.surah,fromVerse:p.from,toVerse:p.to,verseRepeat:p.verseRepeat,segmentRepeat:p.segmentRepeat,pauseBetween:p.gap}))$('#'+id).value=String(v);surahSearch.value='';surahSearchPending=false;closeSurahMatches();showSelectedSurah();syncBounds();updateReciterHelp()}
$('#shareReview').addEventListener('click',async()=>{
 const p=getPlan();if(!p)return;
 const link=new URL(location.pathname,location.origin);
 for(const [k,v] of Object.entries(p))link.searchParams.set(k,String(v));
 try{
  if(navigator.share)await navigator.share({title:'مقطع للمراجعة القرآنية',text:'راجع هذا المقطع من القرآن الكريم بصوت '+reciterFor(p.reciter).name,url:link.href});
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
 active=true;paused=false;updateReciterHelp();playVerse(run);
});
$('#resetSaved').addEventListener('click',()=>{try{localStorage.removeItem(progressKey)}catch{};renderSaved();message('تم مسح تقدم المراجعة المحفوظ.')});
$('#saveReview').addEventListener('click',()=>{
 const p=getPlan();if(!p)return;
 try{localStorage.setItem(settingsKey,JSON.stringify(p));message('حُفظت إعدادات المراجعة على هذا الجهاز.')}catch{message('تعذر حفظ الإعدادات في المتصفح.')}
});
try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'null');if(saved&&SURAHS[saved.surah-1]){for(const [id,val] of Object.entries({verseReciter:reciterFor(saved.reciter).id,verseSurah:saved.surah,fromVerse:saved.from,toVerse:saved.to,verseRepeat:saved.verseRepeat,segmentRepeat:saved.segmentRepeat,pauseBetween:saved.gap})){const el=$('#'+id);if(el)el.value=String(val)}}}catch{}
const shared=readSharedPlan();if(shared){applyPlan(shared);message('تم تحميل إعدادات المقطع المشترك. اضغط ابدأ المراجعة.')}else syncBounds();showSelectedSurah();updateReciterHelp();renderSaved();
})();