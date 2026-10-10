#!/usr/bin/env node
// Generates indexable pages exclusively from the provider's declared recordings.
// Requires Node 20+. Fail closed: any API/validation failure keeps previous published output.
const fs=require('node:fs/promises'), path=require('node:path');
const ORIGIN='https://imadtbn.github.io/quran-mp3/';
const ENDPOINT='https://www.mp3quran.net/api/v3/reciters?language=ar';
const ROOT=path.resolve(__dirname,'..');
const OUTPUT=path.join(ROOT,'catalog');
const xml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const slug=s=>String(s).normalize('NFKC').trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').slice(0,85);
const asId=n=>/^\d+$/.test(String(n))?String(n):null;
const riwaya=s=>/ورش/.test(s)?'ورش عن نافع':/قالون/.test(s)?'قالون عن نافع':/حفص/.test(s)?'حفص عن عاصم':/شعبة/.test(s)?'شعبة عن عاصم':String(s||'رواية غير محددة').trim();
const html=(title,description,relative,links,type='CollectionPage')=>{
 const canonical=ORIGIN+relative, structured=JSON.stringify({'@context':'https://schema.org','@type':type,name:title,description,url:canonical,inLanguage:'ar'}).replace(/</g,'\\u003c');
 return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+xml(title)+' | مكتبة القرآن الصوتية</title><meta name="description" content="'+xml(description)+'"><link rel="canonical" href="'+canonical+'"><meta property="og:type" content="website"><meta property="og:title" content="'+xml(title)+'"><meta property="og:description" content="'+xml(description)+'"><meta property="og:url" content="'+canonical+'"><link rel="stylesheet" href="../../assets/css/style.css"><script type="application/ld+json">'+structured+'</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5656416032906373" crossorigin="anonymous"></script></head><body><header class="site-header"><div class="container header-inner"><a class="brand" href="../../index.html">مكتبة القرآن الصوتية</a><a href="../../readers.html">القراء والروايات ←</a></div></header><main class="container" style="padding:35px 0 170px"><h1>'+xml(title)+'</h1><p>'+xml(description)+'</p><section class="surah-grid" style="margin-top:24px">'+links.map(l=>'<a class="surah-card" style="display:block;text-decoration:none" href="'+xml(l.href)+'"><h2 style="font-size:1.1rem">'+xml(l.title)+'</h2><p>'+xml(l.sub||'فتح التسجيل')+'</p></a>').join('')+'</section></main><footer class="site-footer">الصوتيات من مصادر خارجية</footer><script defer src="../../assets/js/ads.js"></script></body></html>';
};
const fetchJson=async()=>{
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),25000);
 try{const r=await fetch(ENDPOINT,{signal:c.signal,headers:{accept:'application/json'}});if(!r.ok)throw Error('API '+r.status);return await r.json()}finally{clearTimeout(timer)}
};
async function main(){
 const payload=await fetchJson();
 if(!Array.isArray(payload.reciters)||payload.reciters.length<10)throw Error('Untrusted/incomplete catalog: refusing to overwrite output');
 const readers=new Map(),riwayat=new Map(),recordings=[];
 for(const reader of payload.reciters){
  const name=String(reader.name||'').trim(),id=asId(reader.id);
  if(!name||!id||!Array.isArray(reader.moshaf))continue;
  for(const m of reader.moshaf){
   const mid=asId(m.id),server=String(m.server||'');
   let host;try{host=new URL(server)}catch{continue}
   if(!mid||host.protocol!=='https:'||!(host.hostname==='mp3quran.net'||host.hostname.endsWith('.mp3quran.net')))continue;
   const surahs=[...new Set(String(m.surah_list||'').split(',').map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=114))].sort((a,b)=>a-b);
   if(!surahs.length)continue;
   const recording={id:'mp3-'+id+'-'+mid,reader:id,name,riwaya:riwaya(m.name),moshaf:String(m.name||''),surahs,server};
   if(recordings.some(r=>r.id===recording.id))continue;
   recordings.push(recording);
   if(!readers.has(id))readers.set(id,{id,name,recordings:[]});
   readers.get(id).recordings.push(recording);
   if(!riwayat.has(recording.riwaya))riwayat.set(recording.riwaya,[]);
   riwayat.get(recording.riwaya).push(recording);
  }
 }
 if(recordings.length<10)throw Error('No sufficient validated recordings; publish aborted');
 const tmp=OUTPUT+'.tmp-'+process.pid;await fs.rm(tmp,{recursive:true,force:true});
 const pages=[],manifest={version:1,source:ENDPOINT,createdAt:new Date().toISOString(),readers:{},riwayat:{},mushafs:{}};
 const write=async(relative,content)=>{const file=path.join(tmp,relative);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,content);pages.push('catalog/'+relative)};
 for(const r of readers.values()){
  const relative='readers/'+r.id+'.html';manifest.readers[r.name]='catalog/'+relative;
  await write(relative,html(r.name,'تلاوات القارئ '+r.name+' والمصاحف المتاحة.', 'catalog/'+relative,r.recordings.map(m=>({title:m.moshaf||m.riwaya,sub:m.riwaya,href:'../mushafs/'+m.id+'.html'})),'ProfilePage'));
 }
 for(const [name,ms] of riwayat){
  const relative='riwayat/'+slug(name)+'.html';manifest.riwayat[name]='catalog/'+relative;
  await write(relative,html('رواية '+name,'المصاحف والتسجيلات المتاحة برواية '+name,'catalog/'+relative,ms.map(m=>({title:m.name+' — '+m.moshaf,href:'../mushafs/'+m.id+'.html'}))));
 }
 for(const m of recordings){
  const relative='mushafs/'+m.id+'.html';manifest.mushafs[m.id]='catalog/'+relative;
  await write(relative,html(m.name+' — '+m.moshaf,'تلاوات '+m.name+' برواية '+m.riwaya+'، عدد السور المتاحة: '+m.surahs.length,'catalog/'+relative,m.surahs.map(n=>({title:'سورة '+n,sub:'استماع',href:'../../mushaf.html?id='+encodeURIComponent(m.id)+'&surah='+n})),'CollectionPage'));
 }
 await fs.writeFile(path.join(tmp,'recordings.json'),JSON.stringify({version:1,source:ENDPOINT,recordings},null,2));
 await fs.writeFile(path.join(tmp,'manifest.json'),JSON.stringify(manifest,null,2));
 await fs.writeFile(path.join(tmp,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>'+ORIGIN+p+'</loc></url>').join('')+'</urlset>');
 await fs.rm(OUTPUT,{recursive:true,force:true});await fs.rename(tmp,OUTPUT);
 console.log(JSON.stringify({readers:readers.size,riwayat:riwayat.size,recordings:recordings.length,pages:pages.length}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
