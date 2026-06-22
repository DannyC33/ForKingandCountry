-- Run this in the Supabase SQL Editor
create table public.leads (
  id          uuid        default gen_random_uuid() primary key,
  business_name text      not null,
  services    text[]      not null default '{}',
  name        text        not null,
  phone       text,
  email       text        not null,
  pain_point  text,
  created_at  timestamptz default now() not null
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow the public form to insert leads without being logged in
create policy "Allow anonymous inserts"
  on public.leads
  for insert
  to anon
  with check (true);
