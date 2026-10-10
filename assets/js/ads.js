/* Shared ads: single loader; content-only placements without reserving blank headers. */
(()=>{'use strict';
const client='ca-pub-5656416032906373';
const slots=[{id:'3143411927',format:'auto',type:'display'},{id:'7867079394',format:'fluid',layout:'-fr+57+4a-dc+8g',type:'native'},{id:'6528123169',format:'autorelaxed',type:'multiplex'}];
function mount(){
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