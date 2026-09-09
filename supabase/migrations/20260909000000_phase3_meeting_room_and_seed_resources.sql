alter table resources drop constraint resources_resource_type_check;
alter table resources add constraint resources_resource_type_check
  check (resource_type in ('hot_desk','dedicated_desk','cabin','meeting_room'));

do $$
declare
  loc record;
  i int;
begin
  for loc in select location_id from locations order by location_id loop
    for i in 1..12 loop
      insert into resources (location_id, resource_type, capacity_tier, min_booking_duration_minutes)
      values (loc.location_id, 'hot_desk', '1-seat', 30);
    end loop;
    for i in 1..4 loop
      insert into resources (location_id, resource_type, capacity_tier, min_booking_duration_minutes)
      values (loc.location_id, 'dedicated_desk', '1-seat', 30);
    end loop;
    for i in 1..3 loop
      insert into resources (location_id, resource_type, capacity_tier, min_booking_duration_minutes)
      values (loc.location_id, 'cabin', '4-seat', 60);
    end loop;
    insert into resources (location_id, resource_type, capacity_tier, min_booking_duration_minutes)
    values (loc.location_id, 'meeting_room', '8-seat', 60);
  end loop;
end $$;

insert into resource_pricing (resource_id, hourly_price, monthly_price)
select resource_id,
  case resource_type
    when 'hot_desk' then 150
    when 'dedicated_desk' then 300
    when 'cabin' then 600
    when 'meeting_room' then 500
  end,
  case resource_type
    when 'hot_desk' then 4000
    when 'dedicated_desk' then 7500
    when 'cabin' then 22000
    else null
  end
from resources;
