-- huellar · corrige el lint de performance en la policy de reviews
-- (auth.uid() se reevaluaba por fila en vez de una sola vez por query,
-- mismo problema que 0004_performance.sql ya había resuelto para el resto).
alter policy "El usuario reseña lugares donde hizo checkin"
  on public.reviews
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.checkins
      where checkins.user_id = (select auth.uid()) and checkins.place_id = reviews.place_id
    )
  );
