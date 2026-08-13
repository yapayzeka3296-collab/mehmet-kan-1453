-- MySkyParcel: owner-only parcel notes and image attachments.
-- Notes/images belong to a specific owner + parcel so old ownership data is not overwritten
-- when a parcel is transferred to a new owner.

create table if not exists public.parcel_customizations (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  note text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parcel_customizations_note_length check (note is null or char_length(note) <= 280),
  constraint parcel_customizations_owner_parcel_unique unique (parcel_id, owner_id)
);

create index if not exists parcel_customizations_parcel_idx
  on public.parcel_customizations(parcel_id);

alter table public.parcel_customizations enable row level security;

-- A user can only see/edit their own customization for a parcel they currently own.
create policy "parcel customization owner select"
  on public.parcel_customizations
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.parcels p
      where p.id = parcel_customizations.parcel_id
        and p.owner_id = auth.uid()
    )
  );

create policy "parcel customization owner insert"
  on public.parcel_customizations
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.parcels p
      where p.id = parcel_customizations.parcel_id
        and p.owner_id = auth.uid()
    )
  );

create policy "parcel customization owner update"
  on public.parcel_customizations
  for update
  to authenticated
  using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.parcels p
      where p.id = parcel_customizations.parcel_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.parcels p
      where p.id = parcel_customizations.parcel_id
        and p.owner_id = auth.uid()
    )
  );

create policy "parcel customization owner delete"
  on public.parcel_customizations
  for delete
  to authenticated
  using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.parcels p
      where p.id = parcel_customizations.parcel_id
        and p.owner_id = auth.uid()
    )
  );

-- Storage bucket for small parcel memories. Files are private at the bucket level;
-- database RLS controls which owner can retrieve the image path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'parcel-memories',
  'parcel-memories',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

create policy "parcel memories owner read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'parcel-memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parcel memories owner upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'parcel-memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parcel memories owner update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'parcel-memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'parcel-memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "parcel memories owner delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'parcel-memories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.set_parcel_customization_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists parcel_customizations_updated_at on public.parcel_customizations;
create trigger parcel_customizations_updated_at
before update on public.parcel_customizations
for each row execute function public.set_parcel_customization_updated_at();
