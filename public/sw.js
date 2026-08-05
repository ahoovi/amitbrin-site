/* limbaromana offline audio — cache-first for /limbaromana-audio/*, network for all else */
var CACHE = 'limba-audio-v1';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var url;
  try { url = new URL(e.request.url); } catch(err){ return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/limbaromana-audio/') !== 0) return;   // everything else: network as usual
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(function(c){
      return c.match(e.request).then(function(hit){
        if (hit) return hit;
        return fetch(e.request).then(function(res){
          if (res && res.status === 200) { c.put(e.request, res.clone()); }
          return res;
        });
      });
    }).catch(function(){ return fetch(e.request); })
  );
});
