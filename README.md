# WorkNest — Smart Workspace Booking & Membership Management

A coworking space booking and operations platform built for Koramangala,
Indiranagar, and HSR locations in Bangalore. Built as a DPMG capstone
project by Group 3.

**Live site:** https://worknest-tau.vercel.app

## Tech Stack

| Layer | Choice |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth & Access | Supabase Auth + Row-Level Security (member / employee roles) |
| Frontend | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS, hand-built components |
| Hosting | Vercel (frontend) + Supabase (database), free tier |

## Architecture Decisions Worth Knowing

- **Numeric IDs, not UUIDs, for Member/Employee IDs.** Both appear as
  human-typed login credentials in the BRD's login screens, so short
  numbers were chosen over UUIDs for usability. The only UUID in the
  schema is `auth_user_id`, linking each row to its Supabase Auth account.
- **Members log in with Member ID + password.** Supabase Auth only
  understands email + password, so each member gets a hidden internal
  email (`member.{id}@worknest.internal`) generated behind the scenes.
  They never see or type it.
- **Double-booking prevention lives in the database**, via a Postgres
  `EXCLUDE USING gist` constraint on `(resource_id, time range)`, not
  application logic. This means it's enforced even under concurrent
  requests — verified with a live overlap test during Phase 1.
- **RLS has two visibility tiers**: members see only their own records;
  employees see across all locations for viewing (bookings, analytics —
  BRD's "cross-floor" requirement), but resource *management* (FR3) stays
  scoped to their own location specifically, per that FR's exact wording.

## Database Schema

10 tables: `locations`, `employees`, `membership_tiers`, `members`,
`resources`, `resource_pricing`, `bookings`, `cancellation_refunds`,
`help_queries`, `staff_shifts`. Full schema and every migration lives in
`supabase/migrations/`, applied in order.

## Feature Map (by Functional Requirement)

| FR | Feature | Where |
|---|---|---|
| FR1–2 | Employee login, auto-assigned location | `/login` (Employee tab) |
| FR3–5 | Manage resources, min. duration, pricing | `/admin/resources` |
| FR6–7 | Tier refund % / notice window | Seeded in `membership_tiers`; admin-editable UI not yet built |
| FR8–9 | Member login, plan-scoped resource types | `/login` (Member tab), `/portal/book` |
| FR10 | Double-booking prevention | Database constraint, see Phase 1 migration |
| FR11 | Booking history | `/portal/bookings` |
| FR12 | Cancellation with refund policy | `/portal/bookings`, `actions/cancellation.ts` |
| FR13 | Plan/hours/renewal view | `/portal` dashboard |
| FR14 | Help & Support | `/portal/help` |
| FR15 | Cross-floor live booking grid | `/admin` |
| FR16 | Revenue & occupancy analytics | `/admin/analytics` |
| FR17 | Free conference hours (Gold/Platinum) | Applied automatically in `actions/booking.ts` |
| FR18 | Shift & certification tracker, coverage flag | `/admin/staffing` |

## Local Setup

```bash
npm install
cp .env.local.example .env.local   # fill in your own Supabase project keys
npm run dev
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used for member signup (never exposed to the browser)

## Known Gaps (Honest, Not Hidden)

- FR6/FR7: tier refund %/notice window are correctly seeded and enforced,
  but not yet editable from an admin screen.
- Acquisition-channel/conversion tracking, mentioned in the original MSA,
  was never carried into the approved BRD/SDD schema, so it was
  intentionally not built, to avoid scope drift beyond the approved docs.
