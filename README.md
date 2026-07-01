<div align="center">

# ✂️ Vero Salon

### Hair & Beauty Unisex Salon · Pasyala, Sri Lanka 🇱🇰

**A production salon website + booking platform** — polished marketing site, a five-step multi-service booking flow with a month calendar, race-proof availability, customer accounts (email/password + Google), and a role-based admin & staff dashboard.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br/>

⭐ **4.9 on Google** · 🕙 **Open daily 10 AM – 12 AM** · 💇 **Unisex — him & her** · 💰 **Prices in LKR**

</div>

---

## ✨ Features

| | Feature |
|---|---|
| 🎨 | **Warm Modern design system** — gold + warm-neutral palette, light/dark themes with no flash, Poppins |
| 🌀 | **Rich motion** — parallax hero, 3D coverflow lookbook, pinned step-through (all reduced-motion aware) |
| 📅 | **5-step booking** — service → stylist → date → time → details, with real server-side availability |
| ➕ | **Multi-service booking** — bundle several services into one visit; combined duration + price reserve a single continuous slot |
| 🗓️ | **Month calendar + SL holidays** — pick a date from a month grid; Sri Lankan public & poya holidays (synced from Google Calendar into a `holidays` table) are blocked as closed days |
| 🔒 | **Race-proof slots** — a Postgres `EXCLUDE` constraint makes double-booking impossible |
| 🔑 | **Accounts & auth** — split-screen **login** + **signup** (email/password with live password-strength rules, or Google OAuth), email-confirmation flow |
| 👤 | **Customer account** — sidebar dashboard: profile, avatar upload (DiceBear fallback), bookings history, member-since/last-sign-in, account deletion |
| ⭐ | **Ratings & reviews** — customers rate their own **completed** visits; the stylist's running average is recomputed app-side, and admins moderate reviews |
| 🧑‍🤝‍🧑 | **Roles** — `user` / `staff` / `admin`, enforced by Supabase RLS; admins manage roles & stylist links in **People** |
| 📧 | **Email confirmations** — via Resend, with a pluggable SMS stub for later |
| ✍️ | **Editable site content** — homepage copy lives in a `site_content` table and is editable from the admin **Content** page (no redeploy needed) |
| 🛠️ | **Admin dashboard** — sidebar shell with live bookings (Realtime), status controls, searchable/filterable lists, and full CRUD for **Services**, **Stylists**, **Gallery**, **Content**, **Reviews**, **People**, **Schedule**, **Blocked slots** & **Holidays** (sync from Google or add manual closures) |
| 🧑‍🔧 | **Staff dashboard** — staff see only their own RLS-scoped **My schedule** and today's bookings, with the same search/filter toolbar |
| 🔏 | **Privacy-aware deletion** — account deletion anonymizes past bookings (strips PII, keeps business records) via a `security definer` DB function |
| ✅ | **Tested** — Vitest unit + integration (availability, schemas, roles, reviews, …) and a Playwright end-to-end booking flow |

---

## 🧰 Tech Stack

- ⚡ **Next.js 16** — App Router, React 19, Server Actions
- 🟦 **TypeScript** (strict mode)
- 🎨 **Tailwind CSS v4** — custom Warm Modern (gold) tokens, light/dark, no-flash
- 🌀 **Framer Motion + Lenis** — parallax, coverflow, pinned scroll
- 📝 **React Hook Form + Zod** — typed, validated booking form
- 🗄️ **Supabase** — Postgres · Auth · RLS · Realtime, via `@supabase/ssr`
- 📨 **Resend** — transactional email (SMS behind a stubbed interface)
- 🧪 **Vitest** + **Playwright** — unit, integration & e2e
- ▲ **Vercel** — deployment

---

## 🚀 Quick start

### 📋 Prerequisites

- 🟢 Node.js 20+
- 🗄️ A Supabase project (Postgres + Auth)
- 📨 *(optional)* A Resend account for email confirmations

### 🔑 Environment variables

Copy `.env.example` → `.env` (or `.env.local`) and fill in:

