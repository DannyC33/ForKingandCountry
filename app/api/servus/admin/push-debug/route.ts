import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('servus_admin')?.value;
  return !!token && token === process.env.SERVUS_ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const vapidPublic  = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  const nextPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, created_at');

  return NextResponse.json({
    vapid: {
      publicKey:    vapidPublic  ? `${vapidPublic.slice(0, 12)}…`  : 'MISSING',
      privateKey:   vapidPrivate ? 'set'                           : 'MISSING',
      subject:      vapidSubject ?? 'MISSING',
      nextPublicKey: nextPublicKey ? `${nextPublicKey.slice(0, 12)}…` : 'MISSING',
      keysMatch:    vapidPublic === nextPublicKey,
    },
    subscriptions: {
      count: subs?.length ?? 0,
      dbError: error?.message ?? null,
      endpoints: subs?.map(s => ({
        id:        s.id,
        created:   s.created_at,
        endpoint:  s.endpoint.slice(0, 60) + '…',
      })) ?? [],
    },
  });
}
