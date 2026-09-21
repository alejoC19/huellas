-- Lugares favoritos del usuario (corazón en el detalle de lugar).
create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.favorites enable row level security;

create policy "El usuario ve sus propios favoritos"
  on public.favorites for select
  using ((select auth.uid()) = user_id);

create policy "El usuario agrega sus propios favoritos"
  on public.favorites for insert
  with check ((select auth.uid()) = user_id);

create policy "El usuario saca sus propios favoritos"
  on public.favorites for delete
  using ((select auth.uid()) = user_id);

create index favorites_place_id_idx on public.favorites (place_id);
