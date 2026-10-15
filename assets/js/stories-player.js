/* Narrated stories: links are from IslamWeb's official Nabil Al-Awadi series.
   No Quran recitation is presented as story narration. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const key='qmp3-narrated-stories-v2';
let saved={favorites:[],last:null};
try{const item=JSON.parse(localStorage.getItem(key)||'null');if(item&&typeof item==='object'){saved.favorites=Array.isArray(item.favorites)?item.favorites.filter(v=>typeof v==='string'):[];saved.last=item.last&&typeof item.last==='object'?item.last:null}}catch{}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(saved))}catch{}};
const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase().trim();
function isTrustedPublisherLink(link){try{const u=new URL(link.href);return u.protocol==='https:'&&u.hostname==='audio.islamweb.net'&&u.pathname==='/audio/index.php'&&u.searchParams.get('page')==='audioinfo'&&/^118(69[5-9]|70[0-4])$/.test(u.searchParams.get('audioid')||'')}catch{return false}}
function updateFav(){ $$('[data-favorite]').forEach(btn=>{const selected=saved.favorites.includes(btn.dataset.favorite);btn.setAttribute('aria-pressed',String(selected));btn.textContent=selected?'★ محفوظة':'☆ المفضلة'})}
function results(){
const q=normalize($('#qsaSearch')?.value||''),only=$('#qsaOnlySaved')?.checked===true;
let count=0;const cards=$$('.qsa-card');
for(const card of cards){const show=(!q||normalize(card.dataset.title).includes(q))&&(!only||saved.favorites.includes(card.dataset.id));card.hidden=!show;if(show)count++}
const label=$('#qsaResults');if(label)label.textContent='عرض '+count+' من '+cards.length+' حلقات';
const empty=$('#qsaNoResult');if(empty)empty.hidden=count>0;
}
function showLast(){const wrapper=$('#qsaLast'),link=$('#qsaLastLink');if(!wrapper||!link||!saved.last)return;
const last=saved.last;
if(!/^118(69[5-9]|70[0-4])$/.test(String(last.id||'')))return;
const anchor=$$('a[data-open-episode]').find(a=>a.dataset.openEpisode===String(last.id));
if(!anchor||!isTrustedPublisherLink(anchor))return;
wrapper.hidden=false;link.href=anchor.href;link.dataset.openEpisode=last.id;link.textContent='العودة إلى '+(last.title||'التسجيل السابق')+' ↗';
}
function theme(){
const header=document.querySelector('.qmp3-site-header');if(!header)return;
let button=header.querySelector('#themeToggle');
if(!button){button=document.createElement('button');button.id='themeToggle';button.type='button';button.className='theme-toggle';const nav=header.querySelector('#navToggle');if(nav)nav.before(button);else header.querySelector('.header-inner')?.append(button)}
function set(on){document.body.classList.toggle('dark',on);button.textContent=on?'☀':'◐';button.setAttribute('aria-label',on?'تفعيل الوضع النهاري':'تفعيل الوضع الليلي');try{localStorage.setItem('qmp3-theme',on?'dark':'light')}catch{}}
let old=false;try{old=localStorage.getItem('qmp3-theme')==='dark'}catch{}
set(old);button.addEventListener('click',()=>set(!document.body.classList.contains('dark')));
}
function init(){
$$('[data-favorite]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.favorite;if(saved.favorites.includes(id))saved.favorites=saved.favorites.filter(x=>x!==id);else saved.favorites.push(id);persist();updateFav();results()}));
updateFav();
document.addEventListener('click',e=>{const link=e.target.closest('a[data-open-episode]');if(!link||!isTrustedPublisherLink(link))return;const heading=link.closest('.qsa-card,.qsa-source');const title=heading?.querySelector('h3')?.textContent.trim()||document.title; saved.last={id:link.dataset.openEpisode,title};persist();showLast()});
const form=$('#qsaFilters');if(form){
form.addEventListener('submit',e=>e.preventDefault());
$('#qsaSearch').addEventListener('input',results);
$('#qsaOnlySaved').addEventListener('change',results);
const sort=$('#qsaSort'),grid=$('#qsaCards');
const doSort=()=>{const cards=$$('.qsa-card');cards.sort((a,b)=>sort.value==='alpha'?a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent,'ar'):Number(a.dataset.order)-Number(b.dataset.order));cards.forEach(card=>grid.append(card));results()};
sort.addEventListener('change',doSort);form.addEventListener('reset',()=>requestAnimationFrame(doSort));results();showLast();
}
$('#qsaShare')?.addEventListener('click',async()=>{try{
if(navigator.share)await navigator.share({title:document.title,text:'قصص الأنبياء المسموعة بصوت الشيخ نبيل العوضي',url:location.href});
else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);const b=$('#qsaShare');b.textContent='✓ تم نسخ الرابط';}
else{const b=$('#qsaShare');b.textContent='انسخ الرابط من شريط العنوان';}
}catch(e){if(e.name!=='AbortError')$('#qsaShare').textContent='تعذر النسخ، استخدم شريط العنوان'}});
requestAnimationFrame(theme);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
