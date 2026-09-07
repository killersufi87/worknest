-- Signup happens before a person has an account, so the signup form
-- needs to read locations and membership_tiers while still anonymous.
-- These two tables are non-sensitive reference/lookup data (not member
-- records), so extending read access to anon is safe.

drop policy locations_read on locations;
create policy locations_read on locations for select
  to anon, authenticated using (true);

drop policy tiers_read on membership_tiers;
create policy tiers_read on membership_tiers for select
  to anon, authenticated using (true);
