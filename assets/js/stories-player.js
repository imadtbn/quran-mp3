/* Prophet stories audio: narration source links remain on their publisher's website.
 * In-page HTML5 player intentionally plays Quran recitations, not story narration. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const audio=$('#qsaAudio');if(!audio||!window.QuranAudio)return;

/* Add the same explicit light/dark control used by the home page.
 * Site shell may generate the header after this script is evaluated. */
function initTheme(){
 const header=document.querySelector('.qmp3-site-header');if(!header)return;
 let toggle=header.querySelector('#themeToggle');
 if(!toggle){toggle=document.createElement('button');toggle.id='themeToggle';toggle.type='button';toggle.className='theme-toggle';
 const navToggle=header.querySelector('#navToggle');if(navToggle)navToggle.before(toggle);else header.querySelector('.header-inner')?.append(toggle)}
 function setMode(on){document.body.classList.toggle('dark',on);toggle.textContent=on?'☀':'◐';toggle.setAttribute('aria-label',on?'تفعيل الوضع النهاري':'تفعيل الوضع الليلي');try{localStorage.setItem('qmp3-theme',on?'dark':'light')}catch{}}
 let prior=false;try{prior=localStorage.getItem('qmp3-theme')==='dark'}catch{}
 setMode(prior);toggle.addEventListener('click',()=>setMode(!document.body.classList.contains('dark')));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(initTheme),{once:true});else requestAnimationFrame(initTheme);

