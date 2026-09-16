-- FR18: admins need to create and maintain shifts from the staffing screen.
create policy shifts_insert_admin on staff_shifts for insert
  to authenticated with check (
    exists (
      select 1
      from employees e
      where e.auth_user_id = auth.uid()
        and e.role = 'admin'
    )
  );
