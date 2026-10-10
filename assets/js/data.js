const SURAH_NAMES = 'الفاتحة|البقرة|آل عمران|النساء|المائدة|الأنعام|الأعراف|الأنفال|التوبة|يونس|هود|يوسف|الرعد|إبراهيم|الحجر|النحل|الإسراء|الكهف|مريم|طه|الأنبياء|الحج|المؤمنون|النور|الفرقان|الشعراء|النمل|القصص|العنكبوت|الروم|لقمان|السجدة|الأحزاب|سبأ|فاطر|يس|الصافات|ص|الزمر|غافر|فصلت|الشورى|الزخرف|الدخان|الجاثية|الأحقاف|محمد|الفتح|الحجرات|ق|الذاريات|الطور|النجم|القمر|الرحمن|الواقعة|الحديد|المجادلة|الحشر|الممتحنة|الصف|الجمعة|المنافقون|التغابن|الطلاق|التحريم|الملك|القلم|الحاقة|المعارج|نوح|الجن|المزمل|المدثر|القيامة|الإنسان|المرسلات|النبأ|النازعات|عبس|التكوير|الانفطار|المطففين|الانشقاق|البروج|الطارق|الأعلى|الغاشية|الفجر|البلد|الشمس|الليل|الضحى|الشرح|التين|العلق|القدر|البينة|الزلزلة|العاديات|القارعة|التكاثر|العصر|الهمزة|الفيل|قريش|الماعون|الكوثر|الكافرون|النصر|المسد|الإخلاص|الفلق|الناس'.split('|');
const AYAH_COUNTS=[7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];
const SURAHS=SURAH_NAMES.map((name,i)=>({n:i+1,name,ayahs:AYAH_COUNTS[i]}));
// مصادر السور الكاملة: بيانات احتياطية موثقة من دليل MP3Quran API.
// تُستبدل وتُوسع عبر الكتالوج الرسمي عند اتصال المستخدم بالإنترنت.
const RECITERS=[
  {id:'mp3-1-1',name:'إبراهيم الأخضر',short:'إبراهيم الأخضر',riwaya:'حفص عن عاصم',style:'مرتل',base:'https://server6.mp3quran.net/akdr/',surahs:Array.from({length:114},(_,i)=>i+1),source:'mp3quran'},
  {id:'mp3-265-280',name:'أحمد دبان',short:'أحمد دبان',riwaya:'قالون عن نافع',style:'مرتل',base:'https://server16.mp3quran.net/deban/Rewayat-Qalon-A-n-Nafi/',surahs:Array.from({length:114},(_,i)=>i+1),source:'mp3quran'}
];
function catalogRiwaya(label){
  const s=String(label||'').replace(/[ًٌٍَُِّْـ]/g,'');
  if(/ورش/i.test(s))return 'ورش عن نافع';
  if(/قالون/i.test(s))return 'قالون عن نافع';
  if(/حفص/i.test(s))return 'حفص عن عاصم';
  if(/شعبة/i.test(s))return 'شعبة عن عاصم';
  if(/الدوري/i.test(s))return 'الدوري';
  if(/السوسي/i.test(s))return 'السوسي';
  if(/البزي/i.test(s))return 'البزي';
  if(/قنبل/i.test(s))return 'قنبل';
  return s||'رواية غير محددة';
}
function catalogStyle(label){return /مجود|تجويد/i.test(String(label||''))?'مجود':'مرتل';}
function catalogEntry(reader,moshaf){
  if(!reader||!moshaf||!/^https:\/\//i.test(String(moshaf.server||'')))return null;
  const surahs=[...new Set(String(moshaf.surah_list||'').split(',').map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=114))].sort((a,b)=>a-b);
  if(!surahs.length)return null;
  const name=String(reader.name||'').trim();
  if(!name)return null;
  return {id:'mp3-'+reader.id+'-'+moshaf.id,name,short:name,riwaya:catalogRiwaya(moshaf.name),style:catalogStyle(moshaf.name),base:String(moshaf.server).replace(/\/?$/,'/'),surahs,source:'mp3quran',moshafName:String(moshaf.name||'')};
}
const catalogReady=(async()=>{
  // Prefer the same validated snapshot used to generate canonical pages.
  try{
    const snapshot=await fetch('catalog/recordings.json',{cache:'no-store'});
    if(snapshot.ok){
      const body=await snapshot.json();
      if(body.version===1&&Array.isArray(body.recordings)&&body.recordings.length>=10){
        const entries=body.recordings.map(item=>catalogEntry(
          {id:item.reader,name:item.name},
          {id:String(item.id).split('-').pop(),server:item.server,surah_list:item.surahs.join(','),name:item.moshaf}
        )).filter(Boolean);
        if(entries.length>=10){RECITERS.splice(0,RECITERS.length,...entries);return {online:true,count:entries.length,snapshot:true};}
      }
    }
  }catch(error){console.warn('Static catalog unavailable',error.message)}
  try{
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),4500);
    let response;
    try{response=await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar',{signal:ctrl.signal,cache:'no-store'});}
    finally{clearTimeout(timer);}
    if(!response.ok)throw new Error('Catalog HTTP '+response.status);
    const body=await response.json();
    if(!Array.isArray(body.reciters))throw new Error('Invalid catalog');
    const entries=body.reciters.flatMap(reader=>(Array.isArray(reader.moshaf)?reader.moshaf:[]).map(m=>catalogEntry(reader,m))).filter(Boolean);
    const ids=new Set();
    const unique=entries.filter(r=>!ids.has(r.id)&&ids.add(r.id));
    if(unique.length){RECITERS.splice(0,RECITERS.length,...unique);return {online:true,count:unique.length};}
  }catch(error){console.warn('مكتبة القرآن: استخدام الكتالوج الاحتياطي',error.message);}
  return {online:false,count:RECITERS.length};
})();
