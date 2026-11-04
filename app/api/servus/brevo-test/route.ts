import { NextRequest, NextResponse } from 'next/server';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('servus_admin')?.value;
  return !!token && token === process.env.SERVUS_ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'BREVO_API_KEY not set in environment' }, { status: 503 });
  }

  const adminEmail = 'daniel.c.fedak@gmail.com';

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { name: 'Servus Admin', email: adminEmail },
      to:          [{ email: adminEmail, name: 'Daniel' }],
      subject:     '✅ Brevo test — Servus admin',
      htmlContent: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#1a1a2e;margin:0 0 12px;">Brevo is working</h2>
          <p style="color:#444;line-height:1.6;">
            This test email was sent from the Servus admin portal at
            <strong>${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</strong>.
          </p>
          <p style="color:#888;font-size:13px;margin-top:24px;">
            Servus · Lord Light the Way
          </p>
        </div>
      `,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: `Brevo returned ${res.status}: ${body}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: res.status });
}