| Variable | Where to find it | Required |
|---|---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL (`https://<ref>.supabase.co`) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` public key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key 🔐 | ✅ |
| `SUPABASE_DB_PASSWORD` | Supabase → Settings → Database → password | migrations/types |
| `RESEND_API_KEY` | Resend dashboard | optional |
| `RESEND_FROM_EMAIL` | A verified Resend sender, e.g. `Vero Salon <bookings@yourdomain>` | optional |
| `GOOGLE_CALENDAR_API_KEY` | Google Cloud → enable **Google Calendar API** → API key (restriction **None** — used server-side) | optional |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev; your domain in prod | ✅ |

> ⚠️ `.env` / `.env.local` are gitignored — **never commit real keys.** The `service_role` key bypasses RLS and stays server-only (read only in `lib/supabase/admin.ts`, never shipped to the browser).

### 📦 Install

```bash
npm install
```

### 🗄️ Database (schema + seed)

Apply the migrations with the Supabase CLI using a direct DB connection string (no `supabase login` needed):

```bash
# 0001_init.sql           — core tables, RLS, the double-booking EXCLUDE constraint
# 0002_realtime.sql       — adds `bookings` to the realtime publication
# 0003_auth_roles.sql     — `profiles` table (role + stylist link) and role RLS
# 0004_data_retention.sql — anonymize_user_bookings() for privacy-safe deletion
# 0005_site_content.sql   — `site_content` key/value table for editable copy
# 0006_service_image.sql  — per-service `image_url` for photo-led service cards
# 0007_reviews_ratings.sql— `stylist_reviews` table + `stylists.rating`/`rating_count`
# 0008_booking_multi_service.sql — `bookings.service_ids[]` for multi-service visits
# 0009_holidays.sql        — `holidays` table (SL public/poya days + manual closures)
npx supabase db push --db-url "postgresql://postgres:<DB_PASSWORD>@db.<ref>.supabase.co:5432/postgres"
```

Then seed the real Vero data (12 services · 4 stylists · business hours · gallery). `supabase/seed.sql` is the source of truth — run it via the Supabase SQL editor or any Postgres client.

### 📦 Storage buckets (required)

Image uploads need two **public** Storage buckets that the migrations don't create. In the Supabase SQL editor:

```sql
insert into storage.buckets (id, name, public) values
  ('media',   'media',   true),   -- admin gallery / service / stylist images
  ('avatars', 'avatars', true)    -- customer profile photos
on conflict (id) do update set public = true;
```

Uploads run server-side with the service-role key, so no extra Storage RLS is needed.

### 🗓️ Sri Lankan holidays (optional)

The booking calendar can block SL public & poya holidays. It reads them from the `holidays` table (migration `0009`) — never from Google at request time — so heavy traffic never hits an API limit.

1. In **Google Cloud Console**, enable **Google Calendar API** and create an **API key**. Set its application restriction to **None** (the key is used server-side, so a "Websites"/referer restriction would block it). Put it in `.env` as `GOOGLE_CALENDAR_API_KEY`.
2. In the app, go to **Admin → Holidays → Sync** and pick a year — this pulls that year's holidays from Google's public SL calendar into the DB. You can also **add manual closures** by hand (e.g. staff-training days).

If the key is unset, the calendar still works — no dates get blocked as holidays.

### 👑 First admin (bootstrap)

The `profiles_protect_privileges` trigger (migration `0003`) blocks role changes unless the caller is already an admin — so a plain `UPDATE` from the SQL editor silently leaves `role = 'user'`. To create the very first admin, disable the trigger for that one statement:

```sql
alter table profiles disable trigger profiles_protect_privileges;
update profiles set role = 'admin' where id = '<your-auth-user-id>';
alter table profiles enable trigger profiles_protect_privileges;
```

Then log out and back in (the role is read into the session at login). After this, manage all other roles from **Admin → People**.

### 🧬 Generated types

DB types live in `lib/supabase/types.ts` (hand-authored to match the migration). Regenerate from the live schema (needs Docker **or** an access token):

```bash
# with a local Docker daemon:
npx supabase gen types typescript --db-url "<connection-string>" > lib/supabase/types.ts

