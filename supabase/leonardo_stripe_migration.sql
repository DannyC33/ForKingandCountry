-- Run in Supabase SQL Editor after leonardo_tables.sql

-- Add Stripe + cancellation fields to leo_bookings
ALTER TABLE public.leo_bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_charge_id          TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid               DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS refund_amount             DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS cancelled_at              TIMESTAMPTZ;

-- Allow admin to update all fields
DROP POLICY IF EXISTS "Anyone can update status" ON public.leo_bookings;
CREATE POLICY "Anyone can update bookings" ON public.leo_bookings FOR UPDATE USING (true);

-- Atomic booking creation — prevents race-condition double-bookings
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_room_id                   INTEGER,
  p_guest_name                TEXT,
  p_guest_email               TEXT,
  p_guest_phone               TEXT,
  p_check_in                  DATE,
  p_check_out                 DATE,
  p_num_guests                INTEGER,
  p_total_price               DECIMAL,
  p_notes                     TEXT,
  p_stripe_payment_intent_id  TEXT
)
RETURNS TABLE(booking_id UUID, conflict BOOLEAN)
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking_id       UUID;
  v_conflict_count   INTEGER;
BEGIN
  -- Advisory lock scoped to the room so concurrent requests serialise
  PERFORM pg_advisory_xact_lock(p_room_id::BIGINT);

  SELECT COUNT(*) INTO v_conflict_count
  FROM leo_bookings
  WHERE room_id   = p_room_id
    AND status   != 'cancelled'
    AND check_in  < p_check_out
    AND check_out > p_check_in;

  IF v_conflict_count > 0 THEN
    RETURN QUERY SELECT NULL::UUID, TRUE;
    RETURN;
  END IF;

  INSERT INTO leo_bookings (
    room_id, guest_name, guest_email, guest_phone,
    check_in, check_out, num_guests, total_price,
    status, notes, stripe_payment_intent_id, amount_paid
  ) VALUES (
    p_room_id, p_guest_name, p_guest_email, p_guest_phone,
    p_check_in, p_check_out, p_num_guests, p_total_price,
    'confirmed', p_notes, p_stripe_payment_intent_id, p_total_price
  )
  RETURNING id INTO v_booking_id;

  RETURN QUERY SELECT v_booking_id, FALSE;
END;
$$;
