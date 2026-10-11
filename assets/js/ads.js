/* Shared ads: single loader; content-only placements without reserving blank headers. */
(()=>{'use strict';
const client='ca-pub-5656416032906373';
const slots=[{id:'3143411927',format:'auto',type:'display'},{id:'7867079394',format:'fluid',layout:'-fr+57+4a-dc+8g',type:'native'},{id:'6528123169',format:'autorelaxed',type:'multiplex'}];
function mount(){
 const style=document.createElement('style');style.textContent='.quran-ad-placement{display:block;max-width:100%;min-width:0;margin:20px auto;overflow:hidden;contain:layout style;min-height:1px}.quran-ad-placement[data-loaded="1"]{min-height:90px}.quran-ad-placement ins{width:100%;max-width:100%;overflow:hidden}@media(max-width:600px){.quran-ad-placement{margin:12px auto}.quran-ad-placement[data-loaded="1"]{min-height:70px}}';document.head.append(style);
 const main=document.querySelector('main');if(!main||document.querySelector('[data-quran-ad]'))return;
 const children=[...main.children].filter(el=>!el.matches('script,style'));
 const targets=[children[Math.min(1,children.length-1)],children[Math.max(1,Math.floor(children.length/2))],children[children.length-1]].filter(Boolean);
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);show(entry.target)}
 },{rootMargin:'350px 0px'}):null;
 function show(el){
  if(el.dataset.loaded)return;el.dataset.loaded='1';
  const index=Number(el.dataset.quranAd),slot=slots[index],ins=document.createElement('ins');
  ins.className='adsbygoogle';ins.style.display='block';ins.dataset.adClient=client;ins.dataset.adSlot=slot.id;ins.dataset.adFormat=slot.format;
  if(slot.layout)ins.dataset.adLayoutKey=slot.layout;
  if(slot.format==='auto')ins.dataset.fullWidthResponsive='true';
  el.append(ins);
  try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){console.warn('AdSense initialization',e)}
 }
 targets.forEach((target,i)=>{
  if(!target||!slots[i])return;
  const aside=document.createElement('aside');aside.className='quran-ad-placement';aside.dataset.quranAd=String(i);aside.setAttribute('aria-label','مساحة إعلانية');
  target.insertAdjacentElement('afterend',aside);
  observer?observer.observe(aside):show(aside);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
/* Catalogue pages share the main navigation and breadcrumb with the home page. */
function mountMushafNavigation(){
 if(!/\\/catalog\\/mushafs\\/[^/]+\\.html$/.test(location.pathname))return;
 const header=document.querySelector('.site-header');
 if(!header||header.dataset.catalogNavReady)return;
 header.dataset.catalogNavReady='1';
 const home='../../';
 const items=[['index.html','⌂','الرئيسية'],['readers.html','♫','القراء'],['riwayat.html','☷','الروايات'],['quran.html','﴿','المصحف الرقمي'],['mushafs.html','▤','المصاحف'],['memorize.html','◎','الحفظ والمراجعة'],['adhkar.html','☀','الأذكار'],['prayer-times.html','◷','مواقيت الصلاة'],['ruqyah.html','✧','الرقية الشرعية']];
 const links=items.map(([url,icon,title])=>'<a href="'+home+url+'"'+(url==='mushafs.html'?' aria-current="page"':'')+'><span class="nav-icon" aria-hidden="true">'+icon+'</span><span>'+title+'</span></a>').join('');
 header.innerHTML='<div class="container header-inner"><a class="brand" href="'+home+'index.html" aria-label="العودة إلى الرئيسية"><span class="brand-mark" aria-hidden="true">﴿</span><span class="brand-text">مكتبة القرآن <b>الصوتية</b></span></a><nav class="main-nav" id="mainNav" aria-label="التنقل الرئيسي">'+links+'</nav><div class="header-tools"><button class="nav-toggle" id="navToggle" type="button" aria-controls="mainNav" aria-expanded="false" aria-label="فتح القائمة">☰</button></div></div>';
 const nav=header.querySelector('#mainNav'),toggle=header.querySelector('#navToggle');
 const close=()=>{nav.classList.remove('catalog-nav-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','فتح القائمة')};
 toggle.addEventListener('click',()=>{const open=nav.classList.toggle('catalog-nav-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'إغلاق القائمة':'فتح القائمة')});
 document.addEventListener('pointerdown',event=>{if(!header.contains(event.target))close()});
 document.addEventListener('scroll',close,{passive:true});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))close()});
 const main=document.querySelector('main');
 if(main&&!document.querySelector('.qmp3-breadcrumb')){
  const name=(main.querySelector('h1')?.textContent||document.title.split('|')[0]).trim();
  const crumbs=document.createElement('nav');crumbs.className='qmp3-breadcrumb';crumbs.setAttribute('aria-label','مسار التنقل');
  crumbs.innerHTML='<a href="'+home+'index.html">الرئيسية</a><span class="bc-separator" aria-hidden="true">/</span><a href="'+home+'mushafs.html">المصاحف</a><span class="bc-separator" aria-hidden="true">/</span><span aria-current="page"></span>';
  crumbs.querySelector('[aria-current="page"]').textContent=name;
  main.before(crumbs);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountMushafNavigation,{once:true});else mountMushafNavigation();