# or with an access token + project ref:
SUPABASE_ACCESS_TOKEN=... npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
```

### 🔑 Auth configuration (Supabase)

Auth is handled by Supabase (`@supabase/ssr`). Sign-in and registration live at **`/login`** and **`/signup`** (email/password or Google). `/admin/login` simply redirects to `/login?next=/admin`.

In **Supabase → Authentication → URL Configuration**, set:

- **Site URL** → your environment's base URL (e.g. `http://localhost:3000` in dev, your domain in prod).
- **Redirect URLs** → add **both** `http://localhost:3000/auth/callback` **and** `https://<your-domain>/auth/callback` (the OAuth + email-confirmation callback).

In **Authentication → Providers**:

- **Email** → this project runs with **"Confirm email" OFF**, so signup creates a live session immediately (no confirmation email needed — the app uses email + password, not OTP). Turn it **ON** only if you wire a real email sender (Resend SMTP) and want the "check your email" confirmation flow.
- **Google** → optional. Leave disabled unless you create real OAuth credentials in Google Cloud Console (the **Client IDs** field needs a real `...apps.googleusercontent.com` ID + secret, not a project name) and add the Supabase callback URL as an authorized redirect URI.

> 🔁 The code derives every redirect from `NEXT_PUBLIC_SITE_URL`, so that env var **must** match your deployed domain or OAuth/confirmation links will point at the wrong host.

### 👤 Roles (user / staff / admin)

