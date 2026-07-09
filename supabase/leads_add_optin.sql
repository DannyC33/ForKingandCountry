-- Run this in the Supabase SQL Editor to add opt-in tracking to the leads table
alter table public.leads
  add column if not exists email_opt_in boolean not null default false,
  add column if not exists sms_opt_in   boolean not null default false;
