-- Rating opcional (1-5) al dejar una huella, para tener estrellas
-- reales en el mapa en vez de un número inventado.
alter table public.checkins
  add column rating smallint check (rating between 1 and 5);

-- Vista agregada: huellas y promedio de estrellas reales por lugar.
create view public.place_stats
with (security_invoker = true) as
select
  p.id as place_id,
  count(c.id) as checkin_count,
  avg(c.rating) filter (where c.rating is not null) as avg_rating
from public.places p
left join public.checkins c on c.place_id = p.id
group by p.id;

grant select on public.place_stats to anon, authenticated;
