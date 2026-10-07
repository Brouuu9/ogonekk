const CACHE="ogonok-v2";
const ASSETS=["./","./index.html","./manifest.webmanifest"];

self.addEventListener("install",e=>
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  )
);

self.addEventListener("activate",e=>
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  )
);

self.addEventListener("fetch",e=>{
  if(e.request.mode==="navigate" || new URL(e.request.url).pathname.endsWith("/index.html")){
    e.respondWith(
      fetch(e.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
          return response;
        })
        .catch(()=>caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});