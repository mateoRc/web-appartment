const CACHE_NAME = "mare-offline-__BUILD_VERSION__";
const CORE = [
  "/", "/styles.css", "/script.js", "/locales.js", "/calendar.js", "/offline.js",
  "/manifest.webmanifest", "/assets/favicon.svg", "/assets/icon-192.png", "/assets/icon-512.png",
  "/assets/terrace-960.webp", "/assets/terrace-1920.webp",
  "/assets/booking-logo.svg", "/assets/airbnb-logo.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) =>
    cache.addAll(CORE.map((url) => new Request(url, { cache: "reload" })))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("mare-offline-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Never store availability, guest submissions, or third-party responses.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  const page = request.mode === "navigate" && ["/", "/index.html"].includes(url.pathname);
  const asset = !url.search && (CORE.includes(url.pathname) ||
    /^\/assets\/[\w.-]+\.(?:webp|jpg|png|svg)$/.test(url.pathname));
  if (!page && !asset) return;

  event.respondWith((async () => {
    let cache;
    try { cache = await caches.open(CACHE_NAME); } catch { return fetch(request); }
    const key = page ? "/" : url.pathname;
    const cached = await cache.match(key);
    const controller = new AbortController();
    // A weak connection should not delay access to a saved address.
    const timeout = cached ? setTimeout(() => controller.abort(), 4000) : null;
    try {
      const response = await fetch(request, { signal: controller.signal });
      if (response.ok && !response.redirected && response.type !== "opaque") {
        event.waitUntil(cache.put(key, response.clone()).catch(() => {}));
      }
      return !response.ok && cached ? cached : response;
    } catch {
      return cached || Response.error();
    } finally {
      clearTimeout(timeout);
    }
  })());
});
