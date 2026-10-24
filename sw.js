const CACHE_NAME = 'dmx-pro-v3'; // Mudamos para v2 para forçar o celular a atualizar
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './img/play_store_512.png'
];

// Instala o Service Worker e armazena os arquivos principais em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Tenta carregar da internet primeiro. Se estiver sem sinal, carrega o cache local.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta for válida, faz uma cópia atualizada dela no cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a internet falhar por completo ou o GitHub cair, ele abre a versão salva
        return caches.match(event.request);
      })
  );
});