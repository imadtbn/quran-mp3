(()=>{'use strict';
const $=id=>document.getElementById(id);
const cities={algiers:['الجزائر العاصمة',36.7538,3.0588],oran:['وهران',35.6987,-0.6349],constantine:['قسنطينة',36.365,6.6147],annaba:['عنابة',36.9,7.7667],blida:['البليدة',36.47,2.83],tizi:['تيزي وزو',36.716,4.05],setif:['سطيف',36.19,5.41],batna:['باتنة',35.56,6.18],bejaia:['بجاية',36.75,5.07],tlemcen:['تلمسان',34.88,-1.31],chlef:['الشلف',36.16,1.33],djelfa:['الجلفة',34.67,3.26],biskra:['بسكرة',34.85,5.73],ouargla:['ورقلة',31.95,5.33],ghardaia:['غرداية',32.49,3.67],adrar:['أدرار',27.87,-0.29],tamanrasset:['تمنراست',22.79,5.52]};
Object.assign(cities, Object.fromEntries([["laghouat","الأغواط",33.8,2.87],["oum_bouaghi","أم البواقي",35.88,7.11],["bechar","بشار",31.62,-2.22],["bouira","البويرة",36.37,3.9],["tebessa","تبسة",35.4,8.12],["tiaret","تيارت",35.37,1.32],["jijel","جيجل",36.82,5.77],["saida","سعيدة",34.84,0.15],["skikda","سكيكدة",36.88,6.9],["sidi_bel_abbes","سيدي بلعباس",35.19,-0.64],["guelma","قالمة",36.46,7.43],["medea","المدية",36.26,2.75],["mostaganem","مستغانم",35.93,0.09],["msila","المسيلة",35.71,4.54],["mascara","معسكر",35.4,0.14],["el_bayadh","البيض",33.68,1.02],["illizi","إليزي",26.51,8.48],["bordj_bou_arreridj","برج بوعريريج",36.07,4.76],["boumerdes","بومرداس",36.76,3.48],["el_tarf","الطارف",36.77,8.31],["tindouf","تندوف",27.67,-8.15],["tissemsilt","تيسمسيلت",35.61,1.81],["el_oued","الوادي",33.37,6.86],["khenchela","خنشلة",35.44,7.14],["souk_ahras","سوق أهراس",36.28,7.95],["tipaza","تيبازة",36.59,2.45],["mila","ميلة",36.45,6.26],["ain_defla","عين الدفلى",36.26,1.97],["naama","النعامة",33.27,-0.31],["ain_temouchent","عين تموشنت",35.3,-1.14],["relizane","غليزان",35.74,0.56],["timimoun","تيميمون",29.26,0.23],["bordj_badji_mokhtar","برج باجي مختار",21.33,0.95],["ouled_djellal","أولاد جلال",34.42,5.07],["beni_abbes","بني عباس",30.13,-2.17],["in_salah","عين صالح",27.19,2.49],["in_guezzam","عين قزام",19.57,5.77],["touggourt","تقرت",33.11,6.07],["djanet","جانت",24.55,9.48],["el_mghair","المغير",33.95,5.92],["el_meniaa","المنيعة",30.57,2.88],["aflou","أفلو",34.11,2.1],["barika","بريكة",35.39,5.37],["el_kantara","القنطرة",35.22,5.7],["bir_el_ater","بئر العاتر",34.74,8.06],["el_aricha","العريشة",34.22,-1.25],["ksar_chellala","قصر الشلالة",35.21,2.32],["ain_oussara","عين وسارة",35.45,2.91],["messaad","مسعد",34.15,3.5],["ksar_el_boukhari","قصر البخاري",35.89,2.75],["bou_saada","بوسعادة",35.21,4.18],["el_abiodh_sidi_cheikh","الأبيض سيدي الشيخ",32.89,0.55]].map(([id,name,lat,lon])=>[id,[name,lat,lon]])));
window.prayerLocations=Object.fromEntries(Object.entries(cities).map(([id,v])=>[id,[v[1],v[2]]]));
const prayers=[['Fajr','الفجر'],['Sunrise','الشروق'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];
const alarmNames=new Set(['Fajr','Dhuhr','Asr','Maghrib','Isha']);
const key='quran-prayer-prefs-v1',cacheKey='quran-prayer-day-v1-';
let settings={city:'algiers',method:'19',lead:0,offset:0,enabled:[...alarmNames],coords:null},day=null,tomorrow=null,zone='Africa/Algiers',currentDate='',lastTrigger=new Set(),testTimer=null;
try{settings={...settings,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{}
if(!cities[settings.city]&&(settings.city!=='other'||!Array.isArray(settings.coords)))settings.city='algiers';
const select=$('citySelect');for(const [id,c] of Object.entries(cities)){if(![...select.options].some(o=>o.value===id)){const option=new Option(c[0],id);select.add(option,select.options.length-1)}}
$('citySelect').value=settings.city;$('methodSelect').value=settings.method;$('reminderLead').value=String(settings.lead);$('minuteOffset').value=String(settings.offset||0);
document.querySelectorAll('[data-prayer]').forEach(el=>el.checked=settings.enabled.includes(el.dataset.prayer));
function save(){try{localStorage.setItem(key,JSON.stringify(settings))}catch{}}
function dateInZone(d=new Date()){const pieces=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const v=Object.fromEntries(pieces.map(x=>[x.type,x.value]));return v.year+'-'+v.month+'-'+v.day}
function clockMinutes(d=new Date()){const ps=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d);const v=Object.fromEntries(ps.map(x=>[x.type,Number(x.value)]));return v.hour*60+v.minute+v.second/60}
function addDate(date,days){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
function timeVal(s){const m=/^(\d{1,2}):(\d{2})/.exec(s||'');return m&&Number(m[1])<24&&Number(m[2])<60?Number(m[1])*60+Number(m[2]):NaN}
function adjusted(s){const n=timeVal(s);if(!Number.isFinite(n))return NaN;return (n+Math.max(-10,Math.min(10,Number(settings.offset)||0))+1440)%1440}
function clockText(n){return Number.isFinite(n)?String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0'):'--:--'}
function loc(){return settings.city==='other'&&settings.coords?settings.coords:cities[settings.city]||cities.algiers}
async function loadDate(date){const place=loc(),cacheId=cacheKey+date+'-'+place[1].toFixed(4)+'-'+place[2].toFixed(4)+'-'+settings.method;let cached=null;try{cached=JSON.parse(localStorage.getItem(cacheId)||'null')}catch{}if(cached&&cached.date===date&&cached.timings?.Fajr&&cached.timezone)return {...cached,cached:true};let d=date.split('-');const u=new URL('https://api.aladhan.com/v1/timings/'+d[2]+'-'+d[1]+'-'+d[0]);u.searchParams.set('latitude',place[1]);u.searchParams.set('longitude',place[2]);u.searchParams.set('method',settings.method);
const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(u,{signal:controller.signal});if(!r.ok)throw Error('fetch');const j=await r.json();if(j.code!==200||!j.data?.timings||!j.data?.meta?.timezone)throw Error('invalid');const obj={timings:j.data.timings,timezone:j.data.meta.timezone,date};try{localStorage.setItem(cacheId,JSON.stringify(obj))}catch{}return obj}finally{clearTimeout(timer)}}
let requestId=0;
async function refresh(){const seq=++requestId;day=null;tomorrow=null;$('prayerGrid').textContent='جارٍ تحميل المواقيت…';$('nextName').textContent='جارٍ تحميل المواقيت…';const date=dateInZone();try{const data=await loadDate(date);if(seq!==requestId)return;day=data;zone=data.timezone;currentDate=dateInZone();if(currentDate!==date){day=await loadDate(currentDate)}if(seq!==requestId)return;$('sourceStatus').textContent=day.cached?'بيانات محفوظة':'مواقيت حسابية';$('locationStatus').textContent='الموقع: '+loc()[0]+' — التوقيت: '+zone;render();loadTomorrow(seq)}catch(e){if(seq!==requestId)return;$('prayerGrid').textContent='تعذر تحميل المواقيت. تحقق من الاتصال بالإنترنت.';$('nextName').textContent='المواقيت غير متاحة';$('sourceStatus').textContent='تعذر الاتصال';$('locationStatus').textContent='لم يتم الحصول على بيانات مواقيت موثوقة.'}}
async function loadTomorrow(seq){try{const d=await loadDate(addDate(currentDate,1));if(seq===requestId){tomorrow=d;tick()}}catch{}}
function nextEvent(){if(!day)return null;const now=clockMinutes(),list=prayers.filter(p=>alarmNames.has(p[0]));for(const [id,label] of list){const t=adjusted(day.timings[id]);if(Number.isFinite(t)&&t>now)return{id,label,t,remaining:(t-now)*60}}if(tomorrow){const t=adjusted(tomorrow.timings.Fajr);if(Number.isFinite(t))return{id:'Fajr',label:'الفجر',t,remaining:(1440-now+t)*60,tomorrow:true}}return null}
function render(){if(!day)return;const grid=$('prayerGrid');grid.replaceChildren();const next=nextEvent();for(const [id,label] of prayers){const card=document.createElement('div');card.className='prayer-card'+(next&&!next.tomorrow&&next.id===id?' is-next':'');const name=document.createElement('span');name.textContent=label;const time=document.createElement('strong');time.textContent=clockText(adjusted(day.timings[id]));card.append(name,time);grid.append(card)}$('todayLabel').textContent='التاريخ: '+currentDate;tick()}
function tick(){if(!day)return;if(dateInZone()!==currentDate){refresh();return}const n=nextEvent();if(!n){$('nextName').textContent='جارٍ تجهيز مواقيت الغد';$('nextTime').textContent='--:--';$('countdown').textContent='--:--:--';return}$('nextName').textContent=n.label+(n.tomorrow?' (غدًا)':'');$('nextTime').textContent=String(Math.floor(n.t/60)).padStart(2,'0')+':'+String(Math.floor(n.t%60)).padStart(2,'0');let s=Math.max(0,Math.ceil(n.remaining));$('countdown').textContent=[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':');document.querySelectorAll('.prayer-card').forEach((c,i)=>c.classList.toggle('is-next',!n.tomorrow&&prayers[i][0]===n.id));checkAlarms()}
async function sendPrayerAlarm(id,label,mode,date=currentDate){
 const ident=[date,id,mode,settings.city,settings.method,settings.offset].join('-');
 const storageKey='quran-prayer-alert-'+ident;
 if(lastTrigger.has(ident))return false;
 try{if(localStorage.getItem(storageKey))return false}catch{}
 const title=mode==='before'?'اقترب وقت صلاة '+label:'حان وقت صلاة '+label;
 await showPrayerNotification(title,'مواقيت الصلاة — '+loc()[0],'prayer-'+ident);
 lastTrigger.add(ident);
 try{localStorage.setItem(storageKey,String(Date.now()))}catch{}
 return true;
}
function checkAlarms(){
 if(!day||!('Notification' in window)||Notification.permission!=='granted')return;
 const now=clockMinutes();
 for(const [id,label] of prayers){
  if(!alarmNames.has(id)||!settings.enabled.includes(id))continue;
  const t=adjusted(day.timings[id]);if(!Number.isFinite(t))continue;
  // The entry-time reminder and optional early reminder are independent.
  const alarms=[{mode:'at',target:t}];
  if(Number(settings.lead)>0)alarms.push({mode:'before',target:t-Number(settings.lead)});
  for(const a of alarms){
   if(now>=a.target&&now<a.target+2){
    sendPrayerAlarm(id,label,a.mode).catch(()=>{$('notificationStatus').textContent='تعذر إرسال إشعار الصلاة، يرجى تشغيل الاختبار التجريبي.'});
   }
  }
 }
}
$('citySelect').addEventListener('change',()=>{if($('citySelect').value==='other'&&!settings.coords){$('citySelect').value=settings.city;$('locationStatus').textContent='اضغط على تحديد موقعي أولًا للحصول على الإحداثيات.';return}settings.city=$('citySelect').value;save();refresh();window.dispatchEvent(new Event('prayer-location-change'))});
$('methodSelect').addEventListener('change',()=>{settings.method=$('methodSelect').value;save();refresh()});
$('locateBtn').addEventListener('click',()=>{if(!navigator.geolocation){$('locationStatus').textContent='المتصفح لا يدعم تحديد الموقع.';return}$('locationStatus').textContent='جارٍ تحديد موقعك…';navigator.geolocation.getCurrentPosition(p=>{settings.coords=['موقعي الحالي',p.coords.latitude,p.coords.longitude];settings.city='other';$('citySelect').value='other';save();refresh()},()=>{$('locationStatus').textContent='تعذر تحديد الموقع؛ يمكنك اختيار المدينة يدويًا.'},{enableHighAccuracy:false,timeout:11000,maximumAge:300000})});
$('saveSettings').addEventListener('click',()=>{settings.lead=Number($('reminderLead').value);settings.offset=Number($('minuteOffset').value);settings.enabled=[...document.querySelectorAll('[data-prayer]:checked')].map(el=>el.dataset.prayer);save();render();$('notificationStatus').textContent='حُفظت الإعدادات على الجهاز. سيعمل التنبيه أثناء بقاء الصفحة مفتوحة.'});
$('enableNotifications').addEventListener('click',async()=>{if(!('Notification' in window)){$('notificationStatus').textContent='هذا المتصفح لا يدعم إشعارات الويب.';return}try{const permission=await Notification.requestPermission();$('notificationStatus').textContent=permission==='granted'?'تم السماح بالإشعارات أثناء فتح الصفحة.':permission==='denied'?'الإشعارات محظورة من إعدادات المتصفح.':'لم يتم منح الإذن.'}catch{$('notificationStatus').textContent='تعذر طلب إذن الإشعارات.'}});

async function showPrayerNotification(title,body,tag){
 if(!('Notification' in window))throw Error('notifications-unsupported');
 if(Notification.permission!=='granted')throw Error('notifications-denied');
 const options={body,icon:new URL('assets/icons/quran.png',location.href).href,tag};
 if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.ready;if(typeof reg.showNotification!=='function')throw Error('show-notification-unsupported');await reg.showNotification(title,options);return 'worker'}
 new Notification(title,options);return 'window';
}
async function runNotificationTest(delayed=false){
 const status=$('prayerTestStatus');
 if(!('Notification' in window)){status.textContent='هذا المتصفح لا يدعم الإشعارات.';return}
 if(Notification.permission!=='granted'){status.textContent='لم يُمنح إذن الإشعارات. اضغط زر السماح أولًا.';return}
 if(delayed){
   if(testTimer!==null)clearTimeout(testTimer);
   status.textContent='تم بدء اختبار 30 ثانية. يُنصح بإبقاء الصفحة مفتوحة أولًا. قفل الهاتف قد يعلّق المؤقت.';
   testTimer=setTimeout(async()=>{testTimer=null;try{await showPrayerNotification('اختبار منبّه الصلاة','إشعار تجريبي بعد 30 ثانية — ليس موعد صلاة.','prayer-test-delayed-'+Date.now());status.textContent='أرسل المتصفح طلب عرض الإشعار. تأكد من ظهوره على شاشة الهاتف.'}catch(e){status.textContent='تعذر عرض إشعار الاختبار: '+e.message}},30000);return;
 }
 try{await showPrayerNotification('اختبار منبّه الصلاة','هذا إشعار تجريبي لا يرتبط بموعد صلاة.','prayer-test-now-'+Date.now());status.textContent='نجح طلب عرض الإشعار. تحقق من استلامه في لوحة إشعارات الهاتف.'}catch(e){status.textContent='فشل طلب الإشعار: '+e.message}
}
$('testPrayerAlarms').addEventListener('click',async()=>{
 const status=$('prayerTestStatus');
 if(!('Notification' in window)||Notification.permission!=='granted'){status.textContent='يرجى السماح بالإشعارات أولًا.';return}
 try{
  // Different tags prevent the two test notifications from replacing one another.
  await showPrayerNotification('اختبار: اقترب وقت صلاة الفجر','محاكاة التنبيه المسبق — ليس وقت صلاة فعليًا.','prayer-before-test-'+Date.now());
  await showPrayerNotification('اختبار: حان وقت صلاة الفجر','محاكاة دخول الوقت — ليس وقت صلاة فعليًا.','prayer-at-test-'+Date.now());
  status.textContent='تم طلب إشعارين: تنبيه مسبق ودخول وقت الصلاة. تأكد من استلام كليهما على الهاتف.';
 }catch(e){status.textContent='تعذر اختبار إشعارات الصلاة: '+e.message}
});
$('testNotification').addEventListener('click',()=>runNotificationTest(false));
$('testDelayedNotification').addEventListener('click',()=>runNotificationTest(true));

const nav=$('mainNav'),toggle=$('navToggle');function close(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}toggle.addEventListener('click',()=>{const o=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(o))});document.addEventListener('pointerdown',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))close()});window.addEventListener('scroll',close,{passive:true});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
refresh();setInterval(tick,1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();if(day&&dateInZone()!==currentDate)refresh()}});
})();