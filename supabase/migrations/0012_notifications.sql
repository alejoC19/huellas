-- huellar · notificaciones reales (seguidores + likes)
-- La campanita de Inicio era decorativa — esto la conecta a eventos reales:
-- alguien te sigue, o le da like a un post tuyo. Se generan por trigger,
-- nunca directo desde el cliente (mismo patrón que points_events).

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('follow', 'like')),
  post_id uuid references public.posts (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "El usuario ve sus propias notificaciones"
  on public.notifications for select
  using ((select auth.uid()) = user_id);

create policy "El usuario marca como leídas sus propias notificaciones"
  on public.notifications for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
create index notifications_actor_id_idx on public.notifications (actor_id);
create index notifications_post_id_idx on public.notifications (post_id);

create function public.notify_on_follow()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.follower_id <> new.following_id then
    insert into public.notifications (user_id, actor_id, type)
    values (new.following_id, new.follower_id, 'follow');
  end if;
  return new;
end;
$$;

create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure public.notify_on_follow();

create function public.notify_on_like()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  post_author_id uuid;
begin
  select user_id into post_author_id from public.posts where id = new.post_id;
  if post_author_id is not null and post_author_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (post_author_id, new.user_id, 'like', new.post_id);
  end if;
  return new;
end;
$$;

create trigger on_post_like_created
  after insert on public.post_likes
  for each row execute procedure public.notify_on_like();
