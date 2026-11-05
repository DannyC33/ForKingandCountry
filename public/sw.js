// Force this SW to become active immediately without waiting for old tabs to close
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const title   = data.title   ?? 'Servus';
  const options = {
    body:  data.body  ?? data.message ?? '',
    icon:  data.icon  ?? '/LogoV1.png',
    badge: data.badge ?? '/LogoV1.png',
    data:  { url: data.url ?? '/servus-admin/dashboard' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/servus-admin/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
