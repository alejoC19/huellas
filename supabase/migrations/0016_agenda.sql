-- huellar · agenda personal (turnos, vacunas, recordatorios)
-- La pestaña "Agenda" de Perfil mostraba un estado "en construcción"
-- honesto desde el principio — ahora es real. Totalmente privada: cada
-- usuario solo ve/toca la suya, no forma parte del feed social.

create table public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  notes text not null default '',
  due_date date not null,
  place_id uuid references public.places (id) on delete set null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.agenda_items enable row level security;

create policy "El usuario ve su propia agenda"
  on public.agenda_items for select
  using ((select auth.uid()) = user_id);

create policy "El usuario crea items en su propia agenda"
  on public.agenda_items for insert
  with check ((select auth.uid()) = user_id);

create policy "El usuario edita su propia agenda"
  on public.agenda_items for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "El usuario borra de su propia agenda"
  on public.agenda_items for delete
  using ((select auth.uid()) = user_id);

create index agenda_items_user_id_due_date_idx on public.agenda_items (user_id, due_date);
create index agenda_items_place_id_idx on public.agenda_items (place_id);
