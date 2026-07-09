import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST — verify availability and create a Stripe PaymentIntent
export async function POST(req: NextRequest) {
  const { roomId, checkIn, checkOut, guestEmail, guestName } = await req.json();

  if (!roomId || !checkIn || !checkOut || !guestEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Confirm room still available
  const { data: conflicts } = await supabase
    .from('leo_bookings')
    .select('id')
    .eq('room_id', roomId)
    .not('status', 'eq', 'cancelled')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'Room is no longer available for those dates.' }, { status: 409 });
  }

  // Get room price
  const { data: room } = await supabase
    .from('leo_rooms')
    .select('price_per_night, name')
    .eq('id', roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
  );
  const totalCents = Math.round(nights * Number(room.price_per_night) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    receipt_email: guestEmail,
    description: `Leonardo Motel — ${room.name} · ${checkIn} to ${checkOut}`,
    metadata: {
      roomId: String(roomId),
      checkIn,
      checkOut,
      guestName: guestName ?? '',
      guestEmail,
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
