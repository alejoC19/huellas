-- Bucket público para las fotos de perfil (dueño/mascota).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatares públicos para lectura"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Cada usuario solo puede escribir dentro de su propia carpeta:
-- avatars/<user_id>/<archivo>.jpg
create policy "El usuario sube su propio avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "El usuario actualiza su propio avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
