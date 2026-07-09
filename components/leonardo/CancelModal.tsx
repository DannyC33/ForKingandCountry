'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function CancelModal({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; refunded?: boolean; refundedAmount?: number } | null>(null);
  const [error, setError] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    setBookingId('');
    setEmail('');
    setResult(null);
    setError('');
  }, []);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.key !== 'Tab') return;
      const els = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (els.length < 2) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  useEffect(() => { if (!open) triggerRef.current?.focus(); }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim() || !email.trim()) { setError('Both fields are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leonardo/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingId.trim(), guestEmail: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Cancellation failed.'); return; }
      setResult({ success: true, message: data.message, refunded: data.refunded, refundedAmount: data.refundedAmount });
    } catch {
      setError('Something went wrong. Please call us at 732.291.9527.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className={triggerClassName ?? 'text-sm underline underline-offset-4 text-gray-500 hover:text-gray-700 transition-colors'}
      >
        Cancel a Reservation
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            tabIndex={-1}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md focus:outline-none overflow-hidden"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#7a1a1a]">
              <h2 id="cancel-title" className="text-white font-bold text-lg">Cancel a Reservation</h2>
              <button onClick={handleClose} aria-label="Close dialog" className="text-white/60 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6">
              {!result ? (
                <>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                    Enter your booking ID and email address. Cancellations made more than 48 hours before check-in receive a full refund.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="cancel-id" className="block text-xs font-semibold text-gray-700 mb-1">Booking ID</label>
                      <input
                        id="cancel-id"
                        type="text"
                        value={bookingId}
                        onChange={e => { setBookingId(e.target.value); setError(''); }}
                        placeholder="e.g. 3f2a1b4c-..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a1a1a]"
                      />
                    </div>
                    <div>
                      <label htmlFor="cancel-email" className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                      <input
                        id="cancel-email"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="The email used when booking"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a1a1a]"
                      />
                    </div>
                    {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={handleClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                        Keep Booking
                      </button>
                      <button type="submit" disabled={loading} aria-busy={loading}
                        className="flex-1 bg-[#7a1a1a] hover:bg-[#5e1414] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                        {loading ? 'Cancelling…' : 'Cancel Reservation'}
                      </button>
                    </div>
                  </form>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Need help? Call <a href="tel:7322919527" className="underline">732.291.9527</a>
                  </p>
                </>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${result.refunded ? 'bg-green-100' : 'bg-gray-100'}`} aria-hidden="true">
                    <svg className={`w-8 h-8 ${result.refunded ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Reservation Cancelled</h3>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{result.message}</p>
                    {result.refunded && result.refundedAmount && (
                      <p className="text-green-700 font-semibold mt-2">${result.refundedAmount.toFixed(2)} refund issued</p>
                    )}
                  </div>
                  <button onClick={handleClose} className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
