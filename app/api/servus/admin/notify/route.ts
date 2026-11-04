import { NextRequest, NextResponse } from 'next/server';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('servus_admin')?.value;
  return !!token && token === process.env.SERVUS_ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, message } = await req.json();

  const userKey  = process.env.PUSHOVER_USER_KEY;
  const apiToken = process.env.PUSHOVER_API_TOKEN;

  if (!userKey || !apiToken) {
    return NextResponse.json(
      { error: 'Pushover not configured. Add PUSHOVER_USER_KEY and PUSHOVER_API_TOKEN to .env.local.' },
      { status: 503 }
    );
  }

  const res = await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token:   apiToken,
      user:    userKey,
      title:   title   ?? 'Servus Alert',
      message: message ?? 'Test notification from Servus admin',
      sound:   'pushover',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.errors?.join(', ') ?? 'Pushover error' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
