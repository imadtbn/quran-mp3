(()=>{'use strict';
const $=id=>document.getElementById(id),audio=$('adhanAudio');
if(!audio)return;
const sources={
 jazaire:'Aby_Yasser_Al_Jazaire_(أبو_ياسر_الجزائري).mp3',
 abdulbasit:'Abdulbasit_Abdusamad_1_-_Egypt_(عبد_الباسط_عبد_الصمد_-_مصر).mp3',
 fajr:'Abdulbasit_Abdusamad_6_-_Fajr_Egypt_(عبد_الباسط_عبد_الصمد_-_فجر_مصر).mp3'
};
const base='https://cdn.jsdelivr.net/gh/Kiwifu/adhan-mp3@main/';
const key='quran-adhan-preferences-v1';
let prefs={voice:'jazaire',volume:60,auto:false,enabled:['Fajr','Dhuhr','Asr','Maghrib','Isha']};
try{prefs={...prefs,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{}
const valid=p=>Object.prototype.hasOwnProperty.call(sources,p);
if(!valid(prefs.voice))prefs.voice='jazaire';
const status=$('adhanStatus');
function url(){return base+encodeURIComponent(sources[prefs.voice])}
function sync(){ $('adhanVoice').value=prefs.voice;$('adhanVolume').value=String(prefs.volume);$('adhanVolumeValue').textContent=prefs.volume+'%';$('adhanAuto').checked=!!prefs.auto;document.querySelectorAll('[data-adhan-prayer]').forEach(el=>el.checked=prefs.enabled.includes(el.dataset.adhanPrayer));audio.volume=Number(prefs.volume)/100 }
function stop(){audio.pause();audio.removeAttribute('src');audio.load();status.textContent='تم إيقاف الأذان.'}
async function play(){try{audio.pause();audio.src=url();audio.volume=Number(prefs.volume)/100;await audio.play();status.textContent='جارٍ تشغيل الأذان.'}catch{status.textContent='تعذر تشغيل التسجيل. تحقق من الاتصال أو اسمح بتشغيل الصوت من المتصفح.'}}
$('adhanPreview').addEventListener('click',()=>{prefs.voice=$('adhanVoice').value;play()});
$('adhanStop').addEventListener('click',stop);
$('adhanVolume').addEventListener('input',()=>{audio.volume=Number($('adhanVolume').value)/100;$('adhanVolumeValue').textContent=$('adhanVolume').value+'%'});
$('adhanSave').addEventListener('click',()=>{prefs.voice=$('adhanVoice').value;prefs.volume=Number($('adhanVolume').value);prefs.auto=$('adhanAuto').checked;prefs.enabled=[...document.querySelectorAll('[data-adhan-prayer]:checked')].map(x=>x.dataset.adhanPrayer);try{localStorage.setItem(key,JSON.stringify(prefs))}catch{}audio.volume=prefs.volume/100;status.textContent='تم حفظ إعدادات الأذان على هذا الجهاز.'});
window.addEventListener('prayer-adhan-due',e=>{if(!prefs.auto||!prefs.enabled.includes(e.detail.id)||document.visibilityState!=='visible')return;play()});
audio.addEventListener('ended',()=>status.textContent='انتهى الأذان.');
audio.addEventListener('error',()=>status.textContent='تعذر تحميل التسجيل الصوتي من المصدر الخارجي.');
document.addEventListener('visibilitychange',()=>{if(document.hidden&& !audio.paused)stop()});
sync();
})();