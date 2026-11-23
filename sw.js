/* Minha Loja — service worker (offline). Mude VERSAO ao publicar uma versão nova. */
const VERSAO = 'minhaloja-v11.0';
const FICHEIROS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // nunca interfere com o Google (sincronização)
  // abre logo o que está guardado e atualiza em segundo plano
  e.respondWith(
    caches.open(VERSAO).then(async c => {
      const guardado = await c.match(req, { ignoreSearch: true });
      const rede = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
      return guardado || (await rede) || (req.mode === 'navigate' ? c.match('./index.html') : Response.error());
    })
  );
});