New sign-ups are `user` by default. To grant the **first admin**, follow the [First admin (bootstrap)](#-first-admin-bootstrap) steps above (a plain `UPDATE` is silently blocked by the privilege trigger). After that, manage everyone else from the in-app **Admin → People** page (set role + linked stylist). Roles are enforced by RLS and by `requireRole(...)` route guards. `admin`/`staff` land on `/admin`; `user` lands on `/`.

---

## 🧪 Commands

```bash
npm run dev        # 🔥 dev server (http://localhost:3000)
npm run build      # 📦 production build
npm run start      # ▶️  serve the production build
npm run typecheck  # 🟦 tsc --noEmit
npm run lint       # ✨ eslint .
npm test           # 🧪 Vitest unit + integration (incl. live double-booking test)
npm run e2e        # 🎭 Playwright e2e (run `npm run build` first)
```

> 🧠 `npm test` includes `tests/double-booking.test.ts`, which hits the real database via the service-role key to assert the overlap constraint — it needs a populated `.env`. The e2e creates and cleans up a real booking row, so it needs DB access and a prior `npm run build`.

---

## ⚙️ How it works

- 🧮 **Availability** (`lib/availability.ts`) — a pure, unit-tested function: given business hours, a service duration, and busy intervals (confirmed bookings + blocked slots), it returns open start times. The `getAvailability` server action feeds it real data; for a multi-service booking it uses the **summed** duration, and "any stylist" unions every stylist's openings.
- 🗓️ **Calendar & holidays** (`lib/lk-holidays.ts`, `components/booking/step-date.tsx`) — the Date step is a month calendar; the Time step lists that day's slots. Sri Lankan holidays live in a `holidays` DB table and are **blocked** as closed days. The public calendar reads holidays **only from the DB** (never Google at request time, so no rate limits); an admin **syncs** them once per year from Google's public SL holiday calendar via **Admin → Holidays**. Degrades gracefully to no blocking when `GOOGLE_CALENDAR_API_KEY` / the table are absent.
- 🔒 **Double-booking protection** — enforced in Postgres by a GiST `EXCLUDE` constraint, so two confirmed bookings for the same stylist can't overlap. `createBooking` catches the violation (`23P01`) and returns a graceful "slot just taken." Price & duration are always re-derived from the DB — never trusted from the client.
- 📨 **Notifications** (`lib/notify/`) — go through a `Notifier` interface. Resend sends the email; an SMS stub logs a placeholder. Email no-ops safely when `RESEND_API_KEY` is unset, so bookings still succeed without it.
- 🔑 **Auth & accounts** — `/login` and `/signup` (split-screen) use Supabase email/password or Google OAuth; both flow through `/auth/callback`. Signup enforces password rules (`lib/auth/password.ts`) on the client *and* server. `safeNext` sanitizes every post-login redirect; `roleDefaultPath` sends each role to its home. `/account` is a sidebar dashboard (profile, avatar upload, bookings, account deletion). Avatars resolve via `lib/avatar.ts` — an uploaded photo wins, otherwise a deterministic DiceBear fallback seeded by email/name.
- ⭐ **Ratings & reviews** (`lib/reviews.ts`, `account/review-actions.ts`) — a customer may review only their **own completed** booking; ownership and state are re-verified server-side. The stylist's running average is recomputed app-side (`computeUpdatedRating` / `computeRemovedRating`) on insert/delete (no DB trigger), and the pure helpers are unit-tested. The `stylist_reviews` table and `stylists.rating`/`rating_count` columns are created by migration `0007`.
- ✍️ **Editable content** (`lib/content/`) — homepage copy is stored per-block in the `site_content` table; `blocks.ts` defines each block's shape, `get.ts` fetches, and `merge.ts` overlays saved values onto defaults so the site renders even before anything is edited. Admins edit it from **Admin → Content**.
- 🔏 **Privacy & deletion** — deleting an account calls the `anonymize_user_bookings()` `security definer` function (migration `0004`), which strips PII from past bookings while keeping the rows for business records.
- 🛠️ **Admin & staff** (`/admin`) — guarded by `requireRole`; a sidebar shell with role-scoped nav. Admins see all bookings (live via Supabase Realtime) with status controls and a searchable/filterable table, plus full management of **Services**, **Stylists**, **Gallery**, **Content**, **Reviews**, **People** (role + stylist links), **Schedule** and **Blocked slots**. Staff see only **My schedule** — their own RLS-scoped bookings — with the same search/filter toolbar.

---

## 📂 Project structure

```
app/                   # 🧭 routes: public page, /book actions
  login/ · signup/     # 🔑 split-screen auth (email/password + Google)
  account/             # 👤 customer dashboard (profile, avatar, bookings, reviews, delete)
  admin/(protected)/   # 🛠️ role-guarded shell: dashboard, services, stylists, gallery,
                       #     content, reviews, people, schedule, blocked-slots, holidays
  staff/               # 🧑‍🔧 staff "my schedule" + today view
  auth/callback/       # 🔁 OAuth + email-confirmation handler
components/site/        # 🎨 marketing sections (hero, lookbook, services, …)
components/booking/     # 📅 5-step wizard (service · stylist · date · time · details)
components/admin/       # 🛠️ bookings table, list-toolbar (search/filter), block/image forms
components/reviews/     # ⭐ star row + review list
components/ui/          # 🧩 shared primitives (size-constrained Icon, …)
lib/                    # 🧰 availability, time, validators, queries, notify, supabase clients
lib/auth/              # 🔐 password rules, redirect-safety (safeNext), roles
lib/content/           # ✍️ editable site-content blocks (get / merge / shapes)
lib/reviews.ts          # ⭐ pure rating-average helpers (unit-tested)
supabase/migrations/    # 🗄️ schema + RLS + realtime + roles + retention + content + service-image + reviews + multi-service + holidays (0001–0009)
supabase/seed.sql       # 🌱 real Vero data
tests/                  # 🧪 vitest unit/integration; tests/e2e Playwright
```

---

## ▲ Deploy (Vercel)

1. Import the repo into Vercel.
2. Add the same environment variables (Project → Settings → Environment Variables). Mark `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` as **secret**; set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://saloon-vero.vercel.app`).
3. In **Supabase → Authentication → URL Configuration**, add `https://<your-domain>/auth/callback` to **Redirect URLs** (and set the **Site URL**), or Google sign-in and email-confirmation links will fail in production.
4. Deploy 🚀 — public pages are server-rendered and booking/auth run via Server Actions; no extra build config needed. Production deploys from the `main` branch.

---

## 📍 Visit us

<div align="center">

**Vero Salon — Hair & Beauty Unisex**

📌 Attanagalla Road, Pasyala *(plus code 545H+F6)*
🕙 Open daily 10:00 AM – 12:00 AM
📞 077 369 9620 · 071 094 4410 · 075 095 3004
⭐ 4.9 on Google

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/SaloonRV/)

</div>
