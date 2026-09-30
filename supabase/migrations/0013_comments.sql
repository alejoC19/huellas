-- huellar · comentarios reales en posts
-- posts.comments_count existía desde 0001_init.sql pero nunca se pudo
-- comentar nada — el ícono de comentario en PostCard era decorativo (mismo
-- tipo de gap que "reseña verificada" tenía antes de 0011_reviews.sql).

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Comments son públicos para lectura"
  on public.comments for select
  using (true);

create policy "El usuario comenta con su propio user_id"
  on public.comments for insert
  with check ((select auth.uid()) = user_id);

create policy "El usuario borra sus propios comentarios"
  on public.comments for delete
  using ((select auth.uid()) = user_id);

create index comments_post_id_created_at_idx on public.comments (post_id, created_at);
create index comments_user_id_idx on public.comments (user_id);

-- Mantiene posts.comments_count sincronizado, mismo patrón que
-- apply_like_delta() para post_likes.
create function public.apply_comment_delta()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger on_comment_changed
  after insert or delete on public.comments
  for each row execute procedure public.apply_comment_delta();

-- Extiende las notificaciones (0012_notifications.sql) con el tipo 'comment'.
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in ('follow', 'like', 'comment'));

create function public.notify_on_comment()
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
    values (post_author_id, new.user_id, 'comment', new.post_id);
  end if;
  return new;
end;
$$;

create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();
