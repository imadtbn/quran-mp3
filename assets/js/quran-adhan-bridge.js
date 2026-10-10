/* Coordinates adhan with Quran players across open tabs; no background audio guarantee. */
(()=>{'use strict';
const audio=['audio','qaAudio','detailsAudio'].map(id=>document.getElementById(id)).find(Boolean);
if(!audio)return;
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('quran-adhan-audio-v1'):null;
const statusIds={audio:'playerStatus',qaAudio:'qaStatus',detailsAudio:'nowPlaying'};
let pausedForAdhan=false,session='',wasPlaying=false,manualOverride=false;
let pendingResume=false;
const status=message=>{const el=document.getElementById(statusIds[audio.id]);if(el)el.textContent=message};
async function message(m){
 if(!m||m.source!=='adhan'||!m.session)return;
 if(m.type==='start'){
  if(pausedForAdhan){if(session!==m.session){session=m.session;manualOverride=false}return}
  if(audio.paused||audio.ended)return;
  wasPlaying=true;manualOverride=false;pausedForAdhan=true;session=m.session;
  audio.pause();status('توقفت التلاوة مؤقتًا أثناء الأذان');
 }else if(m.type==='end'&&pausedForAdhan&&session===m.session){
  const resume=wasPlaying&&m.resume===true&&!manualOverride;
  pausedForAdhan=false;wasPlaying=false;session='';
  if(resume){try{await audio.play();pendingResume=false;status('استؤنفت التلاوة بعد الأذان')}catch{pendingResume=true;status('تعذر الاستئناف التلقائي؛ اضغط تشغيل لاستئناف التلاوة')}}
  else{pendingResume=false;status('انتهى الأذان. يمكنك متابعة التلاوة يدويًا')}
 }
}
channel?.addEventListener('message',event=>message(event.data));
window.addEventListener('storage',event=>{if(event.key==='quran-adhan-audio-message'&&event.newValue){try{message(JSON.parse(event.newValue))}catch{}}});
audio.addEventListener('play',()=>{if(pausedForAdhan){manualOverride=true;pausedForAdhan=false;wasPlaying=false;session=''}if(pendingResume)pendingResume=false});
audio.addEventListener('emptied',()=>{if(pausedForAdhan){manualOverride=true;pausedForAdhan=false;wasPlaying=false;session=''}});
})();
