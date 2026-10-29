-- ============================================================
-- Matto Bayat – Supabase schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Admins ------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Categories -------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{"fi":"","en":"","fa":""}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Products ---------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references public.categories (id) on delete set null,
  name jsonb not null default '{"fi":"","en":"","fa":""}',
  description jsonb not null default '{"fi":"","en":"","fa":""}',
  price numeric(10,2),
  compare_at_price numeric(10,2),
  width_cm int,
  length_cm int,
  shape text not null default 'rectangle',
  material text not null default 'wool',
  origin text not null default 'iran',
  weave text not null default 'machine-made',
  colors text[] not null default '{}',
  stock int not null default 1,
  featured boolean not null default false,
  active boolean not null default true,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_active_idx on public.products (active, created_at desc);

-- ---------- Reservations -----------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  email text check (email is null or char_length(email) <= 200),
  message text check (message is null or char_length(message) <= 2000),
  fulfilment text not null default 'pickup' check (fulfilment in ('pickup','delivery')),
  address text check (address is null or char_length(address) <= 400),
  items jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  status text not null default 'new' check (status in ('new','confirmed','ready','completed','cancelled')),
  locale text not null default 'fi',
  admin_note text
);

-- ---------- Contact messages -------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 40),
  email text check (email is null or char_length(email) <= 200),
  subject text check (subject is null or char_length(subject) <= 200),
  body text not null check (char_length(body) between 1 and 4000),
  handled boolean not null default false
);

-- ---------- Settings (single row) --------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into public.settings (id, data) values (1, '{}') on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.reservations enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- admins: a user can see their own admin row (used to check access)
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

-- categories: public read, admin write
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- products: public reads visible products, admin reads/writes everything
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- reservations: anyone can create (status must be 'new'), only admin can read/update/delete
drop policy if exists "reservations public insert" on public.reservations;
create policy "reservations public insert" on public.reservations for insert with check (status = 'new' and admin_note is null);
drop policy if exists "reservations admin all" on public.reservations;
create policy "reservations admin all" on public.reservations for all using (public.is_admin()) with check (public.is_admin());

-- messages: anyone can create, only admin can read/update/delete
drop policy if exists "messages public insert" on public.messages;
create policy "messages public insert" on public.messages for insert with check (handled = false);
drop policy if exists "messages admin all" on public.messages;
create policy "messages admin all" on public.messages for all using (public.is_admin()) with check (public.is_admin());

-- settings: public read, admin write
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage buckets for images (public read, admin write)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do update set public = true;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select using (bucket_id in ('products', 'site'));
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert with check (bucket_id in ('products', 'site') and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update using (bucket_id in ('products', 'site') and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete using (bucket_id in ('products', 'site') and public.is_admin());

-- ============================================================
-- Make the shop owner an admin.
-- 1) Create the user first: Supabase → Authentication → Users → Add user
--    (email + password, tick "Auto confirm user").
-- 2) Then run (change the email if needed):
-- ============================================================
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'egbayat@gmail.com'
-- on conflict do nothing;
