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

// Normalize phone to digits-only with leading + (e.g. "+19089021994")
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+${digits}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, services, name, phone, email, painPoint } = body;

    // Required field check
    if (!businessName || !name || !email || !services?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Server-side email validation
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

    // Silent duplicate check — return success so the UI shows thank-you
    const { data: existingByEmail } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingByEmail) {
      return NextResponse.json({ success: true });
    }

    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      const { data: existingByPhone } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existingByPhone) {
        return NextResponse.json({ success: true });
      }

      const { error } = await supabase.from('leads').insert({
        business_name: businessName,
        services,
        name,
        phone: normalizedPhone,
        email: email.toLowerCase(),
        pain_point: painPoint || null,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from('leads').insert({
        business_name: businessName,
        services,
        name,
        phone: null,
        email: email.toLowerCase(),
        pain_point: painPoint || null,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
