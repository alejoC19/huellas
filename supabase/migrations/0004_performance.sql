-- huellar · performance: índices en foreign keys + RLS optimizada
-- (fixes sugeridos por Supabase Performance Advisor)

create index if not exists checkins_place_id_idx on public.checkins (place_id);
create index if not exists checkins_user_id_idx on public.checkins (user_id);
create index if not exists points_events_place_id_idx on public.points_events (place_id);
create index if not exists points_events_user_id_idx on public.points_events (user_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);
create index if not exists posts_checkin_id_idx on public.posts (checkin_id);
create index if not exists posts_place_id_idx on public.posts (place_id);
create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists qr_codes_place_id_idx on public.qr_codes (place_id);
create index if not exists qr_redemptions_qr_code_id_idx on public.qr_redemptions (qr_code_id);
create index if not exists redemptions_benefit_id_idx on public.redemptions (benefit_id);
create index if not exists redemptions_user_id_idx on public.redemptions (user_id);

-- auth.uid() envuelto en (select ...): el planner lo evalúa una sola
-- vez por query en vez de una vez por fila evaluada.
alter policy "El usuario actualiza su propio perfil"
  on public.profiles
  using ((select auth.uid()) = id);

alter policy "El usuario ve su propio historial de puntos"
  on public.points_events
  using ((select auth.uid()) = user_id);

alter policy "El usuario crea sus propios checkins"
  on public.checkins
  with check ((select auth.uid()) = user_id);

alter policy "El usuario ve sus propios canjes de QR"
  on public.qr_redemptions
  using ((select auth.uid()) = user_id);

alter policy "El usuario canjea un QR para sí mismo"
  on public.qr_redemptions
  with check ((select auth.uid()) = user_id);

alter policy "El usuario crea sus propios posts"
  on public.posts
  with check ((select auth.uid()) = user_id);

alter policy "El usuario ve sus propios canjes"
  on public.redemptions
  using ((select auth.uid()) = user_id);

-- post_likes tenía una policy "for all" que se solapaba con la de
-- lectura pública en SELECT (dos policies permisivas evaluándose en el
-- mismo query). Se separa en insert/delete; el select queda solo a
-- cargo de "Likes son públicos para lectura".
drop policy "El usuario da/saca like por sí mismo" on public.post_likes;

create policy "El usuario da like por sí mismo"
  on public.post_likes for insert
  with check ((select auth.uid()) = user_id);

create policy "El usuario saca su propio like"
  on public.post_likes for delete
  using ((select auth.uid()) = user_id);
