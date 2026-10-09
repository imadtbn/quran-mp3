(()=>{
'use strict';
const $=q=>document.querySelector(q);
const state={cancelled:false,results:[],running:false};
const samples=(r,count)=>{
 const ns=r.surahs||[];
 if(!ns.length)return [];
 if(count===1)return [ns.includes(1)?1:ns[0]];
 return [...new Set([ns.includes(1)?1:ns[0],ns[Math.floor(ns.length/2)],ns[ns.length-1]])];
};
const check=(src,timeoutMs=14000)=>new Promise(resolve=>{
 const audio=document.createElement('audio');
 audio.preload='metadata';
 let done=false,timer;
 const finish=(status)=>{
  if(done)return;done=true;clearTimeout(timer);
  audio.removeAttribute('src');audio.load();resolve(status);
 };
 audio.addEventListener('loadedmetadata',()=>finish('جاهز: بيانات صوتية محمّلة'),{once:true});
 audio.addEventListener('error',()=>finish('فشل تحميل الصوت'),{once:true});
 timer=setTimeout(()=>finish('انتهت المهلة / تعذر الوصول'),timeoutMs);
 audio.src=src;audio.load();
});
function draw(){
 const success=state.results.filter(x=>x.status.startsWith('جاهز')).length;
 const failed=state.results.length-success;
 $('#summary').textContent='اختُبرت '+state.results.length+' روابط | جاهز: '+success+' | أخفق/تعذر: '+failed;
 $('#results').replaceChildren();
 for(const x of state.results){
  const tr=document.createElement('tr');
  for(const value of [x.name,x.surah,x.status]){
   const td=document.createElement('td');td.textContent=value;
   if(value===x.status)td.className=x.status.startsWith('جاهز')?'success':'fail';
   tr.append(td);
  }
  const td=document.createElement('td'),a=document.createElement('a');
  a.href=x.url;a.textContent='فحص يدوي ↗';a.target='_blank';a.rel='noopener noreferrer';td.append(a);tr.append(td);$('#results').append(tr);
 }
 $('#export').disabled=!state.results.length;
}
catalogReady.then(info=>{
 $('#catalogState').textContent=(info.online?'تم جلب الكتالوج المباشر.':'تعذر جلب الكتالوج المباشر؛ تُستخدم القائمة الاحتياطية.')+' التسجيلات المعروفة: '+RECITERS.length+'. الفحص لا يثبت صحة التسجيلات التي لم تُختبر.';
 $('#start').disabled=false;
}).catch(()=>{$('#catalogState').textContent='تعذر تحميل بيانات المصادر.'});
$('#start').addEventListener('click',async()=>{
 if(state.running)return;
 state.running=true;state.cancelled=false;state.results=[];draw();$('#start').disabled=true;$('#stop').disabled=false;
 const count=Number($('#sample').value),tasks=RECITERS.slice(0,12).flatMap(r=>samples(r,count).map(n=>({r,n,url:QuranAudio.url(r,n)}))).filter(x=>x.url);
 $('#summary').textContent='جارٍ فحص '+tasks.length+' روابط بالتتابع…';
 for(const task of tasks){
  if(state.cancelled)break;
  const status=await check(task.url);
  state.results.push({name:task.r.name+' · '+task.r.riwaya,surah:task.n,status,url:task.url});
  draw();
  await new Promise(r=>setTimeout(r,100));
 }
 state.running=false;$('#start').disabled=false;$('#stop').disabled=true;
});
$('#stop').addEventListener('click',()=>{state.cancelled=true;$('#stop').disabled=true});
$('#export').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({createdAt:new Date().toISOString(),userAgent:navigator.userAgent,results:state.results},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='quran-audio-diagnostics.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
});
$('#loadManual').addEventListener('click',()=>{
 const value=$('#manualUrl').value.trim();
 if(!/^https:\/\//i.test(value)){ $('#manualStatus').textContent='أدخل رابط HTTPS صحيحًا.';return }
 $('#manualAudio').src=value;$('#manualAudio').load();$('#manualStatus').textContent='اضغط تشغيل للاستماع والتحقق يدويًا.';
});
$('#manualAudio').addEventListener('error',()=>$('#manualStatus').textContent='تعذر فتح الملف في هذا المتصفح.');
$('#manualAudio').addEventListener('playing',()=>$('#manualStatus').textContent='بدأ تشغيل الصوت.');
})();