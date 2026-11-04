import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export async function sendWebPush(title: string, body: string): Promise<{ sent: number; removed: number }> {
  const vapidSubject  = process.env.VAPID_SUBJECT;
  const vapidPublic   = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate  = process.env.VAPID_PRIVATE_KEY;

  if (!vapidSubject || !vapidPublic || !vapidPrivate) {
    console.warn('[WebPush] VAPID keys not configured — skipping push');
    return { sent: 0, removed: 0 };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (error || !subs?.length) return { sent: 0, removed: 0 };

  const payload          = JSON.stringify({ title, body });
  const staleEndpoints: string[] = [];

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) staleEndpoints.push(sub.endpoint);
      }
    })
  );

  if (staleEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
  }

  return { sent: subs.length - staleEndpoints.length, removed: staleEndpoints.length };
}
