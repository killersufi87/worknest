do $$
declare
  loc record;
  emp_id bigint;
  d int;
begin
  for loc in select location_id, name from locations order by location_id loop
    for i in 1..2 loop
      insert into employees (name, role, location_id)
      values (
        (case when i = 1 then 'Front Desk — ' else 'Front Desk B — ' end) || loc.name,
        'front_desk', loc.location_id
      )
      returning employee_id into emp_id;

      for d in 0..13 loop
        insert into staff_shifts (employee_id, location_id, shift_date, certification)
        values (
          emp_id, loc.location_id, current_date + d,
          case when (d + i) % 2 = 0 then 'Morning (8AM-8PM)' else 'Evening (8PM-8AM)' end
        );
      end loop;
    end loop;

    insert into employees (name, role, location_id)
    values ('Floor Manager — ' || loc.name, 'manager', loc.location_id)
    returning employee_id into emp_id;

    for d in 0..13 loop
      if extract(dow from current_date + d) not in (0) then
        insert into staff_shifts (employee_id, location_id, shift_date, certification)
        values (emp_id, loc.location_id, current_date + d, 'Day (9AM-6PM)');
      end if;
    end loop;
  end loop;
end $$;
