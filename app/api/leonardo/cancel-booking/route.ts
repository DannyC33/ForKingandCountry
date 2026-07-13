import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST — guest self-service cancellation with optional Stripe refund
export async function POST(req: NextRequest) {
  const { bookingId, guestEmail } = await req.json();

  if (!bookingId || !guestEmail) {
    return NextResponse.json({ error: 'Booking ID and email are required.' }, { status: 400 });
  }

  // Look up the booking — email must match to prevent unauthorised cancellations
  const { data: booking, error: fetchError } = await supabase
    .from('leo_bookings')
    .select('id, status, check_in, stripe_payment_intent_id, amount_paid, refund_amount, guest_email')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  if (booking.guest_email.toLowerCase() !== guestEmail.toLowerCase()) {
    return NextResponse.json({ error: 'Email does not match this booking.' }, { status: 403 });
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'This booking is already cancelled.' }, { status: 400 });
  }

  if (booking.status === 'completed') {
    return NextResponse.json({ error: 'Completed stays cannot be cancelled.' }, { status: 400 });
  }

  // Determine refund eligibility: full refund if >48 hours before check-in
  const checkInDate = new Date(booking.check_in);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / 3_600_000;
  const eligibleForRefund =
    hoursUntilCheckIn > 48 &&
    booking.stripe_payment_intent_id &&
    booking.amount_paid &&
    !booking.refund_amount;

  let refundedAmount = 0;

  if (eligibleForRefund) {
    try {
      const refund = await getStripe().refunds.create({
        payment_intent: booking.stripe_payment_intent_id!,
        amount: Math.round(Number(booking.amount_paid) * 100),
      });
      refundedAmount = refund.amount / 100;
    } catch {
      return NextResponse.json({ error: 'Refund failed. Please contact us at 732.291.9527.' }, { status: 500 });
    }
  }

  // Mark as cancelled
  const { error: updateError } = await supabase
    .from('leo_bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      refund_amount: refundedAmount > 0 ? refundedAmount : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to cancel booking.' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    refunded: refundedAmount > 0,
    refundedAmount,
    message: refundedAmount > 0
      ? `Booking cancelled. A refund of $${refundedAmount.toFixed(2)} has been issued to your card (3–5 business days).`
      : hoursUntilCheckIn <= 48
        ? 'Booking cancelled. Cancellations within 48 hours of check-in are non-refundable.'
        : 'Booking cancelled.',
  });
}
