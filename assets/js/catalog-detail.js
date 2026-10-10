catalogReady.then(()=>{
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search),page=document.body.dataset.page;
const entries=page==='riwaya'?RECITERS.filter(r=>r.riwaya===params.get('name')):RECITERS.filter(r=>r.id===params.get('id'));
const title=page==='riwaya'?params.get('name')||'رواية غير محددة':entries[0]?.name||'مصحف غير موجود';
const hero=$('#detailsHero'),grid=$('#detailsGrid'),audio=$('#detailsAudio'),heading=$('#detailsHeading');
const selected={r:entries[0]||null,n:null};
document.title=title+' | مكتبة القرآن الصوتية';
const desc='استمع إلى '+title+' من المكتبة الصوتية للقرآن الكريم.';
$('meta[name=description]').content=desc;
$('#canonical').href=location.origin+location.pathname+(page==='riwaya'?'?name='+encodeURIComponent(title):'?id='+encodeURIComponent(params.get('id')||''));
const h=document.createElement('h1'),p=document.createElement('p');h.textContent=title;p.textContent=desc;hero.append(h,p);
heading.textContent=page==='riwaya'?'المصاحف المسجلة بهذه الرواية':'السور المتاحة في المصحف';
const controller=QuranAudio.attach(audio,{status:s=>{if(s==='error'||s==='timeout')$('#nowReciter').textContent='تعذر تشغيل الصوت؛ حاول مرة أخرى.'}});
function addCard(text,sub,onClick){const card=document.createElement('article'),strong=document.createElement('strong'),small=document.createElement('small'),button=document.createElement('button'),wrap=document.createElement('div');card.className='detail-card';strong.textContent=text;small.textContent=sub;button.className='detail-play';button.type='button';button.textContent='▶';button.addEventListener('click',onClick);wrap.append(strong,small);card.append(wrap,button);grid.append(card)}
function play(r,n){if(!controller.load(r,n))return;selected.r=r;selected.n=n;$('#nowPlaying').textContent='سورة '+SURAHS[n-1].name;$('#nowReciter').textContent=r.name+' · '+r.riwaya;controller.play()}
if(!entries.length){heading.textContent='لا يوجد تسجيل مطابق';return}
if(page==='riwaya'){for(const r of entries){addCard(r.name,r.moshafName||r.riwaya,()=>{location.href='mushaf.html?id='+encodeURIComponent(r.id)})}}
else{const r=entries[0];for(const n of r.surahs||[]){const s=SURAHS[n-1];if(s)addCard('سورة '+s.name,s.ayahs+' آية',()=>play(r,n))}}
$('#detailsPlay').addEventListener('click',()=>{if(!selected.r)return;if(audio.src){if(!audio.paused)audio.pause();else if(controller.failed())controller.retry();else controller.play()}else play(selected.r,selected.r.surahs[0])});
$('#detailsSort').addEventListener('change',e=>{if(page!=='mushaf')return;grid.replaceChildren();const r=entries[0],ss=(r.surahs||[]).map(n=>SURAHS[n-1]).filter(Boolean);if(e.target.value==='alpha')ss.sort((a,b)=>a.name.localeCompare(b.name,'ar'));for(const s of ss)addCard('سورة '+s.name,s.ayahs+' آية',()=>play(r,s.n))});
}).catch(error=>console.error('خطأ في صفحات المصاحف والروايات',error));