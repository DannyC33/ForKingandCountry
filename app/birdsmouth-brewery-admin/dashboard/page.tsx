'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const bm = supabase.schema('birdsmouth');
const LOGO = 'https://images.squarespace-cdn.com/content/v1/695c169d5083032f08c5e2a9/75282f5e-e2c5-44aa-ba01-e29c9262efe2/bird+logo+horz.png?format=1500w';

// ── Types ──────────────────────────────────────────────────
type Tab = 'bundles' | 'orders' | 'code';

type Bundle = {
  id: string; label: string; cases: number; unit_price: number;
  tag: string | null; is_custom: boolean; active: boolean; sort_order: number;
};

type Order = {
  id: string; vendor_email: string; status: string; payment_status: string;
  total: number; created_at: string; notes: string | null;
};

type CompanyGroup = {
  company: string; contactName: string; phone: string; email: string;
  orders: Order[]; totalValue: number; pendingPaymentCount: number;
};

// ── Helpers ────────────────────────────────────────────────
function parseNotes(notes: string | null) {
  if (!notes) return {};
  const r: Record<string, string> = {};
  notes.split(' | ').forEach(p => { const [k, ...v] = p.split(': '); if (k) r[k.toLowerCase()] = v.join(': '); });
  return { vendor: r['vendor'], company: r['company'], phone: r['phone'], special: r['special request'] };
}

function groupByCompany(orders: Order[]): CompanyGroup[] {
  const map = new Map<string, CompanyGroup>();
  for (const o of orders) {
    const { vendor, company, phone } = parseNotes(o.notes);
    const key = company || o.vendor_email;
    if (!map.has(key)) map.set(key, { company: key, contactName: vendor || '—', phone: phone || '—', email: o.vendor_email, orders: [], totalValue: 0, pendingPaymentCount: 0 });
    const g = map.get(key)!;
    g.orders.push(o);
    g.totalValue += o.total;
    if (o.payment_status === 'unpaid') g.pendingPaymentCount++;
  }
  return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue);
}

const INPUT = 'w-full bg-[#F7F9FC] border border-[#E2E6ED] rounded-lg px-3 py-2 text-[#1A1C20] text-sm focus:outline-none focus:border-[#C8932A] transition-colors';

