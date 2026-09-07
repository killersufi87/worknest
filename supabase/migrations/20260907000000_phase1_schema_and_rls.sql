-- ============================================================
-- WorkNest — Phase 1: Database Schema
-- 10 core tables, constraints, double-booking exclusion rule
-- Source of truth: WorkNest_SDD_v1_1, section 7
-- ============================================================

create extension if not exists btree_gist;

-- ------------------------------------------------------------
-- 1. locations
-- ------------------------------------------------------------
create table locations (
  location_id bigint generated always as identity primary key,
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. employees  (admin/staff login, scoped to one location)
-- ------------------------------------------------------------
create table employees (
  employee_id bigint generated always as identity primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  role text not null default 'staff',
  email text unique,
  location_id bigint not null references locations(location_id),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. membership_tiers  (Regular, Silver, Gold, Platinum)
-- ------------------------------------------------------------
create table membership_tiers (
  tier_id bigint generated always as identity primary key,
  tier_name text not null unique
    check (tier_name in ('Regular','Silver','Gold','Platinum')),
  monthly_rate numeric(10,2) not null default 0,
  cancellation_refund_pct numeric(5,2) not null default 0
    check (cancellation_refund_pct between 0 and 100),
  notice_window_hours integer not null default 0,
  free_conference_hours_allowance numeric(6,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. members  (member_id doubles as the human-facing "Member ID" login)
-- ------------------------------------------------------------
create table members (
  member_id bigint generated always as identity primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  tier_id bigint not null references membership_tiers(tier_id),
  location_id bigint not null references locations(location_id),
  status text not null default 'active'
    check (status in ('active','suspended','cancelled')),
  remaining_monthly_hours numeric(6,2) not null default 0,
  plan_start_date date not null default current_date,
  plan_renewal_date date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. resources  (bookable desks/cabins)
-- ------------------------------------------------------------
create table resources (
  resource_id bigint generated always as identity primary key,
  location_id bigint not null references locations(location_id),
  resource_type text not null
    check (resource_type in ('hot_desk','dedicated_desk','cabin')),
  capacity_tier text,
  min_booking_duration_minutes integer not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. resource_pricing  (configurable, effective-dated)
-- ------------------------------------------------------------
create table resource_pricing (
  pricing_id bigint generated always as identity primary key,
  resource_id bigint not null references resources(resource_id),
  hourly_price numeric(10,2),
  monthly_price numeric(10,2),
  effective_from date not null default current_date,
  effective_to date,
  status text not null default 'active'
    check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. bookings  (core reservation table)
-- ------------------------------------------------------------
create table bookings (
  booking_id bigint generated always as identity primary key,
  member_id bigint not null references members(member_id),
  resource_id bigint not null references resources(resource_id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','completed')),
  amount numeric(10,2),
  created_at timestamptz not null default now(),

  constraint bookings_valid_time check (end_time > start_time),

  -- Double-booking prevention: no two CONFIRMED bookings on the same
  -- resource may have overlapping time ranges. Straight from SDD 7.3.
  constraint bookings_no_overlap exclude using gist (
    resource_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  ) where (status = 'confirmed')
);

create index idx_bookings_member on bookings(member_id);
create index idx_bookings_resource on bookings(resource_id);
create index idx_bookings_start_time on bookings(start_time);

-- ------------------------------------------------------------
-- 8. cancellation_refunds  (1:0..1 with bookings)
-- ------------------------------------------------------------
create table cancellation_refunds (
  refund_id bigint generated always as identity primary key,
  booking_id bigint not null unique references bookings(booking_id),
  tier_rule_id bigint references membership_tiers(tier_id),
  refund_pct_applied numeric(5,2),
  refund_amount numeric(10,2),
  cancelled_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. help_queries  (secondary/stub-eligible per SDD)
-- ------------------------------------------------------------
create table help_queries (
  query_id bigint generated always as identity primary key,
  member_id bigint not null references members(member_id),
  message_text text not null,
  status text not null default 'open'
    check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 10. staff_shifts  (secondary/stub-eligible per SDD, FR18)
-- ------------------------------------------------------------
create table staff_shifts (
  shift_id bigint generated always as identity primary key,
  employee_id bigint not null references employees(employee_id),
  location_id bigint not null references locations(location_id),
  shift_date date not null,
  certification text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row-Level Security
-- Two-tier model per SDD 3: Member = own records,
-- Admin (employee) = authorised location data.
-- ============================================================

alter table locations enable row level security;
alter table employees enable row level security;
alter table membership_tiers enable row level security;
alter table members enable row level security;
alter table resources enable row level security;
alter table resource_pricing enable row level security;
alter table bookings enable row level security;
alter table cancellation_refunds enable row level security;
alter table help_queries enable row level security;
alter table staff_shifts enable row level security;

-- locations: readable by any authenticated member/employee
create policy locations_read on locations for select
  to authenticated using (true);

-- employees: an employee can see their own row and colleagues at
-- the same location (needed for shift views); no cross-location visibility.
create policy employees_read_own_location on employees for select
  to authenticated using (
    location_id in (
      select e.location_id from employees e where e.auth_user_id = auth.uid()
    )
  );

-- membership_tiers: reference data, readable by everyone authenticated
create policy tiers_read on membership_tiers for select
  to authenticated using (true);

-- members: a member sees only their own row; an employee sees members
-- at their own location.
create policy members_read_own on members for select
  to authenticated using (
    auth_user_id = auth.uid()
    or location_id in (
      select e.location_id from employees e where e.auth_user_id = auth.uid()
    )
  );

create policy members_update_own on members for update
  to authenticated using (auth_user_id = auth.uid());

-- resources: readable by members (to book) and employees at that location
create policy resources_read on resources for select
  to authenticated using (true);

create policy resources_write_own_location on resources for all
  to authenticated using (
    location_id in (
      select e.location_id from employees e where e.auth_user_id = auth.uid()
    )
  );

-- resource_pricing: same visibility as resources
create policy pricing_read on resource_pricing for select
  to authenticated using (true);

create policy pricing_write_admin on resource_pricing for all
  to authenticated using (
    resource_id in (
      select r.resource_id from resources r
      join employees e on e.location_id = r.location_id
      where e.auth_user_id = auth.uid()
    )
  );

-- bookings: a member manages only their own bookings; an employee sees
-- bookings for resources at their own location (cross-location grid, FR15).
create policy bookings_read_own on bookings for select
  to authenticated using (
    member_id in (select m.member_id from members m where m.auth_user_id = auth.uid())
    or resource_id in (
      select r.resource_id from resources r
      join employees e on e.location_id = r.location_id
      where e.auth_user_id = auth.uid()
    )
  );

create policy bookings_insert_own on bookings for insert
  to authenticated with check (
    member_id in (select m.member_id from members m where m.auth_user_id = auth.uid())
  );

create policy bookings_update_own on bookings for update
  to authenticated using (
    member_id in (select m.member_id from members m where m.auth_user_id = auth.uid())
  );

-- cancellation_refunds: visible to the owning member and location admin
create policy refunds_read_own on cancellation_refunds for select
  to authenticated using (
    booking_id in (
      select b.booking_id from bookings b
      join members m on m.member_id = b.member_id
      where m.auth_user_id = auth.uid()
    )
    or booking_id in (
      select b.booking_id from bookings b
      join resources r on r.resource_id = b.resource_id
      join employees e on e.location_id = r.location_id
      where e.auth_user_id = auth.uid()
    )
  );

create policy refunds_insert_own on cancellation_refunds for insert
  to authenticated with check (
    booking_id in (
      select b.booking_id from bookings b
      join members m on m.member_id = b.member_id
      where m.auth_user_id = auth.uid()
    )
  );

-- help_queries: member sees their own; employee sees queries from
-- members at their own location
create policy help_queries_read_own on help_queries for select
  to authenticated using (
    member_id in (select m.member_id from members m where m.auth_user_id = auth.uid())
    or member_id in (
      select m.member_id from members m
      join employees e on e.location_id = m.location_id
      where e.auth_user_id = auth.uid()
    )
  );

create policy help_queries_insert_own on help_queries for insert
  to authenticated with check (
    member_id in (select m.member_id from members m where m.auth_user_id = auth.uid())
  );

-- staff_shifts: employee sees shifts at their own location only
create policy shifts_read_own_location on staff_shifts for select
  to authenticated using (
    location_id in (
      select e.location_id from employees e where e.auth_user_id = auth.uid()
    )
  );
