'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string;
  services: string[];
  pain_point: string | null;
  email_opt_in: boolean;
  sms_opt_in: boolean;
}

type NotifyState = 'idle' | 'sending' | 'sent' | 'error';
type PushStatus  = 'unknown' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'subscribing';

function fmt(dt: string) {
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

export default function ServusAdminDashboard() {
  const router = useRouter();
  const [leads,        setLeads]        = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadsError,   setLeadsError]   = useState('');

  const [brevoState,    setBrevoState]    = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [brevoMsg,      setBrevoMsg]      = useState('');

  const [pushStatus,    setPushStatus]    = useState<PushStatus>('unknown');
  const [pushMsg,       setPushMsg]       = useState('');
  const [pushTestState, setPushTestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const [notifyStates, setNotifyStates] = useState<Record<string, NotifyState>>({});

  interface AnalyticsData {
    dailyVisitors: { date: string; visitors: number; views: number }[];
    topPages:  { page: string; views: number }[];
    topClicks: { label: string; clicks: number }[];
    totalSessions: number;
    totalPageViews: number;
    totalClicks: number;
  }
  const [analytics,        setAnalytics]        = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ── Service worker + subscription check ───────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      return;
    }
    if (Notification.permission === 'denied') { setPushStatus('denied'); return; }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/servus-admin/' })
      .then(async reg => {
        const sub = await reg.pushManager.getSubscription();
        setPushStatus(sub ? 'subscribed' : 'unsubscribed');
      })
      .catch(() => setPushStatus('unsupported'));
  }, []);

  // ── Leads ──────────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    setLeadsError('');
    try {
      const res = await fetch('/api/servus/admin/leads');
      if (res.status === 401) { router.push('/servus-admin'); return; }
      if (!res.ok) { setLeadsError('Failed to load leads'); return; }
      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch {
      setLeadsError('Network error — could not load leads');
    } finally {
      setLoadingLeads(false);
    }
  }, [router]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Analytics ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingAnalytics(true);
    fetch('/api/servus/admin/analytics')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAnalytics(d); })
      .finally(() => setLoadingAnalytics(false));
  }, []);

  // ── Subscribe ──────────────────────────────────────────────────────────────
  async function subscribeToPush() {
    setPushStatus('subscribing');
    setPushMsg('');
    try {
      const reg        = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushStatus('denied');
        setPushMsg('Permission denied. Enable in iPhone Settings → Safari → Notifications.');
        return;
      }
      const keyArray = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: keyArray.buffer as ArrayBuffer,
      });
      const res = await fetch('/api/servus/admin/push-subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        const d = await res.json();
        setPushMsg(d.error ?? 'Failed to save subscription');
        setPushStatus('unsubscribed');
        return;
      }
      setPushStatus('subscribed');
      setPushMsg('Push notifications enabled on this device.');
    } catch (err) {
      setPushStatus('unsubscribed');
      setPushMsg(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async function unsubscribeFromPush() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) { setPushStatus('unsubscribed'); return; }
      await fetch('/api/servus/admin/push-subscribe', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
      setPushStatus('unsubscribed');
      setPushMsg('Push notifications disabled.');
    } catch {
      setPushMsg('Failed to unsubscribe.');
    }
  }

  async function resetPush() {
    setPushStatus('subscribing');
    setPushMsg('Resetting…');
    try {
      // Unregister ALL service workers on this origin
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        const sub = await reg.pushManager.getSubscription().catch(() => null);
        if (sub) {
          await fetch('/api/servus/admin/push-subscribe', {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ endpoint: sub.endpoint }),
          }).catch(() => {});
          await sub.unsubscribe().catch(() => {});
        }
        await reg.unregister();
      }
      setPushStatus('unsubscribed');
      setPushMsg('Reset complete — tap Enable Notifications to re-subscribe.');
    } catch (err) {
      setPushStatus('unsubscribed');
      setPushMsg(`Reset error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  async function sendTestPush() {
    setPushTestState('sending');
    try {
      const res = await fetch('/api/servus/admin/push-send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: 'Servus Test', body: 'Push notifications are working!' }),
      });
      const d = await res.json();
      if (!res.ok) { setPushTestState('error'); setPushMsg(d.error ?? 'Failed'); return; }
      setPushTestState('sent');
      setPushMsg(`Sent to ${d.sent} device${d.sent !== 1 ? 's' : ''}.`);
    } catch {
      setPushTestState('error');
    }
  }

  // ── Brevo ──────────────────────────────────────────────────────────────────
  async function testBrevo() {
    setBrevoState('sending');
    setBrevoMsg('');
    try {
      const res = await fetch('/api/servus/brevo-test', { method: 'POST' });
      const d   = await res.json();
      if (!res.ok) { setBrevoState('error'); setBrevoMsg(d.error ?? 'Unknown error'); return; }
      setBrevoState('ok');
      setBrevoMsg('Test email sent to daniel.c.fedak@gmail.com');
    } catch {
      setBrevoState('error');
      setBrevoMsg('Network error');
    }
  }

  // ── Per-lead notify ────────────────────────────────────────────────────────
  async function notifyForLead(lead: Lead) {
    setNotifyStates(s => ({ ...s, [lead.id]: 'sending' }));
    try {
      const res = await fetch('/api/servus/admin/push-send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title: 'New Servus Lead',
          body:  `${lead.name} · ${lead.business_name}\n${lead.email}`,
        }),
      });
      setNotifyStates(s => ({ ...s, [lead.id]: res.ok ? 'sent' : 'error' }));
    } catch {
      setNotifyStates(s => ({ ...s, [lead.id]: 'error' }));
    }
  }

  async function logout() {
    await fetch('/api/servus/admin/login', { method: 'DELETE' });
    router.push('/servus-admin');
  }

  const isIos = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  const isPwa = typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="min-h-screen bg-brand-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/LogoV1.png" alt="Servus" width={36} height={36} className="object-contain" />
            <span className="font-bold text-gray-900 tracking-tight">Servus Admin</span>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-gray-500 text-sm">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              className="text-gray-500 hover:text-gray-900 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-900 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Tools row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* iPhone push card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">iPhone Push Notifications</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {pushStatus === 'subscribed'   ? 'Active on this device'
                  : pushStatus === 'unsubscribed' ? 'Not enabled on this device'
                  : pushStatus === 'denied'       ? 'Permission denied'
                  : pushStatus === 'unsupported'  ? 'Not supported in this browser'
                  : pushStatus === 'subscribing'  ? 'Enabling…'
                  : 'Checking…'}
                </p>
              </div>
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: pushStatus === 'subscribed'  ? '#22c55e'
                    : pushStatus === 'denied'              ? '#ef4444'
                    : pushStatus === 'subscribing'         ? '#f59e0b'
                    : '#d1d5db',
                }}
              />
            </div>

            {/* iOS Home Screen install prompt */}
            {isIos && !isPwa && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                <p className="font-semibold text-amber-800">Add to Home Screen first</p>
                <ol className="list-decimal list-inside text-amber-700 space-y-0.5 ml-0.5">
                  <li>Tap the <strong>Share</strong> icon in Safari</li>
                  <li>Tap <strong>Add to Home Screen</strong></li>
                  <li>Open the app from your Home Screen</li>
                  <li>Tap <strong>Enable Notifications</strong> below</li>
                </ol>
              </div>
            )}

            {pushStatus === 'denied' && (
              <p className="text-xs text-red-500">
                Go to <strong>Settings → Safari → Notifications</strong> and allow this site.
              </p>
            )}

            {pushMsg && (
              <p className={`text-xs ${pushStatus === 'subscribed' || pushTestState === 'sent' ? 'text-green-600' : 'text-red-500'}`}>
                {pushMsg}
              </p>
            )}

            <div className="flex gap-2">
              {pushStatus !== 'subscribed' ? (
                <button
                  onClick={subscribeToPush}
                  disabled={pushStatus === 'subscribing' || pushStatus === 'denied' || pushStatus === 'unsupported'}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pushStatus === 'subscribing' ? 'Enabling…' : 'Enable Notifications'}
                </button>
              ) : (
                <>
                  <button
                    onClick={sendTestPush}
                    disabled={pushTestState === 'sending'}
                    className="flex-1 bg-brand-500 hover:opacity-90 text-white text-sm py-2.5 rounded-xl font-semibold transition-opacity disabled:opacity-40"
                    style={{ background: pushTestState === 'sent' ? '#16a34a' : pushTestState === 'error' ? '#ef4444' : '' }}
                  >
                    {pushTestState === 'sending' ? 'Sending…' : pushTestState === 'sent' ? 'Sent ✓' : 'Send Test Push'}
                  </button>
                  <button
                    onClick={unsubscribeFromPush}
                    className="text-gray-500 hover:text-gray-900 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    Disable
                  </button>
                  <button
                    onClick={resetPush}
                    className="text-gray-400 hover:text-red-500 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-red-200 transition-colors"
                    title="Clear all subscriptions and start fresh"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Brevo card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Brevo Email</h2>
                <p className="text-gray-500 text-xs mt-0.5">Send a test email to confirm delivery</p>
                {brevoMsg && (
                  <p className={`text-xs mt-2 ${brevoState === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                    {brevoState === 'ok' ? '✓ ' : '✗ '}{brevoMsg}
                  </p>
                )}
              </div>
              <button
                onClick={testBrevo}
                disabled={brevoState === 'sending'}
                className="shrink-0 text-sm px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-40 text-white"
                style={{
                  background: brevoState === 'ok'      ? '#16a34a'
                    : brevoState === 'error'            ? '#ef4444'
                    : '#32303A',
                }}
              >
                {brevoState === 'sending' ? 'Sending…' : brevoState === 'ok' ? 'Sent ✓' : brevoState === 'error' ? 'Retry' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Leads */}
        <div>
          <h2 className="font-semibold text-gray-900 text-base mb-4">Form Submissions</h2>

          {loadingLeads ? (
            <div className="text-gray-400 text-sm py-16 text-center">Loading…</div>
          ) : leadsError ? (
            <div className="text-red-500 text-sm py-16 text-center">{leadsError}</div>
          ) : leads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <p className="text-gray-400 text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map(lead => {
                const ns = notifyStates[lead.id] ?? 'idle';
                return (
                  <div
                    key={lead.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{lead.name}</span>
                          <span className="text-gray-300 text-xs">·</span>
                          <span className="text-gray-600 text-sm">{lead.business_name}</span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <a href={`mailto:${lead.email}`} className="hover:text-brand-500 transition-colors">{lead.email}</a>
                          {lead.phone && <span>{lead.phone}</span>}
                        </div>

                        {lead.services?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {lead.services.map(s => (
                              <span
                                key={s}
                                className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-500 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {lead.pain_point && (
                          <p className="text-gray-400 text-xs italic leading-relaxed">"{lead.pain_point}"</p>
                        )}

                        <div className="flex gap-3 text-xs text-gray-400">
                          <span>{fmt(lead.created_at)}</span>
                          {lead.email_opt_in && <span className="text-green-600">Email ✓</span>}
                          {lead.sms_opt_in  && <span className="text-brand-500">SMS ✓</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => notifyForLead(lead)}
                        disabled={ns === 'sending' || ns === 'sent'}
                        className="shrink-0 text-sm px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-40 self-start text-white"
                        style={{
                          background: ns === 'sent'   ? '#16a34a'
                            : ns === 'error'           ? '#ef4444'
                            : '#0ea5e9',
                        }}
                      >
                        {ns === 'sending' ? '…' : ns === 'sent' ? 'Notified ✓' : ns === 'error' ? 'Failed ✗' : '🔔 Notify'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Analytics ──────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <h2 className="font-semibold text-gray-900 text-base">Site Analytics — last 30 days</h2>

          {loadingAnalytics ? (
            <div className="text-gray-400 text-sm py-8 text-center">Loading analytics…</div>
          ) : !analytics ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-sm text-gray-400 text-center py-10">
              No data yet — analytics will appear once visitors reach the site.
            </div>
          ) : (
            <>
              {/* Stat tiles */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Unique Visitors', value: analytics.totalSessions.toLocaleString() },
                  { label: 'Page Views',      value: analytics.totalPageViews.toLocaleString() },
                  { label: 'Clicks Tracked',  value: analytics.totalClicks.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Daily visitors chart */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Daily Visitors</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analytics.dailyVisitors} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickFormatter={d => {
                        const dt = new Date(d + 'T12:00:00');
                        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                      interval={6}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      labelFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#0ea5e9" strokeWidth={2} fill="url(#visitorGrad)" dot={false} />
                    <Area type="monotone" dataKey="views"    name="Page Views" stroke="#32303A" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-end mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-4 h-0.5 bg-brand-500 inline-block rounded" />Visitors</span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-4 h-0.5 bg-brand-600 inline-block rounded" style={{ borderTop: '2px dashed #32303A', background: 'none' }} />Page Views</span>
                </div>
              </div>

              {/* Top pages + top clicks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Top pages */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Pages</h3>
                  {analytics.topPages.length === 0 ? (
                    <p className="text-gray-400 text-xs">No page view data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.topPages.map(({ page, views }) => {
                        const max = analytics.topPages[0].views;
                        return (
                          <div key={page}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className="text-gray-700 truncate max-w-[75%]">{page || '/'}</span>
                              <span className="text-gray-400 shrink-0">{views.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-brand-500"
                                style={{ width: `${(views / max) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top clicks */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Clicks</h3>
                  {analytics.topClicks.length === 0 ? (
                    <p className="text-gray-400 text-xs">No click data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.topClicks.map(({ label, clicks }) => {
                        const max = analytics.topClicks[0].clicks;
                        return (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className="text-gray-700 truncate max-w-[75%]">{label}</span>
                              <span className="text-gray-400 shrink-0">{clicks.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${(clicks / max) * 100}%`, background: '#32303A' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
