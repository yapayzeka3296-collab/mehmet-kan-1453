-- V1 memory media: private bucket with owner access and public-memory access.
drop policy if exists "Parcel memory files can be read by owner or public memory viewers" on storage.objects;
create policy "Parcel memory files can be read by owner or public memory viewers"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'parcel-memories'
  and (
    owner_id = (select auth.uid())::text
    or exists (
      select 1 from public.parcel_memories pm
      where pm.parcel_id::text = (storage.foldername(name))[2]
        and pm.is_public = true
        and (pm.photo_path = name or pm.music_path = name)
    )
  )
);

drop policy if exists "Parcel owners can upload their memory music" on storage.objects;
create policy "Parcel owners can upload their memory music"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'parcel-memories'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.parcels p where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid()))
  and storage.extension(name) = any (array['mp3','m4a','aac','wav','ogg','webm'])
);

drop policy if exists "Parcel owners can update their memory music" on storage.objects;
create policy "Parcel owners can update their memory music"
on storage.objects for update to authenticated
using (bucket_id = 'parcel-memories' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'parcel-memories' and owner_id = (select auth.uid())::text);

drop policy if exists "Parcel owners can delete their memory music" on storage.objects;
create policy "Parcel owners can delete their memory music"
on storage.objects for delete to authenticated
using (bucket_id = 'parcel-memories' and owner_id = (select auth.uid())::text);
