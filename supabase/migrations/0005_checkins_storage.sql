-- Bucket público para las fotos de check-in (se muestran en el feed
-- de Comunidad y en Últimas huellas del lugar).
insert into storage.buckets (id, name, public)
values ('checkins', 'checkins', true)
on conflict (id) do nothing;

create policy "Fotos de checkin públicas para lectura"
  on storage.objects for select
  using (bucket_id = 'checkins');

-- Cada usuario solo puede subir dentro de su propia carpeta:
-- checkins/<user_id>/<archivo>.jpg
create policy "El usuario sube fotos a su propia carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'checkins'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
