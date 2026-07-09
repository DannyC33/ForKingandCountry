import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/leonardo/rooms?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
// Returns all active rooms, marking which are available for the given date range.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const checkIn  = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  // Fetch all active rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('leo_rooms')
    .select('*')
    .eq('is_active', true)
    .order('room_number');

  if (roomsError) {
    return NextResponse.json({ error: roomsError.message }, { status: 500 });
  }

  if (!checkIn || !checkOut) {
    return NextResponse.json({ rooms });
  }

  // Find rooms booked during the requested period
  const { data: conflicts } = await supabase
    .from('leo_bookings')
    .select('room_id')
    .not('status', 'eq', 'cancelled')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  const bookedIds = new Set((conflicts ?? []).map((b: { room_id: number }) => b.room_id));

  const roomsWithAvailability = (rooms ?? []).map((r: { id: number }) => ({
    ...r,
    available: !bookedIds.has(r.id),
  }));

  return NextResponse.json({ rooms: roomsWithAvailability });
}
