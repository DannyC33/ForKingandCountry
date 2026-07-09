import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, guestName, guestEmail, guestPhone, checkIn, checkOut, numGuests, notes } = body;

  if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
  }

  // Verify room exists and is active
  const { data: room, error: roomError } = await supabase
    .from('leo_rooms')
    .select('id, price_per_night, max_guests')
    .eq('id', roomId)
    .eq('is_active', true)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  if ((numGuests ?? 1) > room.max_guests) {
    return NextResponse.json({ error: `This room fits a maximum of ${room.max_guests} guests` }, { status: 400 });
  }

  // Check availability
  const { data: conflicts } = await supabase
    .from('leo_bookings')
    .select('id')
    .eq('room_id', roomId)
    .not('status', 'eq', 'cancelled')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'Room is not available for the selected dates' }, { status: 409 });
  }

  // Calculate price
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
  );
  const totalPrice = parseFloat((nights * Number(room.price_per_night)).toFixed(2));

  const { data: booking, error: insertError } = await supabase
    .from('leo_bookings')
    .insert({
      room_id: roomId,
      guest_name: guestName,
      guest_email: guestEmail.toLowerCase(),
      guest_phone: guestPhone || null,
      check_in: checkIn,
      check_out: checkOut,
      num_guests: numGuests ?? 1,
      total_price: totalPrice,
      status: 'pending',
      notes: notes || null,
    })
    .select('id, total_price, status')
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking });
}