// ── Component ──────────────────────────────────────────────
export default function BirdsmouthAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab]   = useState<Tab>('bundles');
  const [toast, setToast] = useState<string | null>(null);

  // Bundles
  const [bundles, setBundles]       = useState<Bundle[]>([]);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [savingBundle, setSavingBundle]   = useState(false);

  // Orders
  const [orders, setOrders]       = useState<Order[]>([]);
  const [emailModal, setEmailModal] = useState<CompanyGroup | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody]       = useState('');
  const [emailSent, setEmailSent]       = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Code Studio
  const [codePrompt, setCodePrompt]     = useState('');
  const [generating, setGenerating]     = useState(false);
  const [genExplanation, setGenExplanation] = useState('');
  const [genCode, setGenCode]           = useState('');
  const [genError, setGenError]         = useState('');
  const [pushing, setPushing]           = useState(false);
  const [commitMsg, setCommitMsg]       = useState('');
  const [showPushModal, setShowPushModal] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetchBundles = useCallback(async () => {
    const { data } = await bm.from('bm_bundles').select('*').order('sort_order');
    if (data) setBundles(data as Bundle[]);
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data } = await bm.from('bm_orders').select('id, vendor_email, status, payment_status, total, created_at, notes').order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/birdsmouth-brewery-admin'); return; }
      setUser(session.user);
      fetchBundles(); fetchOrders();
    });
  }, [router, fetchBundles, fetchOrders]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.replace('/birdsmouth-brewery-admin'); };

  // ── Bundle actions ─────────────────────────────────────
  const saveBundle = async () => {
    if (!editingBundle) return;
    setSavingBundle(true);
    await bm.from('bm_bundles').update({ label: editingBundle.label, cases: editingBundle.cases, unit_price: editingBundle.unit_price, tag: editingBundle.tag || null, active: editingBundle.active, updated_at: new Date().toISOString() }).eq('id', editingBundle.id);
    setEditingBundle(null); setSavingBundle(false);
    fetchBundles(); showToast('Bundle saved.');
  };

  const toggleBundleActive = async (bundle: Bundle) => {
    await bm.from('bm_bundles').update({ active: !bundle.active, updated_at: new Date().toISOString() }).eq('id', bundle.id);
    fetchBundles();
  };

  // ── Payment status ──────────────────────────────────────
  const updatePaymentStatus = async (orderId: string, status: string) => {
    await bm.from('bm_orders').update({ payment_status: status }).eq('id', orderId);
    fetchOrders(); showToast('Payment status updated.');
  };

  // ── Email modal ─────────────────────────────────────────
  const openEmailModal = (group: CompanyGroup) => {
    setEmailSent(false);
    setEmailSubject(`Follow-up: Your Birdsmouth Brewery Order`);
    setEmailBody(`Hi ${group.contactName},\n\nWe're following up on your recent order${group.orders.length > 1 ? 's' : ''} with Birdsmouth Brewery.\n\n${group.orders.filter(o => o.payment_status === 'unpaid').map(o => `Order #${o.id.slice(-6).toUpperCase()} — $${o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} — Status: Pending Payment`).join('\n')}\n\nPlease remit payment at your earliest convenience. Don't hesitate to reach out with any questions.\n\nBest,\nBirdsmouth Brewery Team\ninfo@birdsmouthbeer.com`);
    setEmailModal(group);
  };

  const sendEmail = () => { setEmailSent(true); showToast(`Follow-up queued for ${emailModal?.company}.`); };

  // ── Code Studio ─────────────────────────────────────────
  const generateCode = async () => {
    if (!codePrompt.trim()) return;
    setGenerating(true); setGenError(''); setGenExplanation(''); setGenCode('');
    try {
      const res = await fetch('/api/birdsmouth/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: codePrompt }) });
      const data = await res.json();
      if (!res.ok) { setGenError(data.error ?? 'Request failed'); } else { setGenExplanation(data.explanation ?? ''); setGenCode(data.code ?? ''); setCommitMsg(`Admin: ${codePrompt.slice(0, 72)}`); }
    } catch (e) { setGenError(String(e)); }
    setGenerating(false);
  };

  const downloadChanges = () => {
    if (!genCode) return;
    const blob = new Blob([genCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders-page.tsx'; a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded.');
  };

  const viewChanges = () => {
    if (!genCode) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Code Preview — Birdsmouth Orders</title><style>body{margin:0;background:#1a1c20;color:#f2ede4;font-family:monospace;font-size:13px;line-height:1.6;padding:24px;white-space:pre-wrap;word-break:break-word;}header{position:sticky;top:0;background:#1a1c20;padding:12px 0 16px;border-bottom:1px solid #2a2d34;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}button{background:#c8932a;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700}button:hover{background:#b5811e}</style></head><body><header><span style="color:#c8932a;font-weight:700">orders/page.tsx — Preview</span><button onclick="navigator.clipboard.writeText(document.querySelector('pre').innerText).then(()=>this.textContent='Copied!').catch(()=>this.textContent='Failed')">Copy</button></header><pre>${genCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre><p style="color:#5a5550;margin-top:24px">To preview locally: replace app/birdsmouth-brewery/orders/page.tsx and run npm run dev → http://localhost:3000/birdsmouth-brewery</p></body></html>`);
    w.document.close();
  };

  const pushToGitHub = async () => {
    if (!genCode) return;
    setPushing(true); setShowPushModal(false);
    try {
      const res = await fetch('/api/birdsmouth/github-push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: genCode, commitMessage: commitMsg }) });
      const data = await res.json();
      if (!res.ok) { showToast(`Push failed: ${data.error}`); } else { showToast(`Pushed ✓ Commit: ${data.commit?.slice(0, 7)}`); }
    } catch (e) { showToast(`Error: ${String(e)}`); }
    setPushing(false);
  };

  // ── Stats ───────────────────────────────────────────────
  const totalRevenue  = orders.reduce((s, o) => s + o.total, 0);
  const unpaidOrders  = orders.filter(o => o.payment_status === 'unpaid');
  const unpaidTotal   = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const groups        = groupByCompany(orders.filter(o => paymentFilter === 'all' ? true : o.payment_status === paymentFilter));

  const TAB_CLS = (t: Tab) => `px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${tab === t ? 'bg-[#1A1C20] text-white' : 'text-[#7A828F] hover:text-[#1A1C20]'}`;

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#1A1C20]">

      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E6ED] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src={LOGO} alt="Birdsmouth" width={130} height={36} className="object-contain brightness-0" />
            <span className="text-[11px] font-bold text-[#C8932A] uppercase tracking-widest border border-[#C8932A]/30 px-2 py-0.5 rounded-md">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#7A828F] hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout} className="text-xs text-[#6A7280] hover:text-[#1A1C20] border border-[#E2E6ED] hover:border-[#C0C8D0] px-3 py-1.5 rounded-lg transition-colors">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 bg-white border border-[#E2E6ED] rounded-2xl p-1.5 w-fit shadow-sm">
          <button className={TAB_CLS('bundles')} onClick={() => setTab('bundles')}>📦 Bundles</button>
          <button className={TAB_CLS('orders')}  onClick={() => setTab('orders')}>📋 Orders</button>
          <button className={TAB_CLS('code')}    onClick={() => setTab('code')}>🤖 Code Studio</button>
        </div>

        {/* ── BUNDLES TAB ── */}
        {tab === 'bundles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Bundle Management</h2>
                <p className="text-sm text-[#7A828F] mt-1">Edit pricing and availability for vendor packages.</p>
              </div>
              <button onClick={fetchBundles} className="text-xs text-[#7A828F] hover:text-[#1A1C20] border border-[#E2E6ED] px-3 py-1.5 rounded-lg transition-colors">Refresh</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bundles.map(bundle => {
                const isEditing = editingBundle?.id === bundle.id;
                const b = isEditing ? editingBundle! : bundle;
                return (
                  <div key={bundle.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all ${b.active ? 'border-[#E2E6ED]' : 'border-[#E2E6ED] opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#7A828F] uppercase tracking-widest">{bundle.id}</p>
                      <button onClick={() => toggleBundleActive(bundle)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${b.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {b.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {isEditing ? (
                      <>
                        <div><label className="block text-[10px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1">Label</label><input value={b.label} onChange={e => setEditingBundle({ ...b, label: e.target.value })} className={INPUT} /></div>
                        {!b.is_custom && <div><label className="block text-[10px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1">Cases</label><input type="number" value={b.cases} onChange={e => setEditingBundle({ ...b, cases: parseInt(e.target.value) || 0 })} className={INPUT} /></div>}
                        <div><label className="block text-[10px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1">Price / Case ($)</label><input type="number" step="0.01" value={b.unit_price} onChange={e => setEditingBundle({ ...b, unit_price: parseFloat(e.target.value) || 0 })} className={INPUT} /></div>
                        <div><label className="block text-[10px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1">Tag</label><input value={b.tag ?? ''} placeholder="e.g. Best Value" onChange={e => setEditingBundle({ ...b, tag: e.target.value || null })} className={INPUT} /></div>
                        <div className="flex gap-2 mt-auto">
                          <button onClick={saveBundle} disabled={savingBundle} className="flex-1 bg-[#1A1C20] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#2A2D34] transition-colors disabled:opacity-50">{savingBundle ? 'Saving…' : 'Save'}</button>
                          <button onClick={() => setEditingBundle(null)} className="flex-1 border border-[#E2E6ED] text-xs font-semibold py-2 rounded-lg hover:bg-[#F7F9FC] transition-colors">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-base font-bold">{b.label}</p>
                          {b.tag && <span className="text-[10px] font-bold text-[#C8932A] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{b.tag}</span>}
                        </div>
                        {!b.is_custom && <p className="text-sm text-[#7A828F]">{b.cases} cases</p>}
                        <div>
                          <p className="text-2xl font-bold">${Number(b.unit_price).toFixed(2)}<span className="text-sm font-normal text-[#7A828F] ml-1">/ case</span></p>
                          {!b.is_custom && <p className="text-xs text-[#7A828F] mt-0.5">Total: <span className="font-semibold text-[#1A1C20]">${(b.cases * Number(b.unit_price)).toLocaleString()}</span></p>}
                        </div>
                        <button onClick={() => setEditingBundle({ ...bundle })} className="mt-auto w-full border border-[#E2E6ED] text-xs font-semibold py-2 rounded-lg hover:bg-[#F7F9FC] hover:border-[#C8932A] transition-colors">Edit</button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Orders', value: orders.length.toString(), sub: 'all time' },
                { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: 'all orders' },
                { label: 'Pending Payment', value: `$${unpaidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: `${unpaidOrders.length} orders`, highlight: true },
              ].map(s => (
                <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 ${s.highlight ? 'border-amber-200' : 'border-[#E2E6ED]'}`}>
                  <p className="text-[10px] font-bold text-[#7A828F] uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.highlight ? 'text-[#C8932A]' : ''}`}>{s.value}</p>
                  <p className="text-xs text-[#7A828F] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Orders by Company</h2>
              <div className="flex gap-1 bg-white border border-[#E2E6ED] rounded-xl p-1">
                {(['all', 'unpaid', 'paid'] as const).map(f => (
                  <button key={f} onClick={() => setPaymentFilter(f)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize ${paymentFilter === f ? 'bg-[#1A1C20] text-white' : 'text-[#7A828F] hover:text-[#1A1C20]'}`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {groups.length === 0 && <div className="bg-white border border-[#E2E6ED] rounded-2xl py-16 text-center"><p className="text-[#7A828F]">No orders match this filter.</p></div>}
              {groups.map(group => (
                <div key={group.company} className="bg-white border border-[#E2E6ED] rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-[#1A1C20]">{group.company}</p>
                      <p className="text-sm text-[#7A828F] mt-0.5">{group.contactName} · {group.phone} · <a href={`mailto:${group.email}`} className="text-[#C8932A] hover:underline">{group.email}</a></p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold">${group.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-[#7A828F]">{group.orders.length} order{group.orders.length !== 1 ? 's' : ''}</p>
                      </div>
                      {group.pendingPaymentCount > 0 && (
                        <button onClick={() => openEmailModal(group)} className="flex items-center gap-1.5 bg-[#C8932A] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#B5811E] transition-colors whitespace-nowrap">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          Follow-Up
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order rows */}
                  <div className="border-t border-[#E2E6ED]">
                    {group.orders.map(order => (
                      <div key={order.id} className="px-6 py-3 flex items-center justify-between gap-4 border-b border-[#E2E6ED]/50 last:border-0 hover:bg-[#F7F9FC] transition-colors">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-xs font-mono text-[#7A828F]">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-[#7A828F]">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{order.status}</span>
                          <span className="text-xs font-semibold">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <select value={order.payment_status} onChange={e => updatePaymentStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : order.payment_status === 'partial' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CODE STUDIO TAB ── */}
        {tab === 'code' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold">Code Studio</h2>
              <p className="text-sm text-[#7A828F] mt-1">Describe a change to the vendor ordering portal. Claude will generate the updated code.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left: Prompt + response */}
              <div className="space-y-4">
                <div className="bg-white border border-[#E2E6ED] rounded-2xl p-5 shadow-sm">
                  <label className="block text-[10px] font-bold text-[#7A828F] uppercase tracking-widest mb-3">Describe Your Change</label>
                  <textarea value={codePrompt} onChange={e => setCodePrompt(e.target.value)} rows={5}
                    placeholder="e.g. Add a 200-case bundle at $17/case. Change the card layout to show images of each beer style. Update the FAQ to include a question about kegs."
                    className="w-full bg-[#F7F9FC] border border-[#E2E6ED] rounded-xl px-4 py-3 text-[#1A1C20] text-sm placeholder-[#C0C8D0] focus:outline-none focus:border-[#C8932A] transition-colors resize-none" />
                  <button onClick={generateCode} disabled={generating || !codePrompt.trim()}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-[#1A1C20] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#2A2D34] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {generating ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
                    ) : (
                      <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Ask Claude</>
                    )}
                  </button>
                </div>

                {genError && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-600">{genError}</p></div>}

                {genExplanation && (
                  <div className="bg-white border border-[#E2E6ED] rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-[#7A828F] uppercase tracking-widest mb-2">Claude's Summary</p>
                    <p className="text-sm text-[#1A1C20] leading-relaxed">{genExplanation}</p>
                  </div>
                )}

                {genCode && (
                  <div className="bg-white border border-[#E2E6ED] rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-[#7A828F] uppercase tracking-widest mb-3">Commit Message</p>
                    <input value={commitMsg} onChange={e => setCommitMsg(e.target.value)} className={INPUT} placeholder="Describe the change for the commit" />
                  </div>
                )}
              </div>

              {/* Right: Code preview */}
              <div className="bg-[#1A1C20] rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ minHeight: 400 }}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A2D34]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#3A3D44]" />
                    <span className="w-3 h-3 rounded-full bg-[#3A3D44]" />
                    <span className="w-3 h-3 rounded-full bg-[#3A3D44]" />
                    <span className="text-xs text-[#5A6070] ml-2">orders/page.tsx</span>
                  </div>
                  {genCode && (
                    <button onClick={() => navigator.clipboard.writeText(genCode).then(() => showToast('Copied!'))}
                      className="text-[10px] font-bold text-[#7A828F] hover:text-white transition-colors uppercase tracking-wider">Copy</button>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-5">
                  {genCode ? (
                    <pre className="text-xs text-[#A8B0C0] leading-relaxed whitespace-pre-wrap break-words">{genCode}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-[#3A4050] text-sm text-center">Generated code will appear here.<br />Describe a change and click Ask Claude.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action toolbar */}
            {genCode && (
              <div className="mt-6 bg-white border border-[#E2E6ED] rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-[#7A828F] mr-auto">Ready to deploy?</p>

                <button onClick={downloadChanges}
                  className="flex items-center gap-2 border border-[#E2E6ED] hover:border-[#C8932A] text-sm font-semibold px-4 py-2.5 rounded-xl text-[#1A1C20] hover:text-[#C8932A] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Changes
                </button>

                <button onClick={viewChanges}
                  className="flex items-center gap-2 border border-[#E2E6ED] hover:border-[#C8932A] text-sm font-semibold px-4 py-2.5 rounded-xl text-[#1A1C20] hover:text-[#C8932A] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View Changes
                </button>

                <button onClick={() => setShowPushModal(true)} disabled={pushing}
                  className="flex items-center gap-2 bg-[#1A1C20] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#2A2D34] transition-colors disabled:opacity-40">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  {pushing ? 'Pushing…' : 'Push to GitHub'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1C20] text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
          {toast}
        </div>
      )}

      {/* Email follow-up modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEmailModal(null)} aria-hidden="true" />
          <div className="relative bg-white border border-[#E2E6ED] rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E6ED]">
              <h3 className="font-semibold">Follow-Up Email</h3>
              <button onClick={() => setEmailModal(null)} className="text-[#7A828F] hover:text-[#1A1C20] text-2xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {emailSent ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="font-semibold">Follow-up queued</p>
                  <p className="text-sm text-[#7A828F] mt-1">Email to {emailModal.company} has been staged for delivery.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1.5">To</label>
                    <div className="bg-[#F7F9FC] border border-[#E2E6ED] rounded-lg px-4 py-2.5 text-sm text-[#7A828F]">{emailModal.email}</div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1.5">Subject</label>
                    <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A828F] uppercase tracking-widest mb-1.5">Message</label>
                    <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={10} className={`${INPUT} resize-none`} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={sendEmail} className="flex-1 bg-[#C8932A] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#B5811E] transition-colors">Send Follow-Up</button>
                    <button onClick={() => setEmailModal(null)} className="border border-[#E2E6ED] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#F7F9FC] transition-colors">Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GitHub push confirmation modal */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPushModal(false)} aria-hidden="true" />
          <div className="relative bg-white border border-[#E2E6ED] rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-6 py-5">
              <h3 className="font-bold text-lg mb-1">Push to GitHub</h3>
              <p className="text-sm text-[#7A828F] mb-5">This will commit and push the generated code to your GitHub repository. Make sure you have reviewed the changes in the code preview.</p>
              <div className="bg-[#F7F9FC] border border-[#E2E6ED] rounded-xl px-4 py-3 text-xs font-mono text-[#7A828F] mb-5">
                <p className="text-[10px] font-bold text-[#7A828F] uppercase tracking-widest mb-1">Commit Message</p>
                {commitMsg}
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">⚠ This updates the live production file. Ensure GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO are configured in your environment.</p>
              <div className="flex gap-3">
                <button onClick={pushToGitHub} className="flex-1 bg-[#1A1C20] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#2A2D34] transition-colors">Confirm Push</button>
                <button onClick={() => setShowPushModal(false)} className="border border-[#E2E6ED] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#F7F9FC] transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
