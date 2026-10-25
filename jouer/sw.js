// Le service worker de la web app : le jeu se relance même sans réseau.
// La page passe d'abord par le réseau (pour recevoir les mises à jour), le reste vient du cache.
// La musique et la voix (lues par plages, « Range ») ne passent pas par ici.
const CACHE = "ri-v1"
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener("fetch", (e) => {
  const r = e.request
  if (r.method !== "GET" || r.headers.has("range") || new URL(r.url).origin !== location.origin) return
  const garder = (res) => {
    if (res.ok && res.status === 200) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)) }
    return res
  }
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(garder).catch(() => caches.match(r).then((m) => m || caches.match("./"))))
    return
  }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then(garder)))
})
