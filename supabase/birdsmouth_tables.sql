-- ════════════════════════════════════════════════════════════
-- Birdsmouth Brewery — Vendor Portal Schema
-- Run in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

-- Products catalog
create table if not exists bm_products (
  id          uuid          default gen_random_uuid() primary key,
  name        text          not null,
  sku         text          not null unique,
  category    text          not null check (category in ('keg', 'packaged')),
  size        text          not null,
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  available   boolean       not null default true,
  created_at  timestamptz   default now() not null
);

-- Orders (one per vendor submission)
create table if not exists bm_orders (
  id             uuid          default gen_random_uuid() primary key,
  vendor_id      uuid          references auth.users(id) not null,
  vendor_email   text          not null,
  status         text          not null default 'pending'
                               check (status in ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  requested_date date,
  notes          text,
  total          numeric(10,2) not null default 0,
  created_at     timestamptz   default now() not null,
  updated_at     timestamptz   default now() not null
);

-- Order line items
create table if not exists bm_order_items (
  id            uuid          default gen_random_uuid() primary key,
  order_id      uuid          references bm_orders(id) on delete cascade not null,
  product_id    uuid          references bm_products(id) not null,
  product_name  text          not null, -- snapshot at time of order
  quantity      integer       not null check (quantity > 0),
  unit_price    numeric(10,2) not null,
  subtotal      numeric(10,2) not null
);

-- ── Row Level Security ────────────────────────────────────────

alter table bm_products   enable row level security;
alter table bm_orders     enable row level security;
alter table bm_order_items enable row level security;

-- Products: any authenticated vendor can read available products
create policy "Vendors can view available products"
  on bm_products for select to authenticated
  using (available = true);

-- Orders: vendors can only see and manage their own orders
create policy "Vendors can view own orders"
  on bm_orders for select to authenticated
  using (vendor_id = auth.uid());

create policy "Vendors can place orders"
  on bm_orders for insert to authenticated
  with check (vendor_id = auth.uid());

create policy "Vendors can cancel own pending orders"
  on bm_orders for update to authenticated
  using  (vendor_id = auth.uid() and status = 'pending')
  with check (vendor_id = auth.uid() and status = 'cancelled');

-- Order items: scoped to the vendor's own orders
create policy "Vendors can view own order items"
  on bm_order_items for select to authenticated
  using (
    exists (
      select 1 from bm_orders
      where bm_orders.id = bm_order_items.order_id
        and bm_orders.vendor_id = auth.uid()
    )
  );

create policy "Vendors can insert items on own orders"
  on bm_order_items for insert to authenticated
  with check (
    exists (
      select 1 from bm_orders
      where bm_orders.id = bm_order_items.order_id
        and bm_orders.vendor_id = auth.uid()
        and bm_orders.status = 'pending'
    )
  );

-- ── Seed products ─────────────────────────────────────────────

insert into bm_products (name, sku, category, size, unit_price) values
  ('Birdsmouth Lager — Half Barrel Keg',    'BM-KEG-HALF',    'keg',      '1/2 BBL (15.5 gal)',  175.00),
  ('Birdsmouth Lager — Quarter Barrel Keg', 'BM-KEG-QUARTER', 'keg',      '1/4 BBL (7.75 gal)',   95.00),
  ('Birdsmouth Lager — Sixth Barrel Keg',   'BM-KEG-SIXTH',   'keg',      '1/6 BBL (5.16 gal)',   70.00),
  ('Birdsmouth Lager — Case (24 cans)',      'BM-CASE-24',     'packaged', 'Case / 24 × 12 oz',    48.00),
  ('Birdsmouth Lager — 6-Pack',             'BM-6PACK',       'packaged', '6 × 12 oz cans',       10.00)
on conflict (sku) do nothing;
