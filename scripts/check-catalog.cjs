#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),catalog=path.join(root,'catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(catalog,'manifest.json'),'utf8'));
const xml=fs.readFileSync(path.join(catalog,'sitemap.xml'),'utf8');
assert.equal(manifest.version,1);
let count=0;
for(const [type,entries] of Object.entries({readers:manifest.readers,riwayat:manifest.riwayat,mushafs:manifest.mushafs})){
 assert.ok(Object.keys(entries).length>0,type+' empty');
 for(const [id,url] of Object.entries(entries)){
   assert.ok(url.startsWith('catalog/'+type+'/'),id);
   const file=path.resolve(root,url);
   assert.ok(file.startsWith(catalog+path.sep),'Unsafe path '+url);
   assert.ok(fs.existsSync(file),'Missing '+url);
   const html=fs.readFileSync(file,'utf8');
   assert.ok(html.includes('<html lang="ar" dir="rtl">'),url+' RTL');
   assert.ok(html.includes('<link rel="canonical"'),url+' canonical');
   assert.ok(html.includes('application/ld+json'),url+' JSON-LD');
   assert.ok(xml.includes('https://imadtbn.github.io/quran-mp3/'+url),url+' sitemap');
   count++;
 }
}
assert.ok(count>=10,'Unexpectedly small catalog '+count);
console.log('Validated '+count+' generated pages, canonical, structured data and sitemap links.');
