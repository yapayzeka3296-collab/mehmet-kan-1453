-- V1: public memories may expose only their own media to public viewers.
-- Private memories remain owner-only. No email/profile data is exposed here.
drop policy if exists "Parcel memory files can be read by owner or public memory viewers" on storage.objects;
create policy "Parcel memory files can be read by owner or public memory viewers"
on storage.objects
for select
to public
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