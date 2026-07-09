'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createClient } from '@supabase/supabase-js';
import type { Room } from '@/types/leonardo';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Step = 1 | 2 | 3 | 4 | 5;

const ROOM_TYPE_LABELS: Record<string, string> = {
  standard_single: 'Standard Single',
  standard_double: 'Standard Double',
  efficiency:      'Efficiency / Kitchenette',
  deluxe:          'Deluxe',
};

const today    = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

// ── Inner payment form — must live inside <Elements> ─────────────────────────
function PaymentForm({
  bookingMeta,
  onSuccess,
  onError,
}: {
  bookingMeta: { guestName: string; guestEmail: string; guestPhone: string; numGuests: number; notes: string };
  onSuccess: (bookingId: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    try {
      const { error: submitErr } = await elements.submit();
      if (submitErr) { onError(submitErr.message ?? 'Payment error'); return; }

      const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (confirmErr) { onError(confirmErr.message ?? 'Payment failed'); return; }
      if (paymentIntent?.status !== 'succeeded') { onError('Payment not completed'); return; }

      const res = await fetch('/api/leonardo/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id, ...bookingMeta }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? 'Booking failed after payment'); return; }
      onSuccess(data.bookingId);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button type="submit" disabled={paying || !stripe} aria-busy={paying}
        className="w-full bg-[#c8960c] hover:bg-[#b07c08] text-white py-3.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
        {paying ? 'Processing…' : 'Pay & Confirm Booking'}
      </button>
    </form>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function BookingModal({
  triggerLabel = 'Book a Room',
  triggerClassName,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);

  const [checkIn,  setCheckIn]  = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);

  const [rooms,        setRooms]        = useState<(Room & { available: boolean })[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [guestName,  setGuestName]  = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [numGuests,  setNumGuests]  = useState(1);
  const [notes,      setNotes]      = useState('');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingPI,   setCreatingPI]   = useState(false);
  const [bookingId,    setBookingId]    = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  const dialogRef  = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
      : 0;

  const handleClose = useCallback(() => {
    setOpen(false); setStep(1); setSelectedRoom(null); setRooms([]);
    setClientSecret(null); setBookingId(null); setError(null);
    setGuestName(''); setGuestEmail(''); setGuestPhone(''); setNotes('');
    setNumGuests(1);
  }, []);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.key !== 'Tab') return;
      const els = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
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

  // Realtime: refresh availability when any booking changes while user is on room-select step
  useEffect(() => {
    if (!open || step !== 2) return;
    const channel = supabase
      .channel('leo_bookings_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leo_bookings' }, () => {
        fetchRooms();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    setError(null);
    try {
      const res  = await fetch(`/api/leonardo/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
      const data = await res.json();
      const updated: (Room & { available: boolean })[] = data.rooms ?? [];
      setRooms(updated);
      if (selectedRoom) {
        const found = updated.find(r => r.id === selectedRoom.id);
        if (found && !found.available) { setSelectedRoom(null); setError('Your selected room was just booked. Please choose another.'); }
      }
    } catch {
      setError('Could not load room availability. Please try again.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleDateNext = () => {
    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      setError('Please select a valid check-out date after check-in.'); return;
    }
    setError(null); setStep(2); fetchRooms();
  };

  const handleRoomNext = () => {
    if (!selectedRoom) { setError('Please select a room.'); return; }
    setError(null); setStep(3);
  };

  const handleGuestNext = async () => {
    if (!guestName.trim() || !guestEmail.trim()) { setError('Name and email are required.'); return; }
    setError(null); setCreatingPI(true);
    try {
      const res = await fetch('/api/leonardo/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: selectedRoom!.id, checkIn, checkOut, guestEmail: guestEmail.trim(), guestName: guestName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not create payment session.'); return; }
      setClientSecret(data.clientSecret);
      setStep(4);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setCreatingPI(false);
    }
  };

  const totalPrice = selectedRoom ? nights * selectedRoom.price_per_night : 0;

  const stepLabel  = step < 5 ? `Step ${step} of 4` : 'Booking Confirmed';
  const stepTitle: Record<Step, string> = {
    1: 'Choose Your Dates',
    2: 'Select a Room',
    3: 'Your Information',
    4: 'Secure Payment',
    5: 'Booking Confirmed!',
  };

  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)}
        className={triggerClassName ?? 'bg-[#c8960c] hover:bg-[#b07c08] text-white px-8 py-4 text-base font-semibold tracking-wide transition-colors rounded shadow-lg'}>
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />

          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="booking-title" tabIndex={-1}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col focus:outline-none"
            style={{ fontFamily: 'system-ui, sans-serif' }}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0" style={{ background: '#2d5a1e' }}>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest">{stepLabel}</p>
                <h2 id="booking-title" className="text-white font-bold text-lg">{stepTitle[step]}</h2>
              </div>
              <button onClick={handleClose} aria-label="Close booking dialog" className="text-white/60 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="flex-1 p-6">

              {/* Step 1: Dates */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="check-in" className="block text-sm font-semibold text-gray-700 mb-1">Check-in</label>
                      <input id="check-in" type="date" min={today} value={checkIn}
                        onChange={e => { setCheckIn(e.target.value); setError(null); }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]" />
                    </div>
                    <div>
                      <label htmlFor="check-out" className="block text-sm font-semibold text-gray-700 mb-1">Check-out</label>
                      <input id="check-out" type="date" min={checkIn || today} value={checkOut}
                        onChange={e => { setCheckOut(e.target.value); setError(null); }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]" />
                    </div>
                  </div>
                  {nights > 0 && <p className="text-sm text-gray-500 text-center">{nights} night{nights !== 1 ? 's' : ''}</p>}
                  {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
                  <button onClick={handleDateNext} className="w-full bg-[#2d5a1e] hover:bg-[#1e3d13] text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                    See Available Rooms →
                  </button>
                </div>
              )}

              {/* Step 2: Room selection */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{checkIn} → {checkOut} · {nights} night{nights !== 1 ? 's' : ''}</p>
                  {loadingRooms ? (
                    <div className="text-center py-12 text-gray-400">Checking availability…</div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {rooms.filter(r => r.available).length === 0 && (
                        <p className="text-center py-8 text-gray-500">No rooms available for those dates.</p>
                      )}
                      {rooms.filter(r => r.available).map(room => (
                        <button key={room.id} type="button" role="radio" aria-checked={selectedRoom?.id === room.id}
                          onClick={() => { setSelectedRoom(room); setError(null); }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedRoom?.id === room.id ? 'border-[#2d5a1e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">Room {room.room_number}</p>
                              <p className="text-xs font-medium mt-0.5 text-[#c8960c]">{ROOM_TYPE_LABELS[room.type]}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {room.amenities.slice(0, 3).map(a => (
                                  <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="font-bold text-gray-900">${room.price_per_night}<span className="text-xs font-normal text-gray-500">/night</span></p>
                              <p className="text-xs text-gray-400">max {room.max_guests}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
                  {selectedRoom && (
                    <div className="rounded-xl p-3 border text-sm flex justify-between" style={{ background: '#f0f7ee', borderColor: '#2d5a1e44' }}>
                      <span className="text-gray-600">Room {selectedRoom.room_number} × {nights} nights</span>
                      <span className="font-bold">${totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">← Back</button>
                    <button onClick={handleRoomNext} disabled={!selectedRoom} className="flex-1 bg-[#2d5a1e] hover:bg-[#1e3d13] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-40">Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Guest info */}
              {step === 3 && selectedRoom && (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 text-sm text-white space-y-1" style={{ background: '#2d5a1e' }}>
                    <p className="font-semibold">Room {selectedRoom.room_number} — {ROOM_TYPE_LABELS[selectedRoom.type]}</p>
                    <p className="text-white/70">{checkIn} → {checkOut} · {nights} night{nights !== 1 ? 's' : ''}</p>
                    <p className="font-bold text-base text-[#c8960c]">${totalPrice.toFixed(2)} total</p>
                  </div>
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-gray-700">Guest Details</legend>
                    <div>
                      <label htmlFor="b-name" className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                      <input id="b-name" type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Jane Smith"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]" />
                    </div>
                    <div>
                      <label htmlFor="b-email" className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                      <input id="b-email" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="jane@example.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]" />
                    </div>
                    <div>
                      <label htmlFor="b-phone" className="block text-xs font-medium text-gray-600 mb-1">Phone (optional)</label>
                      <input id="b-phone" type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="(555) 555-5555"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]" />
                    </div>
                    <div>
                      <label htmlFor="b-guests" className="block text-xs font-medium text-gray-600 mb-1">Number of Guests</label>
                      <select id="b-guests" value={numGuests} onChange={e => setNumGuests(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]">
                        {Array.from({ length: selectedRoom.max_guests }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n} guest{n !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="b-notes" className="block text-xs font-medium text-gray-600 mb-1">Special Requests (optional)</label>
                      <textarea id="b-notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Early check-in, accessibility needs…"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e] resize-none" />
                    </div>
                  </fieldset>
                  {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} disabled={creatingPI} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-40">← Back</button>
                    <button onClick={handleGuestNext} disabled={creatingPI} aria-busy={creatingPI}
                      className="flex-1 bg-[#2d5a1e] hover:bg-[#1e3d13] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                      {creatingPI ? 'Preparing…' : 'Continue to Payment →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Stripe payment */}
              {step === 4 && clientSecret && selectedRoom && (
                <div className="space-y-5">
                  <div className="rounded-xl p-4 text-sm text-white space-y-1" style={{ background: '#2d5a1e' }}>
                    <p className="font-semibold">Room {selectedRoom.room_number} · {checkIn} → {checkOut}</p>
                    <p className="font-bold text-base text-[#c8960c]">${totalPrice.toFixed(2)} due now</p>
                  </div>
                  {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#2d5a1e' } } }}>
                    <PaymentForm
                      bookingMeta={{ guestName, guestEmail, guestPhone, numGuests, notes }}
                      onSuccess={id => { setBookingId(id); setStep(5); }}
                      onError={msg => setError(msg)}
                    />
                  </Elements>
                  <button onClick={() => { setStep(3); setClientSecret(null); setError(null); }}
                    className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                    ← Back to Guest Info
                  </button>
                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Secured by Stripe
                  </p>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto" aria-hidden="true">
                    <svg className="w-9 h-9 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">You&apos;re booked!</h3>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      Room {selectedRoom?.room_number} is confirmed for {checkIn} → {checkOut}.
                      A receipt was sent to <strong>{guestEmail}</strong>.
                    </p>
                    {bookingId && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl border text-left">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Booking ID — save this to cancel</p>
                        <p className="text-xs font-mono text-gray-700 mt-0.5 break-all">{bookingId}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Questions? Call <a href="tel:7322919527" className="font-semibold underline" style={{ color: '#2d5a1e' }}>732.291.9527</a></p>
                  <button onClick={handleClose} className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50">Close</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
