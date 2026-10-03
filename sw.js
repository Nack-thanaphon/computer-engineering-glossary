const VERSION='ee89d676accf';
const CORE=["index.html", "glossary.html", "app.js", "pwa.js", "design.css", "manifest.webmanifest", "SOURCES.md", "glossary-assets/tex-svg.js", "glossary-assets/lucide.min.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg"];
const ASSETS=["SOURCES.md", "app.js", "design.css", "glossary-assets/Lucide-LICENSE.txt", "glossary-assets/MathJax-LICENSE.txt", "glossary-assets/absolute.png", "glossary-assets/alg-bfs-poster.png", "glossary-assets/alg-bfs.gif", "glossary-assets/alg-binary-poster.png", "glossary-assets/alg-binary.gif", "glossary-assets/alg-bisect-poster.png", "glossary-assets/alg-bisect.gif", "glossary-assets/alg-bubble-poster.png", "glossary-assets/alg-bubble.gif", "glossary-assets/alg-complexity.png", "glossary-assets/alg-dfs-poster.png", "glossary-assets/alg-dfs.gif", "glossary-assets/alg-dijkstra-poster.png", "glossary-assets/alg-dijkstra.gif", "glossary-assets/alg-euler.svg", "glossary-assets/alg-gauss-poster.png", "glossary-assets/alg-gauss.gif", "glossary-assets/alg-kmeans-poster.png", "glossary-assets/alg-kmeans.gif", "glossary-assets/alg-knn.svg", "glossary-assets/alg-merge-poster.png", "glossary-assets/alg-merge.gif", "glossary-assets/alg-newton-poster.png", "glossary-assets/alg-newton.gif", "glossary-assets/alg-rk4.svg", "glossary-assets/attention-poster.png", "glossary-assets/attention.gif", "glossary-assets/balance-poster.png", "glossary-assets/balance.gif", "glossary-assets/ce-gate-poster.png", "glossary-assets/ce-gate.gif", "glossary-assets/ce-hash.svg", "glossary-assets/ce-linked.svg", "glossary-assets/ce-queue.svg", "glossary-assets/ce-stack.svg", "glossary-assets/conservation-poster.png", "glossary-assets/conservation.gif", "glossary-assets/convex.svg", "glossary-assets/decision.png", "glossary-assets/exp-poster.png", "glossary-assets/exp.gif", "glossary-assets/fit-poster.png", "glossary-assets/fit.gif", "glossary-assets/floor.svg", "glossary-assets/fluid-poster.png", "glossary-assets/fluid.gif", "glossary-assets/gradient-poster.png", "glossary-assets/gradient.gif", "glossary-assets/heat-poster.png", "glossary-assets/heat.gif", "glossary-assets/integral-poster.png", "glossary-assets/integral.gif", "glossary-assets/interpolation.png", "glossary-assets/kfold-poster.png", "glossary-assets/kfold.gif", "glossary-assets/linear-poster.png", "glossary-assets/linear.gif", "glossary-assets/log-poster.png", "glossary-assets/log.gif", "glossary-assets/lucide.min.js", "glossary-assets/matrix-poster.png", "glossary-assets/matrix.gif", "glossary-assets/multiply-poster.png", "glossary-assets/multiply.gif", "glossary-assets/numbers.svg", "glossary-assets/parameter-poster.png", "glossary-assets/parameter.gif", "glossary-assets/pendulum-poster.png", "glossary-assets/pendulum.gif", "glossary-assets/perceptron-poster.png", "glossary-assets/perceptron.gif", "glossary-assets/pi-poster.png", "glossary-assets/pi.gif", "glossary-assets/precision.svg", "glossary-assets/prey.gif", "glossary-assets/projection-poster.png", "glossary-assets/projection.gif", "glossary-assets/regression-poster.png", "glossary-assets/regression.gif", "glossary-assets/sets.svg", "glossary-assets/sigmoid.svg", "glossary-assets/sir-poster.png", "glossary-assets/sir.gif", "glossary-assets/softmax.svg", "glossary-assets/som-poster.png", "glossary-assets/som.gif", "glossary-assets/sqrt.png", "glossary-assets/sum.png", "glossary-assets/tangent-poster.png", "glossary-assets/tangent.gif", "glossary-assets/tex-svg.js", "glossary-assets/threebody-poster.png", "glossary-assets/threebody.gif", "glossary-assets/transpose-poster.png", "glossary-assets/transpose.gif", "glossary.html", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg", "index.html", "manifest.webmanifest", "pwa.js"];
const MEGABYTES=30.1;
const BASE=new URL('./',self.location.href);
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
