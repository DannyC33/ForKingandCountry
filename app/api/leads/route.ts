import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const BLACKLISTED_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', '10minutemail.com', 'sharklasers.com', 'trashmail.com',
  'dispostable.com', 'fakeinbox.com', 'maildrop.cc', 'spam4.me',
  'mailnull.com', 'spamgourmet.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
]);

const ADMIN_EMAIL = 'daniel.c.fedak@gmail.com';

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `+${digits}`;
}

async function sendAdminAlert(subject: string, details: Record<string, unknown>) {
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Servus Alerts', email: ADMIN_EMAIL },
        to: [{ email: ADMIN_EMAIL, name: 'Daniel' }],
        subject: `⚠️ Servus Alert: ${subject}`,
        htmlContent: `
          <h2 style="color:#c0392b;">Servus — ${subject}</h2>
          <p>An error occurred that may need your attention.</p>
          <table style="border-collapse:collapse;width:100%;font-family:monospace;font-size:14px;">
            ${Object.entries(details).map(([k, v]) => `
              <tr>
                <td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">${k}</td>
                <td style="padding:8px 12px;border:1px solid #ddd;">${JSON.stringify(v)}</td>
              </tr>
            `).join('')}
          </table>
          <p style="margin-top:16px;color:#666;font-size:12px;">
            Check your <a href="https://supabase.com/dashboard">Supabase dashboard</a> and
            <a href="https://app.brevo.com">Brevo contacts</a> to resolve.
          </p>
        `,
      }),
    });
  } catch (err) {
    console.error('Failed to send admin alert:', err);
  }
}

async function brevoUpsert(payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

async function addToBrevo(
  name: string,
  email: string,
  phone: string,
  businessName: string,
  services: string[],
  painPoint: string,
  emailOptIn: boolean,
  smsOptIn: boolean,
) {
  const listId = parseInt(process.env.BREVO_LIST_ID ?? '3');
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || '';

  if (!process.env.BREVO_API_KEY) {
    console.error('[Brevo] BREVO_API_KEY is not set — skipping contact sync for:', email);
    return;
  }

  console.log('[Brevo] Starting contact sync:', { email, listId, emailOptIn, smsOptIn, hasPhone: !!phone });

  const baseAttributes = {
    FIRSTNAME: firstName,
    LASTNAME: lastName,
    BUSINESS_NAME: businessName,
    SERVICES: services.join(', '),
    PAIN_POINT: painPoint || '',
  };

  const validPhone = phone && phone.replace(/\D/g, '').length >= 10;

  const firstPayload = {
    email,
    emailBlacklisted: !emailOptIn,
    smsBlacklisted: !smsOptIn,
    attributes: { ...baseAttributes, ...(validPhone ? { SMS: phone } : {}) },
    listIds: [listId],
    updateEnabled: true,
  };
  console.log('[Brevo] Attempt 1 payload:', JSON.stringify(firstPayload));

  let result = await brevoUpsert(firstPayload);
  console.log('[Brevo] Attempt 1 result:', { status: result.status, ok: result.ok, body: result.body });

  // If SMS caused a duplicate collision, retry without it
  if (!result.ok && result.body.includes('duplicate_parameter') && result.body.includes('SMS')) {
    console.warn('[Brevo] SMS duplicate detected — retrying without SMS for:', email);
    const retryPayload = { email, attributes: baseAttributes, listIds: [listId], updateEnabled: true };
    console.log('[Brevo] Attempt 2 payload:', JSON.stringify(retryPayload));
    result = await brevoUpsert(retryPayload);
    console.log('[Brevo] Attempt 2 result:', { status: result.status, ok: result.ok, body: result.body });
  }

  if (result.ok) {
    console.log('[Brevo] Contact sync succeeded for:', email);
  } else {
    console.error('[Brevo] Contact sync failed:', { status: result.status, body: result.body, email });
    await sendAdminAlert('Brevo contact sync failed', {
      'HTTP Status': result.status,
      'Brevo Error': result.body,
      'Lead Name': name,
      'Lead Email': email,
      'Business': businessName,
      'Services': services.join(', '),
      'Pain Point': painPoint,
      'List ID': listId,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate required env vars early so errors are obvious in logs
    const missingVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      console.error('Leads API: missing environment variables:', missingVars.join(', '));
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const body = await request.json();
    const { businessName, services, name, phone, email, painPoint, emailOptIn = false, smsOptIn = false } = body;

    if (!businessName || !name || !email || !services?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && BLACKLISTED_DOMAINS.has(domain)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Silent duplicate check
    const { data: existingByEmail } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingByEmail) {
      return NextResponse.json({ success: true });
    }

    const normalizedPhone = phone ? normalizePhone(phone) : null;

    if (normalizedPhone !== null) {
      const { data: existingByPhone } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existingByPhone) {
        return NextResponse.json({ success: true });
      }
    }

    const { error: insertError } = await supabase.from('leads').insert({
      business_name: businessName,
      services,
      name,
      phone: normalizedPhone,
      email: email.toLowerCase(),
      pain_point: painPoint || null,
      email_opt_in: emailOptIn,
      sms_opt_in: smsOptIn,
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      await sendAdminAlert('Supabase insert failed — lead lost', {
        'Error': insertError.message,
        'Lead Name': name,
        'Lead Email': email,
        'Business': businessName,
        'Services': services.join(', '),
        'Pain Point': painPoint,
      });
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    // Sync to Brevo — awaited so Vercel doesn't kill the function before it completes
    await addToBrevo(name, email.toLowerCase(), normalizedPhone ?? '', businessName, services, painPoint ?? '', emailOptIn, smsOptIn)
      .catch(err => console.error('[Brevo] Unexpected sync error:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
