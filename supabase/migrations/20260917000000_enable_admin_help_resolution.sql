-- Allow employees to resolve help queries from the admin portal.
create policy help_queries_update_employee on help_queries
  for update
  to authenticated
  using (
    member_id in (
      select m.member_id
      from members m
      join employees e on e.location_id = m.location_id
      where e.auth_user_id = auth.uid()
    )
  )
  with check (
    member_id in (
      select m.member_id
      from members m
      join employees e on e.location_id = m.location_id
      where e.auth_user_id = auth.uid()
    )
  );
