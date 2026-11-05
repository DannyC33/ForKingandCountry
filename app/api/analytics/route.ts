import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { type, page, element, sessionId } = await req.json();

    if (!type || !page || !sessionId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Only track main site pages — not admin portal
    if (page.startsWith('/servus-admin')) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from('analytics_events').insert({
      type,
      page:       page.substring(0, 255),
      element:    element ? element.substring(0, 255) : null,
      session_id: sessionId,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // silent — never surface errors to visitors
  }
}
