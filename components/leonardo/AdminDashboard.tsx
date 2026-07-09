'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Booking, BookingStatus } from '@/types/leonardo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

type BookingWithRoom = Booking & {
  room?: { room_number: number; type: string; name: string; price_per_night: number };
  stripe_payment_intent_id?: string;
  amount_paid?: number;
  refund_amount?: number;
};

// ── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  booking,
  onSave,
  onClose,
}: {
  booking: BookingWithRoom;
  onSave: (updated: BookingWithRoom) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    guest_name:  booking.guest_name,
    guest_email: booking.guest_email,
    guest_phone: booking.guest_phone ?? '',
    check_in:    booking.check_in,
    check_out:   booking.check_out,
    num_guests:  booking.num_guests,
    status:      booking.status as BookingStatus,
    notes:       booking.notes ?? '',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [refunding, setRefunding] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/leonardo/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, ...form, num_guests: Number(form.num_guests) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
      onSave(data.booking);
    } catch {
      setError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!confirm('Issue a full refund for this booking?')) return;
    setRefunding(true); setError('');
    try {
      const res = await fetch('/api/leonardo/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Refund failed'); return; }
      alert(`Refund of $${data.refundedAmount.toFixed(2)} issued.`);
      onClose();
    } catch {
      setError('Refund failed. Check Stripe dashboard.');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="edit-title" tabIndex={-1}
        className="relative bg-[#1e3565] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl focus:outline-none">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#162850]">
          <h3 id="edit-title" className="text-white font-bold">Edit Booking</h3>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Payment info */}
          {booking.stripe_payment_intent_id && (
            <div className="bg-[#0f1e36] rounded-xl p-4 text-sm space-y-1">
              <p className="text-white/40 text-xs uppercase tracking-wide">Stripe Payment</p>
              <p className="text-white font-mono text-xs truncate">{booking.stripe_payment_intent_id}</p>
              <div className="flex gap-4 mt-2">
                {booking.amount_paid && <p className="text-green-400 text-xs">Paid: ${Number(booking.amount_paid).toFixed(2)}</p>}
                {booking.refund_amount && <p className="text-red-400 text-xs">Refunded: ${Number(booking.refund_amount).toFixed(2)}</p>}
              </div>
              {!booking.refund_amount && (
                <button onClick={handleRefund} disabled={refunding}
                  className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded-lg disabled:opacity-50">
                  {refunding ? 'Refunding…' : 'Issue Full Refund'}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-white/60 text-xs mb-1">Guest Name</label>
              <input value={form.guest_name} onChange={set('guest_name')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Email</label>
              <input type="email" value={form.guest_email} onChange={set('guest_email')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Phone</label>
              <input type="tel" value={form.guest_phone} onChange={set('guest_phone')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Check-in</label>
              <input type="date" value={form.check_in} onChange={set('check_in')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Check-out</label>
              <input type="date" value={form.check_out} onChange={set('check_out')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Guests</label>
              <input type="number" min={1} max={8} value={form.num_guests} onChange={set('num_guests')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-white/60 text-xs mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={set('notes')} className="w-full bg-[#0f1e36] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c] resize-none" />
            </div>
          </div>

          {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-white/20 text-white/70 hover:text-white py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#c8960c] hover:bg-[#b07c08] text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [bookings,  setBookings]  = useState<BookingWithRoom[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState<BookingStatus | 'all'>('all');
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [editing,   setEditing]   = useState<BookingWithRoom | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/leonardo/admin/bookings');
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('admin_bookings_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leo_bookings' }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBookings]);

  const quickUpdateStatus = async (id: string, status: BookingStatus) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/leonardo/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch {
      setError('Could not update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/leonardo/admin/login', { method: 'DELETE' });
    window.location.href = '/admin';
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    total:     bookings.length,
    revenue:   bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + Number(b.total_price ?? 0), 0),
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f1e36', fontFamily: 'system-ui, sans-serif' }}>
      {editing && (
        <EditModal
          booking={editing}
          onSave={updated => { setBookings(prev => prev.map(b => b.id === updated.id ? updated : b)); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}

      <header className="bg-[#1e3565] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c8960c] flex items-center justify-center text-white font-bold text-sm">L</div>
            <div>
              <p className="text-white font-semibold text-sm">Leonardo Motel</p>
              <p className="text-white/50 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="text-white/60 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: stats.total,             color: 'text-white' },
            { label: 'Pending',        value: stats.pending,            color: 'text-yellow-400' },
            { label: 'Confirmed',      value: stats.confirmed,          color: 'text-green-400' },
            { label: 'Revenue',        value: `$${stats.revenue.toFixed(0)}`, color: 'text-[#c8960c]' },
          ].map(s => (
            <div key={s.label} className="bg-[#1e3565] rounded-xl p-5 shadow">
              <p className="text-white/50 text-xs uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-[#c8960c] text-white' : 'bg-[#1e3565] text-white/60 hover:text-white'}`}>
              {f === 'all' ? 'All' : STATUS_LABELS[f as BookingStatus]}
            </button>
          ))}
          <button onClick={fetchBookings} className="ml-auto px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1e3565] text-white/60 hover:text-white transition-colors">
            ↻ Refresh
          </button>
        </div>

        {error && <div role="alert" className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-4 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-white/30">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">No bookings to show</div>
        ) : (
          <div className="bg-[#1e3565] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Bookings table">
                <thead>
                  <tr className="bg-[#162850] text-white/50 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Guest</th>
                    <th className="px-4 py-3 text-left">Room</th>
                    <th className="px-4 py-3 text-left">Dates</th>
                    <th className="px-4 py-3 text-right">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{b.guest_name}</p>
                        <p className="text-white/40 text-xs">{b.guest_email}</p>
                        {b.guest_phone && <p className="text-white/30 text-xs">{b.guest_phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">Room {b.room?.room_number ?? b.room_id}</p>
                        <p className="text-white/40 text-xs capitalize">{b.room?.type?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs">{b.check_in} → {b.check_out}</p>
                        <p className="text-white/30 text-xs">
                          {Math.ceil((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86_400_000)} nights
                          · {b.num_guests} guest{b.num_guests !== 1 ? 's' : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-[#c8960c] font-bold">${Number(b.total_price).toFixed(2)}</p>
                        {b.amount_paid && <p className="text-green-400 text-xs">Paid</p>}
                        {b.refund_amount && <p className="text-red-400 text-xs">Refunded ${Number(b.refund_amount).toFixed(2)}</p>}
                        {b.stripe_payment_intent_id && <p className="text-white/20 text-[10px] font-mono truncate max-w-[80px]">{b.stripe_payment_intent_id.slice(-8)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => setEditing(b)}
                            className="px-2.5 py-1 bg-[#1e3565] border border-white/20 hover:border-white/50 text-white text-xs rounded-lg transition-colors">
                            Edit
                          </button>
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => quickUpdateStatus(b.id, 'confirmed')} disabled={updating === b.id}
                                className="px-2.5 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg disabled:opacity-40">Confirm</button>
                              <button onClick={() => quickUpdateStatus(b.id, 'cancelled')} disabled={updating === b.id}
                                className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded-lg disabled:opacity-40">Cancel</button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <>
                              <button onClick={() => quickUpdateStatus(b.id, 'completed')} disabled={updating === b.id}
                                className="px-2.5 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg disabled:opacity-40">Complete</button>
                              <button onClick={() => quickUpdateStatus(b.id, 'cancelled')} disabled={updating === b.id}
                                className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded-lg disabled:opacity-40">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
