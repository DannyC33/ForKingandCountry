-- ── Leonardo Motel schema ──────────────────────────────────────────────────
-- Run in Supabase SQL Editor

-- Rooms table
CREATE TABLE IF NOT EXISTS public.leo_rooms (
  id               SERIAL PRIMARY KEY,
  room_number      INTEGER UNIQUE NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('standard_single','standard_double','efficiency','deluxe')),
  name             TEXT NOT NULL,
  description      TEXT,
  max_guests       INTEGER NOT NULL DEFAULT 2,
  price_per_night  DECIMAL(10,2) NOT NULL,
  amenities        TEXT[] DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.leo_bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       INTEGER NOT NULL REFERENCES public.leo_rooms(id),
  guest_name    TEXT NOT NULL,
  guest_email   TEXT NOT NULL,
  guest_phone   TEXT,
  check_in      DATE NOT NULL,
  check_out     DATE NOT NULL,
  num_guests    INTEGER NOT NULL DEFAULT 1 CHECK (num_guests >= 1),
  total_price   DECIMAL(10,2),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_leo_bookings_room_dates ON public.leo_bookings (room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_leo_bookings_email ON public.leo_bookings (guest_email);
CREATE INDEX IF NOT EXISTS idx_leo_bookings_status ON public.leo_bookings (status);

-- RLS
ALTER TABLE public.leo_rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leo_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"    ON public.leo_rooms    FOR SELECT USING (true);
CREATE POLICY "Anyone can read bookings" ON public.leo_bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can book"          ON public.leo_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update status" ON public.leo_bookings FOR UPDATE USING (true);

-- ── Seed 25 rooms ─────────────────────────────────────────────────────────
INSERT INTO public.leo_rooms (room_number, type, name, description, max_guests, price_per_night, amenities)
VALUES
  -- Standard Single (rooms 101–108) — $89/night
  (101,'standard_single','Room 101','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (102,'standard_single','Room 102','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (103,'standard_single','Room 103','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (104,'standard_single','Room 104','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (105,'standard_single','Room 105','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (106,'standard_single','Room 106','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (107,'standard_single','Room 107','Cozy room with one double bed',          2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (108,'standard_single','Room 108','Cozy room with one double bed, ground floor', 2, 89.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),

  -- Standard Double (rooms 109–116) — $109/night
  (109,'standard_double','Room 109','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (110,'standard_double','Room 110','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (111,'standard_double','Room 111','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (112,'standard_double','Room 112','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (113,'standard_double','Room 113','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (114,'standard_double','Room 114','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (115,'standard_double','Room 115','Spacious room with two double beds',     4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),
  (116,'standard_double','Room 116','Corner room with two double beds',       4,109.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower']),

  -- Efficiency / Kitchenette (rooms 117–122) — $129/night
  (117,'efficiency','Room 117','Room with kitchenette — ideal for extended stays', 4,129.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave']),
  (118,'efficiency','Room 118','Room with kitchenette — ideal for extended stays', 4,129.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave']),
  (119,'efficiency','Room 119','Room with kitchenette — ideal for extended stays', 4,129.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave']),
  (120,'efficiency','Room 120','Room with kitchenette — ideal for extended stays', 4,129.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave']),
  (121,'efficiency','Room 121','Room with kitchenette — ideal for extended stays', 4,129.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave']),
  (122,'efficiency','Room 122','Room with kitchenette — ideal for extended stays', 4,129.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave']),

  -- Deluxe (rooms 123–125) — $149/night
  (123,'deluxe','Room 123','Larger deluxe room, premium furnishings',         4,149.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave','Extra Space']),
  (124,'deluxe','Room 124','Larger deluxe room, premium furnishings',         4,149.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave','Extra Space']),
  (125,'deluxe','Room 125','Corner deluxe room, premium furnishings',         4,149.00, ARRAY['Cable TV','Refrigerator','Free Wi-Fi','Private Shower','Full Kitchen','Microwave','Extra Space'])
ON CONFLICT (room_number) DO NOTHING;
