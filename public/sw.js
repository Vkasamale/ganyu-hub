/* Ganyu Hub service worker.
 *
 * ponytail: ~60 hand-written lines instead of next-pwa/Workbox. Three jobs:
 *   1. a fetch handler, which is what makes the app installable at all;
 *   2. a branded offline page instead of the browser's dinosaur;
 *   3. receive push and open the right page when it's tapped.
 *
 * Deliberately NOT caching app pages or API responses. Every screen in Ganyu
 * Hub is money, jobs, or messages behind auth — a stale cached dashboard
 * showing the wrong escrow state is worse than an honest offline page, and a
 * cached response carrying one account's data would survive a sign-out.
 * Upgrade path: if offline browsing ever matters, add a stale-while-revalidate
 * cache for the public /browse and profile pages only.
 */

const CACHE = "ganyu-shell-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([OFFLINE_URL, "/icon-192.png"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Navigations only. Everything else (server actions, Supabase, auth cookies,
  // Next's RSC payloads) goes straight to the network, untouched.
  if (request.mode !== "navigate" || request.method !== "GET") return;
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(OFFLINE_URL).then((r) => r || new Response("Offline", { status: 503 }))
    )
  );
});

self.addEventListener("push", (event) => {
  // Payload is JSON from lib/push.ts. Guard anyway: a push with no body is a
  // legal way for a server to wake a worker, and .json() would throw.
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Ganyu Hub";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      // Same tag replaces an earlier notification for the same job rather than
      // stacking three "Payment released" rows if the webhook retries.
      tag: data.tag || title,
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Reuse an already-open Ganyu Hub window if there is one — otherwise a
      // tap while the app is open spawns a duplicate.
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
