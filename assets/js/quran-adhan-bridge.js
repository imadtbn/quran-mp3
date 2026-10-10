(()=>{'use strict';
const audio=document.getElementById('audio');if(!audio)return;
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('quran-adhan-audio-v1'):null;
let suspended=false,resume=false,session='',timer=null;
function onMessage(m){if(!m||m.source!=='adhan')return;
 if(m.type==='start'){
  if(suspended)return;
  resume=!audio.paused&&!audio.ended;
  if(resume){audio.pause();suspended=true;session=m.session||'';setStatus('أُوقفت التلاوة مؤقتًا أثناء الأذان');}
 }else if(m.type==='end'&&suspended&&m.session===session){
  const shouldResume=resume&&m.resume===true;
  suspended=false;resume=false;session='';
  if(shouldResume){audio.play().then(()=>setStatus('استؤنفت التلاوة بعد الأذان')).catch(()=>setStatus('اضغط تشغيل لاستئناف التلاوة'))}
  else setStatus('انتهى الأذان؛ يمكنك استئناف التلاوة يدويًا');
 }}
function setStatus(msg){const el=document.getElementById('playerStatus');if(el)el.textContent=msg}
channel?.addEventListener('message',e=>onMessage(e.data));
window.addEventListener('storage',e=>{if(e.key==='quran-adhan-audio-message'&&e.newValue){try{onMessage(JSON.parse(e.newValue))}catch{}}});
// User playback while suspended cancels automatic resume.
audio.addEventListener('play',()=>{if(suspended){suspended=false;resume=false;session=''}});
})();
