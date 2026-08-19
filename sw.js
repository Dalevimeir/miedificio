/* הבניין שלי — service worker
   מעלים גרסה בכל פריסה. הלקוח מזהה שיש גרסה חדשה ומציג באנר,
   ומחליף אותה רק כשהמשתמש לוחץ "הפעלה מחדש". */
const VERSION = '2026.08.19.43';
const CACHE = 'bld-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // בלי skipWaiting — הגרסה החדשה ממתינה עד שהמשתמש מאשר
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ---------- התראות ---------- */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) { d = { title: 'הבניין שלי', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'הבניין שלי', {
    body: d.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [180, 90, 180],
    tag: d.tag || 'bld',
    renotify: true,
    silent: false,
    dir: 'rtl',
    lang: 'he',
    data: { url: d.url || './index.html' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      // Supabase וגופנים — ישירות לרשת
  e.respondWith(
    fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
