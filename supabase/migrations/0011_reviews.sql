-- huellar · reseñas verificadas (+30 pts)
-- El enum de points_events.reason ya reservaba 'review' desde 0001_init.sql,
-- pero nunca se construyó la tabla ni la pantalla — el tile de Beneficios
-- prometía puntos que no se podían ganar. "Verificada" = solo podés reseñar
-- un lugar donde ya hiciste check-in (confirmado con GPS + foto), una vez
-- por lugar.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

alter table public.reviews enable row level security;

create policy "Reviews son públicas para lectura"
  on public.reviews for select
  using (true);

create policy "El usuario reseña lugares donde hizo checkin"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.checkins
      where checkins.user_id = auth.uid() and checkins.place_id = reviews.place_id
    )
  );

create index reviews_place_id_idx on public.reviews (place_id);
create index reviews_user_id_idx on public.reviews (user_id);

create function public.award_review_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.points_events (user_id, place_id, reason, points)
  values (new.user_id, new.place_id, 'review', 30);
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.award_review_points();
