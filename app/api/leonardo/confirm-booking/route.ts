import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST — called after Stripe payment succeeds; creates booking atomically
export async function POST(req: NextRequest) {
  const { paymentIntentId, guestName, guestEmail, guestPhone, numGuests, notes } = await req.json();

  if (!paymentIntentId || !guestName || !guestEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify payment actually succeeded on Stripe's side
  const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== 'succeeded') {
    return NextResponse.json({ error: 'Payment not yet confirmed' }, { status: 402 });
  }

  const { roomId, checkIn, checkOut } = pi.metadata;
  const totalPrice = pi.amount / 100;

  // Atomic insert via DB function — prevents race-condition double bookings
  const { data, error } = await supabase.rpc('create_booking_atomic', {
    p_room_id:                   Number(roomId),
    p_guest_name:                guestName,
    p_guest_email:               guestEmail.toLowerCase(),
    p_guest_phone:               guestPhone || null,
    p_check_in:                  checkIn,
    p_check_out:                 checkOut,
    p_num_guests:                numGuests ?? 1,
    p_total_price:               totalPrice,
    p_notes:                     notes || null,
    p_stripe_payment_intent_id:  paymentIntentId,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
  }

  const result = data?.[0];
  if (result?.conflict) {
    // Room was just taken — refund automatically
    await getStripe().refunds.create({ payment_intent: paymentIntentId });
    return NextResponse.json(
      { error: 'Room was just booked by someone else. Your payment has been refunded.' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, bookingId: result?.booking_id });
}
