-- ============================================================
-- Matto Bayat – Complete Supabase Schema, Storage, RLS & Seed Data
-- Run this in Supabase → SQL Editor → New query → Run (or via Supabase MCP).
-- Safe to run multiple times (idempotent).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- 1. Admins ------------------------------------------------
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

-- ---------- 2. Categories -------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{"fi":"","en":"","fa":""}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 3. Products ---------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text,
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
alter table public.products add column if not exists code text;
create index if not exists products_active_idx on public.products (active, created_at desc);

-- ---------- 4. Reservations -----------------------------------------
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

-- ---------- 5. Contact messages -------------------------------------
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

-- ---------- 6. Settings (single row) --------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS)
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
-- Storage Buckets for Images (public read, admin write)
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
-- Initial Seed Data: Categories, Products & Settings
-- ============================================================

-- 1) Seed Categories
insert into public.categories (slug, sort_order, name)
values
  ('iranilaiset-matot', 1, '{"fi": "Iranilaiset matot", "en": "Persian rugs", "fa": "قالین ایرانی"}'::jsonb),
  ('turkkilaiset-matot', 2, '{"fi": "Turkkilaiset matot", "en": "Turkish rugs", "fa": "قالین ترکی"}'::jsonb),
  ('afganistanilaiset-matot', 3, '{"fi": "Afganistanilaiset matot", "en": "Afghan rugs", "fa": "قالین افغانی"}'::jsonb),
  ('kaytava-ja-pyoreat', 4, '{"fi": "Käytävä- ja pyöreät matot", "en": "Runners & round rugs", "fa": "سرانداز و قالین گرد"}'::jsonb),
  ('verhot-peitot', 5, '{"fi": "Verhot ja peitot", "en": "Curtains & blankets", "fa": "پرده و کمپل"}'::jsonb)
on conflict (slug) do update
set sort_order = excluded.sort_order,
    name = excluded.name;

