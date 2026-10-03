"""Run after changing static site files, before pushing to GitHub Pages."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent.parent
core=['index.html','glossary.html','app.js','pwa.js','design.css','manifest.webmanifest','SOURCES.md','glossary-assets/tex-svg.js','glossary-assets/lucide.min.js']+[str(p.relative_to(root)) for p in sorted((root/'icons').glob('*'))]
assets=sorted(set(core+[str(p.relative_to(root)) for p in (root/'glossary-assets').iterdir() if p.is_file()]))
hash_input=Path(__file__).read_bytes()+b''.join(p.encode()+hashlib.sha256((root/p).read_bytes()).digest() for p in assets)
version=hashlib.sha256(hash_input).hexdigest()[:12]
mb=round(sum((root/p).stat().st_size for p in assets)/1024**2,1)
header=f"const VERSION='{version}';\nconst CORE={json.dumps(core)};\nconst ASSETS={json.dumps(assets)};\nconst MEGABYTES={mb};\n"
(root/'sw.js').write_text(header+'''const BASE=new URL('./',self.location.href);
const PREFIX='foundations-pwa-'+BASE.pathname;
const CACHE=PREFIX+VERSION;
const url=path=>new URL(path,BASE).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // A failed shell install does not replace the working previous version.
 await cache.addAll(CORE.map(path=>new Request(url(path),{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,requested=new URL(request.url);
 if(request.method!=='GET'||requested.origin!==BASE.origin||!requested.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'&&['','index.html','glossary.html'].includes(requested.pathname.slice(BASE.pathname.length))){
  // Serve a coherent app shell until the user accepts a new worker version.
  event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(url('index.html'))||fetch(request);})());return;
 }
 const path=requested.pathname.slice(BASE.pathname.length);
 if(!ASSETS.includes(path))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);const cached=await cache.match(url(path));if(cached)return cached;
  const response=await fetch(request);if(response.ok)await cache.put(url(path),response.clone());return response;
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING'){self.skipWaiting();return;}
 const port=event.ports[0];if(!port)return;
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  if(event.data.type==='STATUS'){
   let found=0;for(const path of ASSETS)if(await cache.match(url(path)))found++;
   port.postMessage({type:'STATUS',complete:found===ASSETS.length,done:found,total:ASSETS.length,megabytes:MEGABYTES});return;
  }
  if(event.data.type!=='DOWNLOAD')return;
  let done=0,cursor=0;const total=ASSETS.length;
  await Promise.all(Array.from({length:4},async()=>{
   while(cursor<total){const path=ASSETS[cursor++];
    if(!await cache.match(url(path))){const response=await fetch(new Request(url(path),{cache:'reload'}));if(!response.ok)throw new Error('Download failed');await cache.put(url(path),response);}
    done++;port.postMessage({type:'PROGRESS',done,total});
   }
  }));
  port.postMessage({type:'DONE',done,total});
 })().catch(()=>port.postMessage({type:'ERROR',message:'Offline download incomplete'})));
});
''')
print(f'PWA build {version}: {len(assets)} files, {mb} MB')
