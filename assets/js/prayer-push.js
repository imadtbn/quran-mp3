(()=>{'use strict';
const $=id=>document.getElementById(id);
const status=$('pushStatus'),enable=$('pushSubscribe'),disable=$('pushUnsubscribe');
if(!status||!enable||!disable)return;
let api='',publicKey='';
const say=message=>{status.textContent=message};
function bytes(base64){const b=atob(base64.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))}
async function call(path,method='GET',body){const response=await fetch(api+path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!response.ok)throw Error('HTTP '+response.status);return response.json()}
async function boot(){
 try{
  const r=await fetch('assets/data/prayer-push-config.json',{cache:'no-store'});
  if(!r.ok)throw Error('config');
  const config=await r.json();
  if(!config.enabled||!/^https:\/\/[^/]+/.test(config.apiBaseUrl)){say('الإشعارات الخلفية غير مفعّلة بعد؛ ما زال يلزم نشر خادم Web Push.');return}
  if(!('PushManager' in window)||!('serviceWorker' in navigator)||!('Notification' in window)){say('هذا المتصفح لا يدعم اشتراكات Web Push.');return}
  api=config.apiBaseUrl.replace(/\/$/,'');
  const response=await call('/api/public-key');if(!response.publicKey)throw Error('missing_key');publicKey=response.publicKey;
  enable.disabled=false;disable.disabled=false;
  const reg=await navigator.serviceWorker.ready;
  const existing=await reg.pushManager.getSubscription();
  say(existing?'هذا الجهاز لديه اشتراك Push. يمكن تحديثه أو إلغاؤه.':'الخدمة متاحة. اضغط تفعيل للتسجيل في إشعارات الخلفية.');
 }catch{say('تعذر الاتصال بخدمة Web Push؛ التنبيهات المحلية ما زالت متاحة.')}
}
function options(){let prefs={};try{prefs=JSON.parse(localStorage.getItem('quran-prayer-prefs-v1')||'{}')}catch{};const entries=window.prayerLocations||{};const city=prefs.city||'algiers';const fallback=entries[city]||entries.algiers;const coords=city==='other'?prefs.coords:null;return {latitude:coords?.[1]??fallback[0],longitude:coords?.[2]??fallback[1],method:Number(prefs.method||19),offset:Number(prefs.offset||0),lead:Number(prefs.lead||0),enabled:prefs.enabled||['Fajr','Dhuhr','Asr','Maghrib','Isha']}}
async function sync(){if(!api)return;const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(!sub)return;await call('/api/subscriptions','POST',{subscription:sub.toJSON(),...options()})}
enable.addEventListener('click',async()=>{enable.disabled=true;try{const reg=await navigator.serviceWorker.ready;const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('يرجى منح إذن الإشعارات');const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(publicKey)});await sync();say('تم تسجيل الاشتراك لدى خادم التنبيهات. لا تُعدّ الإشعارات مؤكدة حتى تجربتها بعد إغلاق المتصفح.')}catch(e){say('تعذر تفعيل الاشتراك: '+e.message)}finally{enable.disabled=false}});
disable.addEventListener('click',async()=>{disable.disabled=true;try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub){await call('/api/subscriptions','DELETE',{endpoint:sub.endpoint});await sub.unsubscribe()}say('تم إلغاء الاشتراك وإزالته من الخادم.')}catch(e){say('تعذر إلغاء الاشتراك: '+e.message)}finally{disable.disabled=false}});
document.getElementById('saveSettings')?.addEventListener('click',()=>{sync().catch(()=>say('حُفظت الإعدادات محليًا، ولكن تعذر مزامنتها مع خادم الخلفية.'))});
window.addEventListener('prayer-location-change',()=>sync().catch(()=>{}));
boot();
})();