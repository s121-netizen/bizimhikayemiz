const cacheName = 'ak-galeri-v3';

// Kurulumda tarayıcıya hazır olduğunu bildirir
self.addEventListener('install', e => {
    self.skipWaiting();
});

// Her istekte önce hafızaya bakar, yoksa internetten çeker ve hafızaya atar
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Sadece resim dosyalarını hafızaya kaydet
                    if (event.request.url.match(/\.(jpe?g|png|gif|svg|webp)$/)) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
                // Varsa hafızadaki resmi anında getir, yoksa internetten gelmesini bekle
                return response || fetchPromise;
            });
        })
    );
});
