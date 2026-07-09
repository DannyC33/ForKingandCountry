import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('leo_admin')?.value;
  return !!token && token === process.env.LEONARDO_ADMIN_PASSWORD;
}

// GET /api/leonardo/admin/bookings  — list all bookings (admin only)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('leo_bookings')
    .select(`
      *,
      room:leo_rooms(room_number, type, name, price_per_night)
    `)
    .order('check_in', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

// PATCH /api/leonardo/admin/bookings  — update any booking fields (admin only)
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status, check_in, check_out, room_id, guest_name, guest_email, guest_phone, num_guests, notes } = body;

  if (!id) return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });

  const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Build update payload — only include provided fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status)      updates.status      = status;
  if (check_in)    updates.check_in    = check_in;
  if (check_out)   updates.check_out   = check_out;
  if (room_id)     updates.room_id     = room_id;
  if (guest_name)  updates.guest_name  = guest_name;
  if (guest_email) updates.guest_email = guest_email.toLowerCase();
  if (guest_phone !== undefined) updates.guest_phone = guest_phone || null;
  if (num_guests)  updates.num_guests  = num_guests;
  if (notes !== undefined) updates.notes = notes || null;
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('leo_bookings')
    .update(updates)
    .eq('id', id)
    .select('*, room:leo_rooms(room_number, type, name, price_per_night)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ booking: data });
}