-- 2) Seed Products
insert into public.products (
  slug, category_id, name, description, price, compare_at_price,
  width_cm, length_cm, shape, material, origin, weave, colors,
  stock, featured, active, images
)
values
  (
    'kashan-luumu-medaljonki',
    (select id from public.categories where slug = 'iranilaiset-matot'),
    '{"fi": "Kashan – luumu & kulta", "en": "Kashan – Plum & Gold", "fa": "قالین کاشان – آلوبالویی و طلایی"}'::jsonb,
    '{"fi": "Ylellinen Kashan-tyylinen matto syvän luumunvärisellä pohjalla ja kultaisella medaljongilla. Tiheä kudos ja pehmeä nukka tekevät siitä olohuoneen keskipisteen.", "en": "A luxurious Kashan-style rug with a deep plum field and a golden medallion. Dense weave and soft pile make it the centrepiece of any living room.", "fa": "قالین مقبول به نقشه کاشان با رنگ آلوبالویی و ترنج طلایی. بافت فشرده و پشم نرم دارد و برای صالون و مهمانخانه بسیار مناسب است."}'::jsonb,
    690, 850, 200, 300, 'rectangle', 'wool', 'iran', 'machine-made',
    array['plum', 'gold', 'ivory'], 3, true, true,
    array['/images/products/kashan-plum.jpg', '/images/site/detail.jpg', '/images/site/rolls.jpg']
  ),
  (
    'tabriz-punainen',
    (select id from public.categories where slug = 'iranilaiset-matot'),
    '{"fi": "Tabriz – punainen klassikko", "en": "Tabriz – Classic Red", "fa": "قالین تبریز – سرخ کلاسیک"}'::jsonb,
    '{"fi": "Ajaton Tabriz-kuvio punaisella pohjalla ja tummansinisellä reunuksella. Klassinen valinta, joka sopii niin moderniin kuin perinteiseen sisustukseen.", "en": "A timeless Tabriz design on a red field with a navy border. A classic choice that suits both modern and traditional interiors.", "fa": "نقشه اصیل تبریز با زمینه سرخ و حاشیه سرمه‌ای. یک قالین دستباف کلاسیک که هم به خانه‌های مدرن و هم سنتی بسیار می‌آید."}'::jsonb,
    1290, null, 250, 350, 'rectangle', 'wool', 'iran', 'hand-knotted',
    array['red', 'navy', 'ivory'], 1, true, true,
    array['/images/products/tabriz-red.jpg', '/images/products/medallion-red.jpg', '/images/site/detail.jpg']
  ),
  (
    'qom-silkki-puutarha',
    (select id from public.categories where slug = 'iranilaiset-matot'),
    '{"fi": "Qom-silkki – puutarha", "en": "Qom Silk – Garden", "fa": "قالین ابریشمی قم – طرح باغ"}'::jsonb,
    '{"fi": "Hienostunut silkkimatto vaalealla pohjalla ja herkillä kukkakuvioilla. Silkki hohtaa kauniisti valon mukaan.", "en": "A refined silk rug with an ivory field and delicate floral motifs. The silk shimmers beautifully as the light changes.", "fa": "قالین ظریف ابریشمی با زمینه شیری و گل‌های مقبول. نخ ابریشم آن در روشنی بسیار زیبا می‌درخشد."}'::jsonb,
    null, null, 150, 220, 'rectangle', 'silk', 'iran', 'hand-knotted',
    array['ivory', 'plum', 'gold'], 1, true, true,
    array['/images/products/qom-silk.jpg']
  ),
  (
    'punainen-medaljonki',
    (select id from public.categories where slug = 'iranilaiset-matot'),
    '{"fi": "Medaljonki – rubiininpunainen", "en": "Medallion – Ruby Red", "fa": "قالین ترنج‌دار – سرخ لاکی"}'::jsonb,
    '{"fi": "Kirkkaan punainen matto, jossa vaalea medaljonki ja rikas kukkareunus. Myymälämme suosituimpia malleja.", "en": "A vivid red rug with a pale medallion and a rich floral border. One of the most popular designs in our store.", "fa": "قالین سرخ روشن با ترنج مقبول و حاشیه گل‌دار. یکی از پرطرفدارترین قالین‌های دکان ما."}'::jsonb,
    450, null, 250, 350, 'rectangle', 'acrylic', 'iran', 'machine-made',
    array['red', 'ivory', 'blue'], 6, true, true,
    array['/images/products/medallion-red.jpg']
  ),
  (
    'anatolia-kelim',
    (select id from public.categories where slug = 'turkkilaiset-matot'),
    '{"fi": "Anatolia-kelim", "en": "Anatolia Kilim", "fa": "گلیم دستباف آناتولی"}'::jsonb,
    '{"fi": "Käsin kudottu kelim lämpimin terrakotan ja sinapin sävyin. Kevyt, kääntöpuolinen ja helppo pitää puhtaana.", "en": "A hand-woven kilim in warm terracotta and mustard tones. Light, reversible and easy to keep clean.", "fa": "گلیم دستباف پشمی با رنگ‌های گرم. سبک، دورو و بسیار آسان برای پاک‌کاری و شستن."}'::jsonb,
    290, null, 160, 230, 'rectangle', 'wool', 'turkey', 'flatweave',
    array['red', 'gold', 'plum'], 4, false, true,
    array['/images/products/kilim-anatolia.jpg']
  ),
  (
    'vintage-salvia',
    (select id from public.categories where slug = 'turkkilaiset-matot'),
    '{"fi": "Vintage – salvia & roosa", "en": "Vintage – Sage & Rose", "fa": "قالین مدرن ترکی – سبز روشن"}'::jsonb,
    '{"fi": "Moderni turkkilainen matto haalistetulla vintage-ilmeellä. Pehmeät sävyt sopivat skandinaaviseen kotiin.", "en": "A modern Turkish rug with a faded vintage look. Soft tones that suit a Scandinavian home.", "fa": "قالین مدرن ترکی با رنگ‌های ملایم و روشن که به خانه‌های فنلند بسیار خوب می‌آید."}'::jsonb,
    249, 299, 160, 230, 'rectangle', 'polyester', 'turkey', 'machine-made',
    array['green', 'beige'], 8, true, true,
    array['/images/products/vintage-sage.jpg']
  ),
  (
    'heriz-kaytavamatto',
    (select id from public.categories where slug = 'kaytava-ja-pyoreat'),
    '{"fi": "Heriz-käytävämatto", "en": "Heriz Runner", "fa": "سرانداز (کناره) هریس"}'::jsonb,
    '{"fi": "Geometrinen Heriz-kuvio ruosteenpunaisena ja tummansinisenä. Täydellinen eteiseen tai käytävään.", "en": "A geometric Heriz design in rust red and navy. Perfect for a hallway or entrance.", "fa": "سرانداز دستباف پشمی با نقشه هریس به رنگ سرخ و سرمه‌ای. بسیار مناسب برای دهلیز و راهرو خانه."}'::jsonb,
    320, null, 80, 300, 'runner', 'wool', 'iran', 'hand-knotted',
    array['red', 'navy'], 2, false, true,
    array['/images/products/heriz-runner.jpg']
  ),
  (
    'isfahan-pyorea',
    (select id from public.categories where slug = 'kaytava-ja-pyoreat'),
    '{"fi": "Isfahan – pyöreä", "en": "Isfahan – Round", "fa": "قالین گرد اصفهان"}'::jsonb,
    '{"fi": "Pyöreä Isfahan-matto vaaleansinisellä medaljongilla ja luumunvärisellä reunuksella. Kaunis ruokapöydän alle.", "en": "A round Isfahan rug with a pale blue medallion and plum border. Beautiful under a dining table.", "fa": "قالین گرد با ترنج آبی روشن و حاشیه آلوبالویی. بسیار مقبول برای زیر میز نانخوری یا وسط صالون."}'::jsonb,
    380, null, 200, 200, 'round', 'wool-silk', 'iran', 'machine-made',
    array['ivory', 'blue', 'plum'], 2, false, true,
    array['/images/products/isfahan-round.jpg']
  ),
  (
    'samettipeitot',
    (select id from public.categories where slug = 'verhot-peitot'),
    '{"fi": "Samettipeitot – jacquard", "en": "Velvet Throws – Jacquard", "fa": "کمپل مخملی گل‌دار"}'::jsonb,
    '{"fi": "Pehmeät samettipeitot orientaalisella jacquard-kuviolla. Saatavilla luumun, kullan ja kerman sävyissä.", "en": "Soft velvet throws with an oriental jacquard pattern. Available in plum, gold and cream.", "fa": "کمپل‌های مخملی بسیار نرم و گرم با نقش‌های شرقی. موجود در رنگ‌های آلوبالویی، طلایی و کریمی."}'::jsonb,
    69, null, 150, 200, 'rectangle', 'polyester', 'turkey', 'other',
    array['plum', 'gold', 'ivory'], 20, false, true,
    array['/images/products/velvet-throws.jpg']
  )
