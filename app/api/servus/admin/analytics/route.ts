import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('servus_admin')?.value;
  return !!token && token === process.env.SERVUS_ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('type, page, element, session_id, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = events ?? [];

  // ── Daily visitors (unique sessions per day) ───────────────────────────────
  const dailyMap = new Map<string, Set<string>>();
  const dailyViews = new Map<string, number>();

  for (const row of rows) {
    if (row.type !== 'page_view') continue;
    const day = row.created_at.slice(0, 10);
    if (!dailyMap.has(day)) dailyMap.set(day, new Set());
    dailyMap.get(day)!.add(row.session_id);
    dailyViews.set(day, (dailyViews.get(day) ?? 0) + 1);
  }

  // Fill in missing days with 0
  const dailyVisitors: { date: string; visitors: number; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyVisitors.push({
      date:     key,
      visitors: dailyMap.get(key)?.size ?? 0,
      views:    dailyViews.get(key) ?? 0,
    });
  }

  // ── Top pages ──────────────────────────────────────────────────────────────
  const pageMap = new Map<string, number>();
  for (const row of rows) {
    if (row.type !== 'page_view') continue;
    const label = row.page || '/';
    pageMap.set(label, (pageMap.get(label) ?? 0) + 1);
  }
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, views]) => ({ page, views }));

  // ── Top clicks ─────────────────────────────────────────────────────────────
  const clickMap = new Map<string, number>();
  for (const row of rows) {
    if (row.type !== 'click' || !row.element) continue;
    const key = `${row.element} (${row.page})`;
    clickMap.set(key, (clickMap.get(key) ?? 0) + 1);
  }
  const topClicks = [...clickMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, clicks]) => ({ label, clicks }));

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalSessions = new Set(rows.filter(r => r.type === 'page_view').map(r => r.session_id)).size;
  const totalPageViews = rows.filter(r => r.type === 'page_view').length;
  const totalClicks    = rows.filter(r => r.type === 'click').length;

  return NextResponse.json({ dailyVisitors, topPages, topClicks, totalSessions, totalPageViews, totalClicks });
}
