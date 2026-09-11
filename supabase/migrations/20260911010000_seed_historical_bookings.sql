do $$
declare
  mem_ids bigint[] := array(select member_id from members);
  res record;
  i int;
  rand_month int;
  rand_day int;
  rand_hour int;
  booking_date timestamptz;
  duration_hrs int;
  hourly numeric;
begin
  if array_length(mem_ids, 1) is null then
    return;
  end if;

  for res in
    select r.resource_id, r.resource_type, r.location_id, p.hourly_price
    from resources r
    join resource_pricing p on p.resource_id = r.resource_id
  loop
    for i in 1..(3 + floor(random() * 4)::int) loop
      rand_month := 1 + floor(random() * 5)::int;
      rand_day := 1 + floor(random() * 27)::int;
      rand_hour := 9 + floor(random() * 8)::int;
      duration_hrs := 1 + floor(random() * 3)::int;
      booking_date := (current_date - (rand_month * 30) - (30 - rand_day))::timestamptz + (rand_hour || ' hours')::interval;
      hourly := coalesce(res.hourly_price, 200);

      insert into bookings (member_id, resource_id, start_time, end_time, status, amount, created_at)
      values (
        mem_ids[1 + floor(random() * array_length(mem_ids, 1))::int],
        res.resource_id,
        booking_date,
        booking_date + (duration_hrs || ' hours')::interval,
        'completed',
        hourly * duration_hrs,
        booking_date
      );
    end loop;
  end loop;
end $$;