on conflict (slug) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    width_cm = excluded.width_cm,
    length_cm = excluded.length_cm,
    shape = excluded.shape,
    material = excluded.material,
    origin = excluded.origin,
    weave = excluded.weave,
    colors = excluded.colors,
    stock = excluded.stock,
    featured = excluded.featured,
    active = excluded.active,
    images = excluded.images,
    updated_at = now();

-- 3) Seed Store Settings (Putkitie 6, Helsinki, Opening Hours, Site Images, Reviews)
insert into public.settings (id, data, updated_at)
values (
  1,
  '{
    "phone": "+358 44 971 5631",
    "whatsapp": "358449715631",
    "email": "egbayat@gmail.com",
    "address": "Putkitie 6",
    "postal": "00880",
    "city": "Helsinki",
    "business_id": "2873455-9",
    "instagram": "https://www.instagram.com/matto.bayat/",
    "facebook": "https://www.facebook.com/mattobayat/",
    "tiktok": "https://www.tiktok.com/@matto.bayat",
    "announcement": {
      "fi": "Aitoja itämaisia mattoja Putkitiellä · Varaa verkossa, maksa ja tutustu myymälässä",
      "en": "Authentic oriental rugs at Putkitie 6 · Reserve online, inspect and pay in store",
      "fa": "قالین‌های اصیل افغانی، ایرانی و ترکی در Putkitie 6, Helsinki · آنلاین قید کنید، در دکان ببینید و بپردازید"
    },
    "announcement_active": true,
    "hours": {
      "mon_fri": { "open": "10:00", "close": "19:00", "closed": false },
      "sat": { "open": "10:00", "close": "19:00", "closed": false },
      "sun": { "open": "11:00", "close": "18:00", "closed": false }
    },
    "site_images": {
      "hero": "/images/site/hero.jpg",
      "showroom": "/images/site/showroom.jpg",
      "rolls": "/images/site/rolls.jpg",
      "detail": "/images/site/detail.jpg",
      "boutique": "/images/site/boutique.jpg"
    }
  }'::jsonb,
  now()
)
on conflict (id) do update
set data = public.settings.data || excluded.data,
    updated_at = now();

-- ============================================================
-- Make the shop owner an admin:
-- 1) Create the user first: Supabase → Authentication → Users → Add user
--    (email + password, tick "Auto confirm user").
-- 2) Then run (change the email if needed):
-- ============================================================
insert into public.admins (user_id)
select id from auth.users where email in ('rezaeizain@gmail.com', 'egbayat@gmail.com')
on conflict do nothing;
