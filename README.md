# Matto Bayat · فرش بیات

> Modern, multilingual web application and reservation portal for **Matto Bayat** (Helsinki, Putkitie 6). Oriental rugs, Persian silk carpets, Turkish kilims, Afghan runners, luxury curtains, and home textiles.

---

## ✨ Features

- **3 Full Languages & True RTL**:
  - 🇫🇮 **Suomi** (`/fi`)
  - 🇬🇧 **English** (`/en`)
  - 🇮🇷/🇦🇫 **فارسی / دری** (`/fa`) with full Right-to-Left (RTL) layout and custom typography ([Vazirmatn](https://fonts.google.com/specimen/Vazirmatn)).
- **Reservation & Store Pickup Model (Model B)**:
  - Customers browse authentic inventory, choose dimensions, and submit a reservation request online with 0 upfront card risk.
  - Pay at store upon pickup or pay on delivery.
  - Slide-in client cart with real-time free delivery progress bar (free in Helsinki over 200 €).
- **Interactive Room Size Calculator**:
  - Live 2D room & rug preview tool (`/[lang]/guide`) to help customers visualize standard rug sizes (e.g., `160×230`, `200×300`, `250×350`) in living rooms, dining rooms, and bedrooms.
- **Rug Care Handbook**:
  - Practical Persian wool & silk rug care instructions, vacuuming, spot cleaning, and summer storage advice.
- **Owner Admin Dashboard (`/[lang]/admin`)**:
  - Manage products (add/edit titles, prices, compare prices, stock, sizes, categories, origins, materials, weaves, shapes, photos, and hide/show status).
  - View incoming reservations with customer contact, items, and status workflow (`Uusi` → `Vahvistettu` → `Valmis noudettavaksi` → `Valmis` → `Peruttu`) with 1-tap call button.
  - Customer messages inbox.
  - Live store settings: edit opening hours, phone, WhatsApp number, announcement banner, and free delivery threshold.
- **Graceful Demo Fallback**:
  - Works immediately out of the box with realistic seed data and authentic Putkitie 6 store photos.
  - Seamlessly activates PostgreSQL database and auth once Supabase credentials are provided.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack, React 19, TypeScript)
- **Styling**: Vanilla CSS design tokens (`src/app/globals.css`) — Scandinavian light ivory `#faf7f2`, deep plum `#5b2559`, and warm gold `#b0883f` derived from the store's business card.
- **Typography**:
  - Serif headings: *Cormorant Garamond*
  - Body: *Manrope*
  - Persian/Farsi & Dari: *Vazirmatn*
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL, Row-Level Security, Auth, Storage) with automatic fallback to memory demo data.
- **i18n Routing**: App Router dynamic segments `/[lang]` with Next 16 `proxy.ts`.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Finnish home page. The application automatically redirects root `/` to `/fi`.

---

## 🗄️ Setting Up Supabase (Optional for Live Data)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire contents of [`supabase/schema.sql`](file:///Users/zain/Documents/Projects/mattobayat/supabase/schema.sql).
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key
5. Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SITE_URL=https://matto-bayat.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. **Create the owner admin user**:
   - In Supabase dashboard under **Authentication → Users**, click **Add User** (e.g. `egbayat@gmail.com` with a secure password).
   - In **SQL Editor**, grant this user admin rights:
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'egbayat@gmail.com'
     on conflict do nothing;
     ```
7. Sign in at `http://localhost:3000/fi/admin`.

---

## 📍 Store Information

- **Name**: Matto Bayat / Bayat / فرش بیات
- **Address**: Putkitie 6, 00880 Helsinki (Vartiokylä, near Siilitie metro)
- **Phone**: `+358 44 971 5631`
- **Email**: `egbayat@gmail.com`
- **Business ID**: `2873455-9`
- **Opening Hours**:
  - Ma–Pe: 10:00–19:00
  - La: 10:00–19:00
  - Su: 11:00–18:00
