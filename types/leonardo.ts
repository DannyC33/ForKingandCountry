export type RoomType = 'standard_single' | 'standard_double' | 'efficiency' | 'deluxe';

export type Room = {
  id: number;
  room_number: number;
  type: RoomType;
  name: string;
  description: string;
  max_guests: number;
  price_per_night: number;
  amenities: string[];
  is_active: boolean;
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Booking = {
  id: string;
  room_id: number;
  room?: Room;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
