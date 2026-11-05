import { NextRequest, NextResponse } from 'next/server';
import { sendWebPush } from '@/lib/webpush';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('servus_admin')?.value;
  return !!token && token === process.env.SERVUS_ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, body } = await req.json() as { title?: string; body?: string };
  const result = await sendWebPush(title ?? 'Servus', body ?? '');

  if (result.errors.length > 0 && result.sent === 0) {
    return NextResponse.json(
      { error: `Push failed: ${result.errors[0].message} (HTTP ${result.errors[0].status})`, ...result },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
