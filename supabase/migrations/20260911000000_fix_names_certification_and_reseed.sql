update employees set name = 'Priya Nair' where employee_id = 2;
update employees set name = 'Arjun Mehta' where employee_id = 3;
update employees set name = 'Kavya Reddy' where employee_id = 4;
update employees set name = 'Rahul Iyer' where employee_id = 5;
update employees set name = 'Sneha Kulkarni' where employee_id = 6;
update employees set name = 'Vikram Rao' where employee_id = 7;
update employees set name = 'Ananya Pillai' where employee_id = 8;
update employees set name = 'Karthik Menon' where employee_id = 9;
update employees set name = 'Divya Shetty' where employee_id = 10;

delete from staff_shifts;

do $$
declare
  emp record;
  d int;
begin
  for emp in select employee_id, location_id from employees where role != 'admin' loop
    for d in 0..9 loop
      insert into staff_shifts (employee_id, location_id, shift_date, certification)
      values (
        emp.employee_id, emp.location_id, current_date + d,
        case when random() < 0.6 then 'Process Certified' else null end
      );
    end loop;
  end loop;
end $$;
