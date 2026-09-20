-- huellar · esquema inicial
-- Pegar en Supabase Dashboard > SQL Editor > New query, o aplicar con
-- `supabase db push` desde la CLI una vez linkeado el proyecto.

create extension if not exists "pgcrypto";

-- =========================================================
-- PROFILES (dueño + mascota). 1 fila por usuario autenticado.
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  owner_name text not null default '',
  pet_name text not null default '',
  pet_breed text not null default '',
  pet_age int,
  neighborhood text not null default '',
  avatar_url text,
  points int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles son públicos para lectura"
  on public.profiles for select
  using (true);

create policy "El usuario actualiza su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea el profile automáticamente cuando alguien se registra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, owner_name, pet_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'owner_name', ''),
    coalesce(new.raw_user_meta_data ->> 'pet_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- PLACES (plazas, cafés, veterinarias). Contenido curado.
-- =========================================================
create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('plaza', 'cafe', 'veterinaria')),
  neighborhood text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

create policy "Places son públicos para lectura"
  on public.places for select
  using (true);

-- =========================================================
-- POINTS_EVENTS: ledger de auditoría de puntos.
-- Nunca se inserta directo desde el cliente con un valor arbitrario:
-- siempre lo generan los triggers de checkins / qr_redemptions /
-- benefit_redemptions de abajo.
-- =========================================================
create table public.points_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid references public.places (id) on delete set null,
  reason text not null check (reason in ('checkin', 'review', 'qr', 'redeem')),
  points int not null,
  created_at timestamptz not null default now()
);

alter table public.points_events enable row level security;

create policy "El usuario ve su propio historial de puntos"
  on public.points_events for select
  using (auth.uid() = user_id);

-- Mantiene profiles.points sincronizado con la suma del ledger.
create function public.apply_points_event()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set points = points + new.points
  where id = new.user_id;
  return new;
end;
$$;

create trigger on_points_event_created
  after insert on public.points_events
  for each row execute procedure public.apply_points_event();

-- =========================================================
-- CHECKINS: dejar una huella con foto en un lugar. +50 pts fijos,
-- calculados server-side (el cliente no puede mandar otro valor).
-- =========================================================
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

alter table public.checkins enable row level security;

create policy "Checkins son públicos para lectura"
  on public.checkins for select
  using (true);

create policy "El usuario crea sus propios checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create function public.award_checkin_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.points_events (user_id, place_id, reason, points)
  values (new.user_id, new.place_id, 'checkin', 50);
  return new;
end;
$$;

create trigger on_checkin_created
  after insert on public.checkins
  for each row execute procedure public.award_checkin_points();

-- =========================================================
-- QR_CODES + QR_REDEMPTIONS: huella QR escondida. +75 pts,
-- una sola vez por usuario y por código (constraint unique).
-- =========================================================
create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  place_id uuid references public.places (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.qr_codes enable row level security;

create policy "QR codes son públicos para lectura"
  on public.qr_codes for select
  using (true);

create table public.qr_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  qr_code_id uuid not null references public.qr_codes (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, qr_code_id)
);

alter table public.qr_redemptions enable row level security;

create policy "El usuario ve sus propios canjes de QR"
  on public.qr_redemptions for select
  using (auth.uid() = user_id);

create policy "El usuario canjea un QR para sí mismo"
  on public.qr_redemptions for insert
  with check (auth.uid() = user_id);

create function public.award_qr_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_place_id uuid;
begin
  select place_id into target_place_id from public.qr_codes where id = new.qr_code_id;

  insert into public.points_events (user_id, place_id, reason, points)
  values (new.user_id, target_place_id, 'qr', 75);
  return new;
end;
$$;

create trigger on_qr_redeemed
  after insert on public.qr_redemptions
  for each row execute procedure public.award_qr_points();

-- =========================================================
-- POSTS + POST_LIKES: feed de Comunidad.
-- =========================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid references public.places (id) on delete set null,
  checkin_id uuid references public.checkins (id) on delete set null,
  image_url text,
  text text not null default '',
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts son públicos para lectura"
  on public.posts for select
  using (true);

create policy "El usuario crea sus propios posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Likes son públicos para lectura"
  on public.post_likes for select
  using (true);

create policy "El usuario da/saca like por sí mismo"
  on public.post_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create function public.apply_like_delta()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger on_post_like_changed
  after insert or delete on public.post_likes
  for each row execute procedure public.apply_like_delta();

-- =========================================================
-- BENEFITS + REDEMPTIONS: canje de puntos por beneficios.
-- El descuento de puntos pasa por una función (RPC) que valida
-- el saldo dentro de una transacción, no un insert directo.
-- =========================================================
create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  place_name text not null,
  neighborhood text not null,
  points_cost int not null,
  created_at timestamptz not null default now()
);

alter table public.benefits enable row level security;

create policy "Benefits son públicos para lectura"
  on public.benefits for select
  using (true);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  benefit_id uuid not null references public.benefits (id) on delete cascade,
  points_spent int not null,
  created_at timestamptz not null default now()
);

alter table public.redemptions enable row level security;

create policy "El usuario ve sus propios canjes"
  on public.redemptions for select
  using (auth.uid() = user_id);

create function public.redeem_benefit(benefit_id_input uuid)
returns public.redemptions
language plpgsql
security definer set search_path = public
as $$
declare
  cost int;
  balance int;
  new_redemption public.redemptions;
begin
  select points_cost into cost from public.benefits where id = benefit_id_input;
  if cost is null then
    raise exception 'Beneficio inexistente';
  end if;

  select points into balance from public.profiles where id = auth.uid();
  if balance < cost then
    raise exception 'Puntos insuficientes';
  end if;

  insert into public.redemptions (user_id, benefit_id, points_spent)
  values (auth.uid(), benefit_id_input, cost)
  returning * into new_redemption;

  insert into public.points_events (user_id, reason, points)
  values (auth.uid(), 'redeem', -cost);

  return new_redemption;
end;
$$;
