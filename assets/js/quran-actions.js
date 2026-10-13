/* Decorative icons for reader controls; existing click handlers retain ownership. */
(()=>{'use strict';
 const main=document.querySelector('main');if(!main)return;
 const selector='.controls button,.qa-actions button,#qaCollapse,.offline-actions button,#searchForm button,.reading-foot button,.ayah-tools button,.bookmark-row button,.intro .back';
 const paths={book:'M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1',bookmark:'M6 3h12v18l-6-4-6 4z',play:'M8 5l11 7-11 7z',pause:'M8 5v14M16 5v14',prev:'M15 5l-7 7 7 7',next:'M9 5l7 7-7 7',download:'M12 3v12M7 10l5 5 5-5M4 17v4h16v-4',stop:'M6 6h12v12H6z',search:'M15 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0M14 14l6 6',copy:'M9 8V4h11v12h-4M4 8h12v12H4z',share:'M8 12l8-6M8 12l8 6M7 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0',trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',collapse:'M6 15l6-6 6 6',expand:'M6 9l6 6 6-6'};
 const ids={resume:'book',bookmarksToggle:'bookmark',qaPrev:'prev',qaNext:'next',prev:'prev',next:'next',saveSurah:'download',savePages:'download',cancelOffline:'stop'};
 function kind(el,label){
  if(el.id==='qaPlay')return /إيقاف/.test(label)?'pause':'play';
  if(el.id==='qaCollapse')return /إظهار/.test(label)?'expand':'collapse';
  if(ids[el.id])return ids[el.id];
  if(el.matches('#searchForm button'))return 'search';
  if(/نسخ/.test(label))return 'copy';if(/مشاركة/.test(label))return 'share';
  if(/استمع/.test(label))return 'play';if(/حذف/.test(label))return 'trash';
  if(/حفظ/.test(label))return 'bookmark';return 'book';
 }
 function decorate(){
  for(const el of main.querySelectorAll(selector)){
   const label=el.textContent.trim(),icon=kind(el,label);
   if(el.dataset.quranActionLabel===label&&el.dataset.quranActionIcon===icon&&el.querySelector('.quran-action-icon'))continue;
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   for(const [k,v] of Object.entries({class:'quran-action-icon',viewBox:'0 0 24 24',width:'18',height:'18',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'}))svg.setAttribute(k,v);
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[icon]);svg.append(path);
   const text=document.createElement('span');text.className='quran-action-label';text.textContent=label;
   el.replaceChildren(svg,text);el.classList.add('quran-action');el.dataset.quranActionLabel=label;el.dataset.quranActionIcon=icon;
  }
 }
 decorate();
 // Playback labels and selected-ayah tools are updated by their own scripts.
 new MutationObserver(records=>{
  if(records.some(r=>r.target.nodeType===1&&r.target.closest('button,a.back')||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('button,a.back')||n.querySelector('button,a.back')))))decorate();
 }).observe(main,{childList:true,subtree:true});
})();
