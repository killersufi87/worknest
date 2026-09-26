alter table employees
  add column if not exists is_active boolean not null default true,
  add column if not exists certification_status text not null default 'not_certified';

alter table employees
  drop constraint if exists employees_certification_status_check;

alter table employees
  add constraint employees_certification_status_check
  check (certification_status in ('not_certified', 'training', 'certified'));

update employees e
set certification_status = 'certified'
where exists (
  select 1
  from staff_shifts s
  where s.employee_id = e.employee_id
    and s.certification is not null
);

alter table membership_tiers
  drop constraint if exists membership_tiers_tier_name_check;

alter table membership_tiers
  add column if not exists is_active boolean not null default true;
