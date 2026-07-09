import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('leo_admin')?.value;
  return !!token && token === process.env.LEONARDO_ADMIN_PASSWORD;
}

// POST — admin manual refund
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId, amountCents } = await req.json();
  if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

  const { data: booking } = await supabase
    .from('leo_bookings')
    .select('stripe_payment_intent_id, amount_paid')
    .eq('id', bookingId)
    .single();

  if (!booking?.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'No Stripe payment found for this booking' }, { status: 404 });
  }

  const refundParams: { payment_intent: string; amount?: number } = {
    payment_intent: booking.stripe_payment_intent_id,
  };
  if (amountCents) refundParams.amount = amountCents;

  const refund = await stripe.refunds.create(refundParams);
  const refundedAmount = refund.amount / 100;

  await supabase
    .from('leo_bookings')
    .update({ refund_amount: refundedAmount, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  return NextResponse.json({ success: true, refundedAmount });
}
