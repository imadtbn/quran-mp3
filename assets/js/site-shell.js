/* Shared responsive header and hero for the Quran MP3 library. */
(()=>{'use strict';
const current=document.currentScript;
const base=new URL('../../',current.src);
const page=location.pathname.split('/').pop()||'index.html';
const catalog=location.pathname.includes('/catalog/');
const entries=[['index.html','⌂','الرئيسية'],['readers.html','♫','القراء'],['riwayat.html','☷','الروايات'],['quran.html','﴿','المصحف الرقمي'],['mushafs.html','▤','المصاحف'],['memorize.html','◎','الحفظ والمراجعة'],['adhkar.html','☀','الأذكار'],['prayer-times.html','◷','مواقيت الصلاة'],['ruqyah.html','✧','الرقية الشرعية']];
function href(path){return new URL(path,base).href}
function active(path){if(catalog)return location.pathname.includes('/readers/')?path==='readers.html':location.pathname.includes('/riwayat/')?path==='riwayat.html':path==='mushafs.html';return page===path}
function initialize(){
 if(document.documentElement.dataset.shellReady)return;
 // Existing interactive headers own their controls and handlers; never replace them.
 if(document.querySelector('.site-header #mainNav'))return;
 document.documentElement.dataset.shellReady='1';
 const css=document.createElement('link');css.rel='stylesheet';css.href=href('assets/css/site-shell.css?v=20261013-nav');document.head.append(css);
 let header=document.querySelector('.site-header,header.top');
 if(!header)return;
 header.className='site-header qmp3-site-header';
 const links=entries.map(([path,ico,title])=>'<a href="'+href(path)+'"'+(active(path)?' aria-current="page"':'')+'><span class="nav-icon" aria-hidden="true">'+ico+'</span><span>'+title+'</span></a>').join('');
 header.innerHTML='<div class="container header-inner"><a class="brand" href="'+href('index.html')+'" aria-label="مكتبة القرآن الصوتية - الرئيسية"><img class="qmp3-brand-icon" src="'+href('assets/icons/quran.png')+'" width="40" height="40" alt=""><span class="brand-text">مكتبة القرآن <b>الصوتية</b></span></a><nav class="main-nav" id="mainNav" aria-label="التنقل الرئيسي">'+links+'</nav><button class="nav-toggle" id="navToggle" type="button" aria-controls="mainNav" aria-expanded="false" aria-label="فتح قائمة التنقل">☰</button></div>';
 const extra=document.querySelector('.qmp3-global-nav');if(extra)extra.remove();
 const nav=header.querySelector('#mainNav'),toggle=header.querySelector('#navToggle');
 const close=()=>{nav.classList.remove('qmp3-open','open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','فتح قائمة التنقل')};
 toggle.addEventListener('click',e=>{e.stopPropagation();const open=nav.classList.toggle('qmp3-open');nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'إغلاق قائمة التنقل':'فتح قائمة التنقل')});
 document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close()});
 document.addEventListener('scroll',close,{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
 const main=document.querySelector('main');if(!main)return;
 let hero=main.querySelector(':scope > .hero,:scope > .prayer-hero,:scope > .rq-hero,:scope > .adhkar-hero,:scope > .intro,:scope > .page-hero,:scope > .memorize-hero');
 if(!hero){hero=main.querySelector('section.hero,section.prayer-hero,section.rq-hero,section.intro,section.page-hero');}
 if(!hero&&catalog){
  const heading=main.querySelector(':scope > h1');const description=heading?.nextElementSibling;
  if(heading){hero=document.createElement('section');hero.className='qmp3-generated-hero';const inner=document.createElement('div');inner.className='container';heading.before(hero);hero.append(inner);inner.append(heading);if(description?.tagName==='P')inner.append(description)}
 }
 if(!hero&&!document.querySelector('.hero,.prayer-hero,.rq-hero')){
  const heading=main.querySelector(':scope > h1');
  if(heading){hero=document.createElement('section');hero.className='qmp3-generated-hero';const inner=document.createElement('div');inner.className='container';heading.before(hero);hero.append(inner);inner.append(heading);const p=hero.nextElementSibling;if(p?.tagName==='P')inner.append(p)}
 }
 if(hero)hero.classList.add('qmp3-unified-hero');
 if(catalog&&!document.querySelector('.qmp3-breadcrumb')){
  const crumbs=document.createElement('nav');crumbs.className='qmp3-breadcrumb';crumbs.setAttribute('aria-label','مسار التنقل');
  const section=location.pathname.includes('/readers/')?'readers.html':location.pathname.includes('/riwayat/')?'riwayat.html':'mushafs.html';
  const sectionName=section==='readers.html'?'القراء':section==='riwayat.html'?'الروايات':'المصاحف';
  crumbs.innerHTML='<a href="'+href('index.html')+'">الرئيسية</a><span class="bc-separator" aria-hidden="true">/</span><a href="'+href(section)+'">'+sectionName+'</a><span class="bc-separator" aria-hidden="true">/</span><span aria-current="page"></span>';
  crumbs.querySelector('[aria-current="page"]').textContent=(main.querySelector('h1')?.textContent||document.title.split('|')[0]).trim();
  header.after(crumbs);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