const root=document.body.dataset.qsaRoot||'../';
const storeKey='qmp3-prophet-audio-v1',readerStore='qmp3-reciter';
const fallbackReaders=[
{id:'akdr',name:'إبراهيم الأخضر',base:'https://server6.mp3quran.net/akdr/'},
{id:'deban',name:'أحمد دبان',base:'https://server16.mp3quran.net/deban/Rewayat-Qalon-A-n-Nafi/'}
].map(r=>({...r,surahs:Array.from({length:114},(_,i)=>i+1)}));
let state={favorites:[],last:null,reader:'akdr',position:0,queue:[],index:0,repeat:false,speed:1};
try{const s=JSON.parse(localStorage.getItem(storeKey)||'null');if(s&&typeof s==='object'){
 if(Array.isArray(s.favorites))state.favorites=s.favorites.filter(x=>typeof x==='string');
 if(s.last&&typeof s.last==='object')state.last=s.last;
 if(['akdr','deban'].includes(s.reader))state.reader=s.reader;
 if(s.repeat===true)state.repeat=true;
 if([.75,1,1.25,1.5,2].includes(Number(s.speed)))state.speed=Number(s.speed)
}}catch{}
const persist=()=>{try{localStorage.setItem(storeKey,JSON.stringify({favorites:state.favorites,last:state.last,reader:state.reader,repeat:state.repeat,speed:state.speed}))}catch{}};
const status=(message)=>{$('#qsaStatus').textContent=message};
const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase().trim();
const fmt=n=>{if(!Number.isFinite(n)||n<0)return '0:00';n=Math.floor(n);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
let queue=[],index=-1,catalog=[],readers=fallbackReaders,timer=null,restoreTime=0,lastPersist=0;
const core=QuranAudio.attach(audio,{status:key=>status(({
loading:'جارٍ تحميل التلاوة…',buffering:'جارٍ انتظار مصدر الصوت…',ready:'جاهز للاستماع',playing:'التلاوة قيد التشغيل',paused:'متوقف مؤقتًا',error:'تعذر تشغيل مصدر الصوت. جرّب قارئًا آخر أو أعد المحاولة.',timeout:'انتهت مهلة الاتصال بالمصدر؛ أعد المحاولة.',gesture:'اضغط تشغيل للسماح بالاستماع',unavailable:'هذه السورة غير متاحة لهذا القارئ'})[key]||'جاهز')});
const reader=()=>readers.find(r=>r.id===state.reader)||readers[0];
function updatePlay(){const b=$('#qsaPlay');b.textContent=audio.paused?'▶':'Ⅱ';b.setAttribute('aria-pressed',String(!audio.paused))}
function saveProgress(){if(index<0||!queue[index])return;const track=queue[index];state.last={story:track.story,surah:track.surah,name:track.name,index,position:Number.isFinite(audio.currentTime)?audio.currentTime:0,reader:state.reader,at:Date.now()};persist()}
function renderQueue(){const list=$('#qsaQueueItems');list.replaceChildren();queue.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+' — '+t.name+' · '+t.storyName;b.setAttribute('aria-current',String(i===index));b.addEventListener('click',()=>load(i,true));list.appendChild(b)});}
async function load(i,autoplay=false,remember=false){const track=queue[i];if(!track)return;const checkpoint=remember?state.last:null;if(!remember)saveProgress();index=i;
const reciter=reader();if(!core.load(reciter,track.surah)){status('لا يوجد تسجيل متاح لهذا الاختيار.');return}
const title=$('#qsaCurrentTitle'),sub=$('#qsaCurrentSub');title.textContent=track.name;sub.textContent=track.storyName+' · '+reciter.name+' · تلاوة السورة كاملة';
restoreTime=remember&&checkpoint&&checkpoint.surah===track.surah&&checkpoint.reader===state.reader?Math.max(0,Number(checkpoint.position)||0):0;
audio.playbackRate=state.speed;renderQueue();updatePlay();if(autoplay)await core.play();}
function trackFromCard(story){const item=catalog.find(x=>x.id===story);if(!item)return null;const v=item.verses[0];if(!v)return null;return {story:item.id,storyName:item.title,surah:v.surah,name:'سورة '+v.name}}
function makeIndexQueue(selected){if(!catalog.length){location.href='audio/'+encodeURIComponent(selected)+'.html';return}const visible=$$('.qsa-card').filter(c=>!c.hidden);const items=visible.map(c=>trackFromCard(c.dataset.prophet)).filter(Boolean);
const start=items.findIndex(t=>t.story===selected);queue=items;if(start>=0)load(start,true);}
function makeDetailQueue(){const slug=document.body.dataset.qsaStory,story=catalog.find(x=>x.id===slug),storyName=story?.title||document.querySelector('h1')?.textContent||'قصص الأنبياء';
const tracks=$$('[data-audio-surah]');queue=tracks.map(b=>({story:slug,storyName,surah:Number(b.dataset.audioSurah),name:b.dataset.trackName}));
return queue;}
function seekToSaved(){if(restoreTime>0&&Number.isFinite(audio.duration)&&audio.duration>0){audio.currentTime=Math.min(restoreTime,Math.max(0,audio.duration-2))}restoreTime=0}
audio.addEventListener('loadedmetadata',()=>{seekToSaved();$('#qsaDuration').textContent=fmt(audio.duration)});
audio.addEventListener('timeupdate',()=>{$('#qsaTimeNow').textContent=fmt(audio.currentTime);$('#qsaDuration').textContent=fmt(audio.duration);$('#qsaSeek').value=Number.isFinite(audio.duration)&&audio.duration>0?String(Math.round(audio.currentTime/audio.duration*1000)):'0';if(Date.now()-lastPersist>4500){lastPersist=Date.now();saveProgress()}});
audio.addEventListener('play',updatePlay);audio.addEventListener('pause',()=>{updatePlay();saveProgress()});
audio.addEventListener('ended',async()=>{if(state.repeat){audio.currentTime=0;await core.play();return}if(index+1<queue.length)await load(index+1,true);else{saveProgress();status('انتهت قائمة التلاوات')}});audio.addEventListener('error',updatePlay);
$('#qsaSeek').addEventListener('input',e=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=audio.duration*Number(e.target.value)/1000});
$('#qsaPlay').addEventListener('click',async()=>{if(!audio.src&&queue.length===0){status('اختر سورة من البطاقات للبدء.');return}if(!audio.src){await load(0,true);return}if(audio.paused)await(core.failed?.()?core.retry():core.play());else audio.pause()});
$('#qsaBack').addEventListener('click',()=>{if(audio.src)audio.currentTime=Math.max(0,audio.currentTime-15)});
$('#qsaForward').addEventListener('click',()=>{if(audio.src&&Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15)});
$('#qsaPrev').addEventListener('click',()=>{if(index>=0)load(index>0?index-1:0,true)});
$('#qsaNext').addEventListener('click',()=>{if(index+1<queue.length)load(index+1,true);else status('هذه آخر تلاوة في القائمة.')});
$('#qsaSpeed').value=String(state.speed);$('#qsaSpeed').addEventListener('change',e=>{state.speed=Number(e.target.value);audio.playbackRate=state.speed;persist()});
$('#qsaReader').value=state.reader;$('#qsaReader').addEventListener('change',e=>{const wasPlaying=!audio.paused,where=Number.isFinite(audio.currentTime)?audio.currentTime:0;state.reader=e.target.value;persist();if(index>=0){const t=queue[index];state.last={story:t.story,surah:t.surah,position:where,reader:state.reader};load(index,wasPlaying,true)}});
$('#qsaRepeat').setAttribute('aria-pressed',String(state.repeat));$('#qsaRepeat').addEventListener('click',()=>{state.repeat=!state.repeat;$('#qsaRepeat').setAttribute('aria-pressed',String(state.repeat));persist()});
$('#qsaQueueToggle').addEventListener('click',()=>{const q=$('#qsaQueue');q.hidden=!q.hidden;$('#qsaQueueToggle').setAttribute('aria-expanded',String(!q.hidden))});
$('#qsaSleep').addEventListener('change',e=>{if(timer)clearTimeout(timer);const m=Number(e.target.value);if(m>0){timer=setTimeout(()=>{audio.pause();status('انتهى مؤقت النوم.');$('#qsaSleep').value='0'},m*60000);status('سيتوقف التشغيل بعد '+m+' دقيقة.')}else status('مؤقت النوم متوقف.')});
window.addEventListener('pagehide',saveProgress);
const refreshFaves=()=>{const b=$('#qsaFavorite');if(b){const yes=state.favorites.includes(document.body.dataset.qsaStory);b.textContent=yes?'★ محفوظة في المفضلة':'☆ حفظ القصة';b.setAttribute('aria-pressed',String(yes))}};
$('#qsaFavorite')?.addEventListener('click',()=>{const id=document.body.dataset.qsaStory;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();refreshFaves()});refreshFaves();
$('#qsaShare')?.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,text:'قصص الأنبياء المسموعة — تلاوات وروابط القصص',url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);status('تم نسخ رابط القصة.')}else status('انسخ رابط الصفحة من شريط العنوان.')}catch(e){if(e.name!=='AbortError')status('تعذرت المشاركة؛ استخدم رابط الصفحة مباشرة.')}});
const results=()=>{const cards=$$('.qsa-card'),text=normalize($('#qsaSearch').value),only=$('#qsaOnlySaved').checked;let count=0;cards.forEach(c=>{const show=(!text||normalize(c.dataset.title+' '+(c.dataset.speakers||'')).includes(text))&&(!only||state.favorites.includes(c.dataset.prophet));c.hidden=!show;if(show)count++});$('#qsaResults').textContent='عرض '+count+' من '+cards.length+' قصص';$('#qsaNoResult').hidden=count>0};
$('#qsaFilters')?.addEventListener('submit',e=>e.preventDefault());
$('#qsaSearch')?.addEventListener('input',results);
$('#qsaOnlySaved')?.addEventListener('change',results);
$('#qsaSort')?.addEventListener('change',e=>{const grid=$('#qsaCards'),cards=$$('.qsa-card');if(e.target.value==='alpha')cards.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent,'ar'));else cards.sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index));cards.forEach(c=>grid.append(c));results()});
$('#qsaFilters')?.addEventListener('reset',()=>requestAnimationFrame(()=>{$('#qsaSort').dispatchEvent(new Event('change'));results()}));
function initialPlayback(){if(document.body.dataset.qsaStory){makeDetailQueue();$$('[data-audio-surah]').forEach(b=>b.addEventListener('click',()=>{const pos=queue.findIndex(t=>t.surah===Number(b.dataset.audioSurah));if(pos>=0)load(pos,true)}))}
else{queue=catalog.map(item=>trackFromCard(item.id)).filter(Boolean);renderQueue();$('[data-play-first]').forEach(b=>b.addEventListener('click',()=>makeIndexQueue(b.dataset.playFirst)));results()}
const remembered=state.last;if(remembered){const desired=queue.findIndex(t=>t.surah===remembered.surah&&t.story===remembered.story);if(desired>=0){load(desired,false,true);status('يمكنك متابعة الاستماع من آخر موضع محفوظ.')}}}
async function init(){
try{const result=await fetch(root+'assets/data/stories-audio.json',{cache:'force-cache'});if(!result.ok)throw new Error('catalog unavailable');const doc=await result.json();if(doc.version!==1||!Array.isArray(doc.items))throw new Error('Invalid catalog');catalog=doc.items; /* only known, existing reciter endpoints from the main library */
readers=doc.reciters.filter(x=>fallbackReaders.some(f=>f.id===x.id&&f.base===x.base)).map(x=>({...x,surahs:Array.from({length:114},(_,i)=>i+1)}));if(readers.length!==2)readers=fallbackReaders;
}catch(e){status('تعذر تحميل فهرس القصص. يمكنك فتح صفحات التلاوة والناشر من الروابط الظاهرة.');readers=fallbackReaders;}
initialPlayback();
}
init();
})();
