catalogReady.then(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)],AR='٠١٢٣٤٥٦٧٨٩';
const toAr=n=>String(n).replace(/\d/g,d=>AR[d]),norm=s=>String(s||'').toLowerCase().replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').trim(),url=(r,n)=>r.base+String(n).padStart(3,'0')+'.mp3',time=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
const safeJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const JUZ=[['الجزء الأول','الفاتحة والبقرة',1],['الجزء الثاني','البقرة',2],['الجزء الثالث','البقرة وآل عمران',2],['الجزء الرابع','آل عمران والنساء',3],['الجزء الخامس','النساء',4],['الجزء السادس','النساء والمائدة',4],['الجزء السابع','المائدة والأنعام',5],['الجزء الثامن','الأنعام والأعراف',6],['الجزء التاسع','الأعراف والأنفال',7],['الجزء العاشر','الأنفال والتوبة',8],['الجزء الحادي عشر','التوبة ويونس',9],['الجزء الثاني عشر','هود ويوسف',11],['الجزء الثالث عشر','يوسف والرعد',12],['الجزء الرابع عشر','الحجر والنحل',15],['الجزء الخامس عشر','الإسراء والكهف',17],['الجزء السادس عشر','الكهف وطه',18],['الجزء السابع عشر','الأنبياء والحج',21],['الجزء الثامن عشر','المؤمنون والنور',23],['الجزء التاسع عشر','الفرقان والشعراء',25],['الجزء العشرون','النمل والقصص',27],['الجزء الحادي والعشرون','العنكبوت والروم',29],['الجزء الثاني والعشرون','الأحزاب ويس',33],['الجزء الثالث والعشرون','يس والصافات',36],['الجزء الرابع والعشرون','الزمر وغافر',39],['الجزء الخامس والعشرون','فصلت والجاثية',41],['الجزء السادس والعشرون','الأحقاف والذاريات',46],['الجزء السابع والعشرون','الذاريات والحديد',51],['الجزء الثامن والعشرون','المجادلة والتحريم',58],['الجزء التاسع والعشرون','الملك والمرسلات',67],['الجزء الثلاثون','النبأ والناس',78]].map((x,i)=>({n:i+1,title:x[0],range:x[1],surah:x[2]}));
const state={reciterId:localStorage.getItem('qmp3-reciter')||RECITERS[0].id,query:'',riwaya:'',sort:'tartil',view:'surahs',favoritesOnly:false,repeat:false,current:null,queue:[],playQueue:null,favorites:new Set(safeJson('qmp3-favorites',[])),playlists:safeJson('qmp3-playlists',[]),pendingPlaylistSurah:null,stats:safeJson('qmp3-stats',{plays:0,seconds:0,surahs:{},reciters:{}}),last:safeJson('qmp3-last-position',null)};
const audio=$('#audio'),audioController=QuranAudio.attach(audio,{status:code=>{const p=$('#playerStatus');if(p)p.textContent=({loading:'جارٍ تحميل التلاوة…',buffering:'جارٍ تخزين الصوت مؤقتًا…',ready:'جاهز للاستماع',playing:'يُتلى الآن',paused:'متوقف مؤقتًا',error:'تعذر تشغيل المصدر الخارجي. اضغط تشغيل لإعادة المحاولة.',timeout:'تأخر تحميل الصوت. اضغط تشغيل لإعادة المحاولة.',gesture:'اضغط تشغيل لبدء الاستماع',unavailable:'هذه السورة غير متاحة لهذا القارئ'})[code]||'جاهز للاستماع'}}),reciter=()=>RECITERS.find(r=>r.id===state.reciterId)||RECITERS[0];
function renderHeroStats(){$('#statSurahs').textContent=toAr(114);$('#statReciters').textContent=toAr(RECITERS.length);$('#statRiwayat').textContent=toAr(new Set(RECITERS.map(r=>r.riwaya)).size)}
let reciterLimit=24,reciterMatches=[];
function renderReciters(){
  const q=norm($('#reciterSearch').value);
  const global=norm(state.query);
  const matched=RECITERS.filter(r=>
    (!state.riwaya||r.riwaya===state.riwaya)&&
    (!$('#styleSelect').value||r.style===$('#styleSelect').value)&&
    (!q||norm(r.name+' '+r.riwaya+' '+r.moshafName).includes(q))&&
    (!global||!state.searchReciters||norm(r.name+' '+r.riwaya+' '+r.moshafName).includes(global))
  );
  reciterMatches=matched;
  $('#reciterList').innerHTML=matched.length?matched.slice(0,reciterLimit).map(r=>`<button class="reciter-item ${r.id===state.reciterId?'active':''}" data-reciter="${r.id}" type="button"><span class="reciter-avatar">${r.short[0]}</span><span class="reciter-body"><strong>${r.name}</strong><small>${r.riwaya} · ${r.style}</small></span><span class="reciter-check">✓</span></button>`).join(''):'<p class="muted-note">لا يوجد قارئ مطابق.</p>';
  const more=$('#moreRecitersBtn');more.hidden=matched.length<=reciterLimit;
  if(!more.hidden)more.textContent='عرض المزيد من القراء ('+toAr(matched.length-reciterLimit)+')';
}
$('#moreRecitersBtn').addEventListener('click',()=>{reciterLimit+=24;renderReciters()});
$('#styleSelect').addEventListener('change',()=>{reciterLimit=24;renderReciters()});
function searchNumber(value){
  const plain=String(value).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  return /^\d+$/.test(plain.trim())?Number(plain.trim()):null;
}
function matching(s){
  const q=norm(state.query),n=searchNumber(state.query);
  return !q||(n!==null&&s.n===n)||norm(s.name).includes(q);
}
function matchRecitersByMainQuery(){
  const q=norm(state.query);
  return q?RECITERS.filter(r=>norm(r.name+' '+r.short+' '+r.riwaya+' '+(r.moshafName||'')).includes(q)):[];
}
function applyMainSearch(){
  const matches=matchRecitersByMainQuery();
  const hasSurah=SURAHS.some(matching);
  if(state.query.trim()&&!hasSurah&&matches.length){
    const eligible=matches.filter(r=>(!state.riwaya||r.riwaya===state.riwaya)&&(!$('#styleSelect').value||r.style===$('#styleSelect').value));
    state.searchReciters=true;
    if(eligible.length&&!eligible.some(r=>r.id===state.reciterId)){
      state.reciterId=eligible[0].id;localStorage.setItem('qmp3-reciter',state.reciterId);
    }
  }else state.searchReciters=false;
  renderReciters();
  renderGrid();
}
function list(){let a=SURAHS.filter(s=>(state.searchReciters||matching(s))&&(!reciter().surahs||reciter().surahs.includes(s.n))&&(!state.favoritesOnly||state.favorites.has(s.n)));return state.sort==='alpha'?a.sort((x,y)=>x.name.localeCompare(y.name,'ar')):a}
const svg=(path,fill='none')=>`<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
function renderJuz(){state.queue=JUZ.filter(j=>!reciter().surahs||reciter().surahs.includes(j.surah)).map(j=>({n:j.surah,name:j.title,ayahs:j.range,isJuz:true,juz:j.n}));$('#toolbarInfo').innerHTML=`عرض <b>${toAr(30)}</b> جزءاً · اختر جزءاً للبدء`;$('#emptyState').hidden=true;$('#surahGrid').innerHTML=JUZ.filter(j=>!reciter().surahs||reciter().surahs.includes(j.surah)).map(j=>`<article class="surah-card juz-card" data-n="${j.surah}"><div class="surah-number">${toAr(j.n)}</div><div class="surah-card-top"><span class="surah-kicker">جزء</span><span class="juz-mark">۞</span></div><h3>${j.title}</h3><p>يبدأ من سورة ${j.range}</p><div class="card-actions"><button class="btn-play" data-play="${j.surah}" type="button"><span>${svg('<path d="M8 5.5v13l11-6.5z"/>','currentColor')} استماع من البداية</span></button></div></article>`).join('')}
function renderGrid(){let r=reciter();if(state.view==='juz')return renderJuz();state.queue=state.playQueue||list();$('#toolbarInfo').innerHTML=`عرض <b>${toAr(state.queue.length)}</b> من ${toAr(114)} سورة <span class="toolbar-dot">·</span> ${r.short}`;$('#emptyState').hidden=!!state.queue.length;$('#surahGrid').innerHTML=state.queue.map(s=>`<article class="surah-card ${state.current===s.n?'playing':''}" data-n="${s.n}"><div class="surah-number">${toAr(s.n)}</div><div class="surah-card-top"><span class="surah-kicker">سورة</span><button class="favorite-btn ${state.favorites.has(s.n)?'is-favorite':''}" data-favorite="${s.n}" type="button" aria-label="المفضلة">${svg('<path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.5Z"')}</button></div><h3>${s.name}</h3><p>${toAr(s.ayahs)} آية <span>·</span> ${r.style}</p><div class="card-actions"><button class="btn-play" data-play="${s.n}" type="button"><span>${svg('<path d="M8 5.5v13l11-6.5z"/>','currentColor')} استماع</span><span class="equalizer"><i></i><i></i><i></i></span></button><button class="playlist-add" data-queue="${s.n}" type="button" aria-label="إضافة إلى قائمة الانتظار">＋</button><button class="playlist-add" data-add-playlist="${s.n}" type="button" aria-label="إضافة إلى قائمة تشغيل">${svg('<path d="M12 5v14M5 12h14"/>')}</button><a class="btn-download" href="${url(r,s.n)}" download="سورة ${s.name} - ${r.name}.mp3" aria-label="تحميل سورة ${s.name}">${svg('<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"')}</a></div></article>`).join('')}
function saveFavorites(){localStorage.setItem('qmp3-favorites',JSON.stringify([...state.favorites]))}function favorite(n){state.favorites.has(n)?state.favorites.delete(n):state.favorites.add(n);saveFavorites();renderGrid()}
function recordPlay(n){state.stats.plays++;state.stats.surahs[n]=(state.stats.surahs[n]||0)+1;state.stats.reciters[state.reciterId]=(state.stats.reciters[state.reciterId]||0)+1;localStorage.setItem('qmp3-stats',JSON.stringify(state.stats));renderStatsDashboard();renderTrending()}
function renderStatsDashboard(){if(!$('#statMinutes'))return;$('#statMinutes').textContent=toAr(Math.floor((state.stats.seconds||0)/60));$('#statPlays').textContent=toAr(state.stats.plays||0);$('#statUnique').textContent=toAr(Object.keys(state.stats.surahs||{}).length);$('#statRecitersUsed').textContent=toAr(Object.keys(state.stats.reciters||{}).length)}
function renderTrending(){let ids=Object.entries(state.stats.surahs||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n])=>+n);if(!ids.length)ids=[1,18,36,55,67];$('#trendingList').innerHTML=ids.map(n=>{let s=SURAHS.find(x=>x.n===n);return `<button class="trend-chip" data-trend="${n}">${s?.name||''}<span>▶</span></button>`}).join('')}
function updateMeta(s,r){let desc=`استمع إلى سورة ${s.name} بصوت ${r.name} برواية ${r.riwaya} من مكتبة القرآن الصوتية.`;document.title=`سورة ${s.name} · ${r.short} | مكتبة القرآن الصوتية`;let m=$('meta[name=description]');if(m)m.content=desc;let ld=$('#structuredData');if(ld)ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'AudioObject',name:`سورة ${s.name} بصوت ${r.name}`,description:desc,encodingFormat:'audio/mpeg',inLanguage:'ar',contentUrl:url(r,s.n)});}
function saveLast(){if(state.current&&Number.isFinite(audio.currentTime))localStorage.setItem('qmp3-last-position',JSON.stringify({n:state.current,reciterId:state.reciterId,time:audio.currentTime}))}
function updateUrl(){if(!state.current)return;let p=new URLSearchParams({surah:state.current,reciter:state.reciterId});history.replaceState({},'',`${location.pathname}?${p}`)}
function selectSurah(n,autoplay=true,fromResume=false){
  const r=reciter(),s=SURAHS.find(x=>x.n===n);
  if(!s||QuranAudio.url(r,n)===null){$('#playerStatus').textContent='هذه السورة غير متاحة لدى القارئ المحدد';return}
  state.current=n;const valid=audioController.load(r,n,{autoplay:false});
  if(!valid)return;
  $('#playerSurah').textContent='سورة '+s.name;
  $('#playerReciter').textContent=r.name+' · '+r.riwaya;
  const d=$('#downloadBtn');d.href=QuranAudio.url(r,n);d.download=`سورة ${s.name} - ${r.name}.mp3`;d.hidden=false;
  $('#player').classList.add('show');
  updateMeta(s,r);updateUrl();renderGrid();
  if(fromResume&&state.last?.n===n&&state.last?.reciterId===state.reciterId){
    audio.addEventListener('loadedmetadata',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(state.last.time||0,Math.max(0,audio.duration-1))},{once:true});
  }
  if(autoplay)audioController.play();
}
const listenQueue=[];
let sleepDeadline=0,sleepInterval=null,repeatDone=0,repeatTrack=null;
function renderListenQueue(){
  $('#queueCount').textContent=toAr(listenQueue.length);
  const host=$('#queueItems');host.replaceChildren();
  for(const [index,item] of listenQueue.entries()){
    const line=document.createElement('div'),name=document.createElement('span'),del=document.createElement('button');
    line.className='queue-item';name.textContent='سورة '+(SURAHS[item.n-1]?.name||item.n)+' · '+(RECITERS.find(r=>r.id===item.r)?.short||'قارئ');
    del.type='button';del.textContent='إزالة';del.setAttribute('aria-label','إزالة من قائمة الانتظار');
    del.onclick=()=>{listenQueue.splice(index,1);renderListenQueue()};
    line.append(name,del);host.append(line);
  }
  if(!listenQueue.length)host.textContent='قائمة الانتظار فارغة.';
}
function enqueue(n){
  const r=reciter();if(!QuranAudio.url(r,n))return;
  listenQueue.push({n,r:r.id});renderListenQueue();
  $('#playerStatus').textContent='أُضيفت السورة إلى قائمة الانتظار';
}
function nextQueued(){
  while(listenQueue.length){
    const item=listenQueue.shift();renderListenQueue();
    const r=RECITERS.find(x=>x.id===item.r);
    if(!r||!QuranAudio.url(r,item.n))continue;
    state.reciterId=r.id;localStorage.setItem('qmp3-reciter',r.id);
    state.playQueue=null;renderReciters();selectSurah(item.n);return true;
  }
  return false;
}
function onTrackEnd(){
  const count=Number($('#repeatCount').value);
  const track=state.reciterId+':'+state.current;
  if(track!==repeatTrack){repeatTrack=track;repeatDone=0}
  if(count===-1||(count>1&&repeatDone<count-1)){
    repeatDone++;selectSurah(state.current);return;
  }
  repeatDone=0;
  if(nextQueued())return;
  step(1);
}
$('#queueToggle').addEventListener('click',()=>{const pane=$('#queuePanel');pane.hidden=!pane.hidden;$('#queueToggle').setAttribute('aria-expanded',String(!pane.hidden))});
$('#queueClear').addEventListener('click',()=>{listenQueue.length=0;renderListenQueue()});
$('#repeatCount').addEventListener('change',()=>{repeatDone=0;state.repeat=$('#repeatCount').value!=='0';$('#repeatBtn').classList.toggle('active',state.repeat);$('#repeatHint').textContent=state.repeat?'تكرار السورة مفعّل':''});
$('#sleepTimer').addEventListener('change',()=>{
  const minutes=Number($('#sleepTimer').value);
  sleepDeadline=minutes?Date.now()+minutes*60000:0;
  if(sleepInterval)clearInterval(sleepInterval);
  if(minutes)sleepInterval=setInterval(()=>{
    if(Date.now()<sleepDeadline)return;
    audio.pause();sleepDeadline=0;clearInterval(sleepInterval);sleepInterval=null;
    $('#sleepTimer').value='0';$('#playerStatus').textContent='توقف الاستماع بانتهاء المؤقت';
  },1000);
});
renderListenQueue();
function step(dir){if(!state.queue.length)return;let available=state.queue.filter(s=>QuranAudio.url(reciter(),s.n));if(!available.length)return;let i=available.findIndex(s=>s.n===state.current);selectSurah(available[(i+dir+available.length)%available.length].n)}
function playState(){$('#iconPlay').hidden=!audio.paused;$('#iconPause').hidden=audio.paused;renderGrid()}
function renderResume(){let b=$('#resumeBanner');if(!state.last||!SURAHS.find(s=>s.n===state.last.n)){b.hidden=true;return}let s=SURAHS.find(x=>x.n===state.last.n),r=RECITERS.find(x=>x.id===state.last.reciterId)||RECITERS[0];$('#resumeTitle').textContent='سورة '+s.name;$('#resumeMeta').textContent=`${r.short} · توقفت عند ${time(state.last.time)}`;b.hidden=false}
function savePlaylists(){localStorage.setItem('qmp3-playlists',JSON.stringify(state.playlists))}
function openPlaylists(pending=null){state.pendingPlaylistSurah=pending;renderPlaylists();$('#playlistModal').hidden=false;document.body.classList.add('modal-open')}
function closePlaylists(){state.pendingPlaylistSurah=null;$('#playlistModal').hidden=true;document.body.classList.remove('modal-open')}
function renderPlaylists(){let list=$('#playlistList');if(!state.playlists.length){list.innerHTML='<div class="playlist-empty">أنشئ قائمتك الأولى، ثم أضف إليها السور التي تريد الاستماع إليها لاحقاً.</div>';return}list.innerHTML=state.playlists.map(p=>{let s=p.surahs.length?`تضم ${toAr(p.surahs.length)} سورة`:'فارغة';let add=state.pendingPlaylistSurah&&!p.surahs.includes(state.pendingPlaylistSurah)?`<button class="pbtn add-to-playlist" data-playlist-add="${p.id}" type="button" title="إضافة السورة">＋</button>`:'';return `<div class="playlist-row"><div><strong>${p.name}</strong><small>${s}</small></div>${add}<button class="pbtn playlist-play" data-playlist-play="${p.id}" type="button" title="تشغيل القائمة">▶</button><button class="pbtn delete-playlist" data-playlist-delete="${p.id}" type="button" title="حذف القائمة">×</button></div>`}).join('')}
function addToPlaylist(id,n=state.pendingPlaylistSurah){let p=state.playlists.find(x=>x.id===id);if(!p||!n)return;if(!p.surahs.includes(n))p.surahs.push(n);savePlaylists();renderPlaylists()}
function playPlaylist(id){let p=state.playlists.find(x=>x.id===id);if(!p?.surahs.length)return;state.playQueue=p.surahs.map(n=>SURAHS.find(s=>s.n===n)).filter(s=>s&&QuranAudio.url(reciter(),s.n));if(!state.playQueue.length)return;state.query='';state.favoritesOnly=false;$('#searchInput').value='';$('#favoritesToggle').classList.remove('active');selectSurah(state.playQueue[0].n);closePlaylists()}
async function shareCurrent(){let n=state.current||state.queue[0]?.n;if(!n)return;let r=state.reciterId,p=new URLSearchParams({surah:n,reciter:r}),shareUrl=`${location.origin}${location.pathname}?${p}`;try{if(navigator.share)await navigator.share({title:'مكتبة القرآن الصوتية',text:`استمع إلى سورة ${SURAHS.find(s=>s.n===n).name}`,url:shareUrl});else{await navigator.clipboard.writeText(shareUrl);$('#playerStatus').textContent='تم نسخ رابط المشاركة'}}catch(e){if(e.name!=='AbortError')$('#playerStatus').textContent='تعذر إتمام المشاركة'}}
function setTheme(dark){document.body.classList.toggle('dark',dark);localStorage.setItem('qmp3-theme',dark?'dark':'light');$('#themeToggle').textContent=dark?'☀':'◐';$('#themeToggle').setAttribute('aria-label',dark?'تفعيل الوضع النهاري':'تفعيل الوضع الليلي')}
$('#reciterList').addEventListener('click',e=>{let b=e.target.closest('[data-reciter]');if(!b)return;state.reciterId=b.dataset.reciter;localStorage.setItem('qmp3-reciter',state.reciterId);renderReciters();renderGrid();if(state.current&&QuranAudio.url(reciter(),state.current))selectSurah(state.current,false);else if(state.current){audio.pause();audio.removeAttribute('src');audio.load();state.current=null}});
$('#surahGrid').addEventListener('click',e=>{let f=e.target.closest('[data-favorite]'),p=e.target.closest('[data-play]'),a=e.target.closest('[data-add-playlist]'),c=e.target.closest('[data-n]');if(f)return favorite(+f.dataset.favorite);let q=e.target.closest('[data-queue]');if(q)return enqueue(+q.dataset.queue);if(p)return selectSurah(+p.dataset.play);if(a)return openPlaylists(+a.dataset.addPlaylist);if(c&&!e.target.closest('a,button'))selectSurah(+c.dataset.n)});
$('#viewSelect').addEventListener('change',e=>{state.view=e.target.value;state.playQueue=null;renderGrid()});$('#trendingList').addEventListener('click',e=>{let b=e.target.closest('[data-trend]');if(b)selectSurah(+b.dataset.trend)});$('#repeatBtn').addEventListener('click',()=>{$('#repeatCount').value=$('#repeatCount').value==='0'?'-1':'0';$('#repeatCount').dispatchEvent(new Event('change'))});$('#searchInput').addEventListener('input',e=>{state.playQueue=null;state.view='surahs';$('#viewSelect').value='surahs';state.query=e.target.value;reciterLimit=24;$('#searchClear').hidden=!state.query;applyMainSearch()});$('#searchClear').addEventListener('click',()=>{$('#searchInput').value='';state.query='';state.searchReciters=false;$('#searchClear').hidden=true;applyMainSearch();$('#searchInput').focus()});$('#reciterSearch').addEventListener('input',renderReciters);$('#riwayaSelect').addEventListener('change',e=>{state.riwaya=e.target.value;reciterLimit=24;renderReciters();renderGrid()});$('#sortSelect').addEventListener('change',e=>{state.playQueue=null;state.sort=e.target.value;renderGrid()});$('#favoritesToggle').addEventListener('click',e=>{state.view='surahs';$('#viewSelect').value='surahs';state.playQueue=null;state.favoritesOnly=!state.favoritesOnly;e.currentTarget.classList.toggle('active',state.favoritesOnly);renderGrid()});
function reset(){state.playQueue=null;state.view='surahs';$('#viewSelect').value='surahs';state.query='';state.searchReciters=false;state.riwaya='';state.favoritesOnly=false;$('#searchInput').value='';$('#reciterSearch').value='';$('#riwayaSelect').value='';$('#styleSelect').value='';reciterLimit=24;$('#favoritesToggle').classList.remove('active');$('#searchClear').hidden=true;renderReciters();renderGrid()}$('#resetFilters').addEventListener('click',reset);$('#emptyReset').addEventListener('click',reset);$('#searchForm').addEventListener('submit',e=>{e.preventDefault();if(state.queue[0])selectSurah(state.queue[0].n)});$('#playAllBtn').addEventListener('click',()=>state.queue[0]&&selectSurah(state.queue[0].n));$('#shareBtn').addEventListener('click',shareCurrent);$('#sharePageBtn').addEventListener('click',shareCurrent);$('#playBtn').addEventListener('click',()=>{if(!audio.src)return state.queue[0]&&selectSurah(state.queue[0].n);audio.paused?(audioController.failed()?audioController.retry():audioController.play()):audio.pause()});$('#nextBtn').addEventListener('click',()=>step(1));$('#prevBtn').addEventListener('click',()=>step(-1));$('#resumeBtn').addEventListener('click',()=>{if(state.last){state.reciterId=state.last.reciterId||state.reciterId;localStorage.setItem('qmp3-reciter',state.reciterId);renderReciters();selectSurah(state.last.n,true,true)}});
let lastRecordedTrack='';audio.addEventListener('playing',()=>{const key=state.reciterId+':'+state.current+':'+audio.currentSrc;if(state.current&&key!==lastRecordedTrack){lastRecordedTrack=key;recordPlay(state.current)}});audio.addEventListener('play',()=>{statTick=performance.now();playState()});audio.addEventListener('pause',()=>{statTick=0;playState()});audio.addEventListener('ended',onTrackEnd);let statTick=0;audio.addEventListener('timeupdate',()=>{let now=performance.now();if(!audio.paused&&statTick){state.stats.seconds+=Math.min(5,Math.max(0,(now-statTick)/1000));if(Math.floor(state.stats.seconds)%10===0)localStorage.setItem('qmp3-stats',JSON.stringify(state.stats));renderStatsDashboard()}statTick=now;let p=audio.duration?audio.currentTime/audio.duration*1000:0;$('#seekBar').style.setProperty('--fill',p/10+'%');$('#curTime').textContent=time(audio.currentTime);saveLast()});audio.addEventListener('loadedmetadata',()=>$('#durTime').textContent=time(audio.duration));$('#seekBar').addEventListener('input',e=>{if(audio.duration)audio.currentTime=e.target.value/1000*audio.duration});$('#volumeBar').addEventListener('input',e=>{audio.volume=e.target.value/100});$('#volumeBtn').addEventListener('click',()=>audio.muted=!audio.muted);
$('#themeToggle').addEventListener('click',()=>setTheme(!document.body.classList.contains('dark')));$('#playlistsBtn').addEventListener('click',()=>openPlaylists());$('#closePlaylist').addEventListener('click',closePlaylists);$('#playlistModal').addEventListener('click',e=>{if(e.target.id==='playlistModal')closePlaylists();let add=e.target.closest('[data-playlist-add]'),playBtn=e.target.closest('[data-playlist-play]'),del=e.target.closest('[data-playlist-delete]');if(add)addToPlaylist(add.dataset.playlistAdd);if(playBtn)playPlaylist(playBtn.dataset.playlistPlay);if(del){state.playlists=state.playlists.filter(p=>p.id!==del.dataset.playlistDelete);savePlaylists();renderPlaylists()}});$('#playlistForm').addEventListener('submit',e=>{e.preventDefault();let name=$('#playlistName').value.trim();if(!name)return;state.playlists.push({id:Date.now().toString(36),name,surahs:[]});savePlaylists();$('#playlistName').value='';renderPlaylists()});
$('#navToggle').addEventListener('click',()=>{$('#mainNav').classList.toggle('open');$('#navToggle').setAttribute('aria-expanded',$('#mainNav').classList.contains('open'))});$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));document.addEventListener('keydown',e=>{if(e.key==='Escape')closePlaylists();if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();$('#playBtn').click()}if(e.code==='ArrowLeft')step(1);if(e.code==='ArrowRight')step(-1)});
$('#riwayaSelect').innerHTML='<option value="">كل الروايات</option>'+[...new Set(RECITERS.map(r=>r.riwaya))].map(r=>`<option value="${r}">${r}</option>`).join('');
const params=new URLSearchParams(location.search),urlReciter=params.get('reciter'),urlSurah=Number(params.get('surah'));if(RECITERS.some(r=>r.id===urlReciter))state.reciterId=urlReciter;if(!RECITERS.some(r=>r.id===state.reciterId))state.reciterId=RECITERS[0].id;renderHeroStats();renderStatsDashboard();renderTrending();renderReciters();renderGrid();setTheme(localStorage.getItem('qmp3-theme')==='dark');renderResume();if(SURAHS.some(s=>s.n===urlSurah))selectSurah(urlSurah,false);audio.volume=1;
/* المرحلة الثالثة: PWA، نسخة البيانات، والتذكير الاختياري */
let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;$('#installBtn').hidden=false});
$('#installBtn').addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('#installBtn').hidden=true});
window.addEventListener('appinstalled',()=>{$('#installBtn').hidden=true;$('#utilityNote').textContent='تم تثبيت المكتبة كتطبيق على جهازك.'});
function backupData(){return {version:1,exportedAt:new Date().toISOString(),reciterId:state.reciterId,favorites:[...state.favorites],playlists:state.playlists,stats:state.stats,last:state.last,theme:localStorage.getItem('qmp3-theme')||'light',reminder:localStorage.getItem('qmp3-reminder')||null}}
$('#exportDataBtn').addEventListener('click',()=>{let blob=new Blob([JSON.stringify(backupData(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='quran-mp3-backup.json';a.click();URL.revokeObjectURL(a.href);$('#utilityNote').textContent='تم تجهيز نسخة بياناتك للتنزيل.'});
$('#importDataBtn').addEventListener('click',()=>$('#importDataInput').click());
$('#importDataInput').addEventListener('change',async e=>{let file=e.target.files?.[0];if(!file)return;try{let data=JSON.parse(await file.text());if(!Array.isArray(data.favorites)||!Array.isArray(data.playlists))throw Error('invalid');localStorage.setItem('qmp3-favorites',JSON.stringify(data.favorites));localStorage.setItem('qmp3-playlists',JSON.stringify(data.playlists));localStorage.setItem('qmp3-stats',JSON.stringify(data.stats||{plays:0,seconds:0,surahs:{},reciters:{}}));if(data.last)localStorage.setItem('qmp3-last-position',JSON.stringify(data.last));if(data.reciterId)localStorage.setItem('qmp3-reciter',data.reciterId);if(data.theme)localStorage.setItem('qmp3-theme',data.theme);if(data.reminder)localStorage.setItem('qmp3-reminder',data.reminder);$('#utilityNote').textContent='تم الاستيراد. ستُعاد تهيئة الصفحة الآن.';setTimeout(()=>location.reload(),700)}catch{$('#utilityNote').textContent='الملف غير صالح أو ليس نسخة من مكتبة القرآن.'}e.target.value=''});
function checkReminder(){let configured=localStorage.getItem('qmp3-reminder'),now=new Date();if(!configured||localStorage.getItem('qmp3-reminder-date')===now.toISOString().slice(0,10))return;if(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`!==configured)return;let notify=()=>{new Notification('وردك القرآني', {body:'حان وقت الاستماع إلى وردك في مكتبة القرآن الصوتية.',icon:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%2318332d"/%3E%3Cpath d="M32 12c-8 0-14 5-14 12v18l14-8 14 8V24c0-7-6-12-14-12z" fill="%23e0b961"/%3E%3C/svg%3E'});localStorage.setItem('qmp3-reminder-date',now.toISOString().slice(0,10))};if('Notification' in window&&Notification.permission==='granted')notify()}
$('#enableReminderBtn').addEventListener('click',async()=>{if(!('Notification' in window)){$('#utilityNote').textContent='المتصفح الحالي لا يدعم إشعارات التذكير.';return}let permission=Notification.permission;if(permission==='default')permission=await Notification.requestPermission();if(permission!=='granted'){$('#utilityNote').textContent='لم يتم السماح بالإشعارات.';return}localStorage.setItem('qmp3-reminder',$('#reminderTime').value);localStorage.removeItem('qmp3-reminder-date');$('#utilityNote').textContent=`تم تفعيل التذكير اليومي عند ${$('#reminderTime').value}.`});
if(localStorage.getItem('qmp3-reminder'))$('#reminderTime').value=localStorage.getItem('qmp3-reminder');setInterval(checkReminder,30000);if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

}).catch(error=>console.error('تعذر بدء المكتبة',error));
