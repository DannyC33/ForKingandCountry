import { NextRequest, NextResponse } from 'next/server';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('servus_admin')?.value;
  return !!token && token === process.env.SERVUS_ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    return NextResponse.json(
      { error: 'NTFY_TOPIC not set. Add it to your Vercel environment variables.' },
      { status: 503 }
    );
  }

  const res = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {
      'Title':    'Servus Test',
      'Priority': 'high',
      'Tags':     'white_check_mark',
      'Content-Type': 'text/plain',
    },
    body: 'ntfy push notifications are working!',
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `ntfy returned ${res.status}: ${text}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, topic });
}
