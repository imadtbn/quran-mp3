/* Shared ads: single loader; content-only placements without reserving blank headers. */
(()=>{'use strict';
const client='ca-pub-5656416032906373';
const slots=[{id:'3143411927',format:'auto',type:'display'},{id:'7867079394',format:'fluid',layout:'-fr+57+4a-dc+8g',type:'native'},{id:'6528123169',format:'autorelaxed',type:'multiplex'}];
function mount(){
 const style=document.createElement('style');style.textContent='.quran-ad-placement{display:block;position:relative;box-sizing:border-box;float:none;clear:both;width:calc(100% - 32px);max-width:960px;min-width:0;margin:20px auto;padding:0;overflow:hidden;contain:layout paint;isolation:isolate;min-height:1px;transform:none!important}.quran-ad-placement[data-loaded="1"]{min-height:90px}.quran-ad-placement ins.adsbygoogle{display:block!important;box-sizing:border-box;width:100%!important;max-width:100%!important;min-width:0!important;margin:0 auto;overflow:hidden}.quran-ad-placement iframe{max-width:100%!important}@media(max-width:600px){.quran-ad-placement{width:calc(100% - 24px);max-width:100%;margin:12px auto}.quran-ad-placement[data-loaded="1"]{min-height:70px}}html,body{max-width:100%;overflow-x:clip}body>*{min-width:0}.quran-ad-placement *{max-width:100%}';document.head.append(style);
 const main=document.querySelector('main');if(!main||document.querySelector('[data-quran-ad]'))return;
 // Keep generated ad units in normal document flow and recalculate only when their container can fit a responsive unit.
 const children=[...main.children].filter(el=>!el.matches('script,style'));
 const targets=[children[Math.min(1,children.length-1)],children[Math.max(1,Math.floor(children.length/2))],children[children.length-1]].filter(Boolean);
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);show(entry.target)}
 },{rootMargin:'350px 0px'}):null;
 function show(el){
  if(el.dataset.loaded)return;
  // AdSense responsive units cannot size narrow columns (e.g. 81px).
  const width=Math.floor(el.getBoundingClientRect().width);
  if(width<300){el.dataset.skipped='narrow';return;}
  if(el.closest('.site-header,.hero,.qmp3-unified-hero,#mainNav')){el.dataset.skipped='unsafe-placement';return;}
  el.dataset.loaded='1';
  const index=Number(el.dataset.quranAd),slot=slots[index],ins=document.createElement('ins');
  ins.className='adsbygoogle';ins.style.display='block';ins.dataset.adClient=client;ins.dataset.adSlot=slot.id;ins.dataset.adFormat=slot.format;
  if(slot.layout)ins.dataset.adLayoutKey=slot.layout;
  if(slot.format==='auto')ins.dataset.fullWidthResponsive='true';
  el.append(ins);
  try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){console.warn('AdSense initialization',e)}
 }
 targets.forEach((target,i)=>{
  if(!target||!slots[i])return;
  const aside=document.createElement('aside');aside.className='quran-ad-placement';aside.style.cssText='min-width:0;';aside.dataset.quranAd=String(i);aside.setAttribute('aria-label','مساحة إعلانية');
  target.insertAdjacentElement('afterend',aside);
  observer?observer.observe(aside):show(aside);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

/* Shared navigation for all catalog pages (no duplicate header handlers). */
(()=>{if(document.querySelector('script[src*="site-shell.js"]'))return;const s=document.createElement('script');s.src=new URL('site-shell.js',document.currentScript.src).href;s.defer=true;document.head.append(s)})();
