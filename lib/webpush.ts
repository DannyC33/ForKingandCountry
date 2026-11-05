import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export interface PushResult {
  sent:    number;
  removed: number;
  errors:  { endpoint: string; status: number; message: string }[];
}

export async function sendWebPush(title: string, body: string): Promise<PushResult> {
  const vapidSubject  = process.env.VAPID_SUBJECT;
  const vapidPublic   = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate  = process.env.VAPID_PRIVATE_KEY;

  if (!vapidSubject || !vapidPublic || !vapidPrivate) {
    console.warn('[WebPush] VAPID keys not configured — skipping push');
    return { sent: 0, removed: 0, errors: [] };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: subs, error: dbError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (dbError) {
    console.error('[WebPush] DB error reading subscriptions:', dbError.message);
    return { sent: 0, removed: 0, errors: [{ endpoint: '', status: 0, message: dbError.message }] };
  }
  if (!subs?.length) return { sent: 0, removed: 0, errors: [] };

  const payload        = JSON.stringify({ title, body });
  const staleEndpoints: string[] = [];
  const errors: PushResult['errors'] = [];
  let sent = 0;

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 86400 },
        );
        sent++;
      } catch (err: unknown) {
        const e = err as { statusCode?: number; body?: string; message?: string };
        const status = e.statusCode ?? 0;
        const msg    = e.body ?? e.message ?? 'Unknown error';
        console.error(`[WebPush] Send failed — status ${status}:`, msg, '— endpoint:', sub.endpoint.slice(0, 60));

        if (status === 404 || status === 410) {
          staleEndpoints.push(sub.endpoint);
        } else {
          errors.push({ endpoint: sub.endpoint.slice(0, 60) + '…', status, message: msg });
        }
      }
    })
  );

  if (staleEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
  }

  return { sent, removed: staleEndpoints.length, errors };
}
