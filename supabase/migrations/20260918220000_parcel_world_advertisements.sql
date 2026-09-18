-- Parsel Dünyası: purchased parcel owners can publish one public image advertisement.
create table if not exists public.parcel_advertisements (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  title text not null default 'Parsel Reklamı',
  image_path text not null,
  link_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parcel_advertisements_parcel_unique unique (parcel_id),
  constraint parcel_advertisements_title_length check (char_length(title) between 1 and 120),
  constraint parcel_advertisements_link_length check (link_url is null or char_length(link_url) <= 500)
);

create index if not exists parcel_advertisements_active_idx
  on public.parcel_advertisements (is_active, parcel_id);

alter table public.parcel_advertisements enable row level security;

revoke all on table public.parcel_advertisements from anon, authenticated;
grant select on table public.parcel_advertisements to anon, authenticated;
grant insert, update, delete on table public.parcel_advertisements to authenticated;

create policy "Public can view active parcel advertisements"
  on public.parcel_advertisements
  for select
  to anon, authenticated
  using (
    is_active = true
    or exists (
      select 1 from public.parcels p
      where p.id = parcel_advertisements.parcel_id
        and p.owner_id = (select auth.uid())
        and p.status = 'sold'
    )
  );

create policy "Parcel owners can create advertisements"
  on public.parcel_advertisements
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.parcels p
      where p.id = parcel_advertisements.parcel_id
        and p.owner_id = (select auth.uid())
        and p.status = 'sold'
    )
  );

create policy "Parcel owners can update advertisements"
  on public.parcel_advertisements
  for update
  to authenticated
  using (
    exists (
      select 1 from public.parcels p
      where p.id = parcel_advertisements.parcel_id
        and p.owner_id = (select auth.uid())
        and p.status = 'sold'
    )
  )
  with check (
    exists (
      select 1 from public.parcels p
      where p.id = parcel_advertisements.parcel_id
        and p.owner_id = (select auth.uid())
        and p.status = 'sold'
    )
  );

create policy "Parcel owners can delete advertisements"
  on public.parcel_advertisements
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.parcels p
      where p.id = parcel_advertisements.parcel_id
        and p.owner_id = (select auth.uid())
        and p.status = 'sold'
    )
  );

drop trigger if exists parcel_advertisements_updated_at on public.parcel_advertisements;
create or replace function public.set_parcel_advertisement_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger parcel_advertisements_updated_at
before update on public.parcel_advertisements
for each row execute function public.set_parcel_advertisement_updated_at();

-- Dedicated public bucket: isolated from the existing private parcel-memory bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'parcel-ads',
  'parcel-ads',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Parcel ad owners can upload images" on storage.objects;
create policy "Parcel ad owners can upload images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'parcel-ads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.parcels p
      where p.id::text = (storage.foldername(name))[2]
        and p.owner_id = (select auth.uid())
        and p.status = 'sold'
    )
  );

drop policy if exists "Parcel ad owners can update images" on storage.objects;
create policy "Parcel ad owners can update images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'parcel-ads'
    and owner_id = (select auth.uid())::text
  )
  with check (
    bucket_id = 'parcel-ads'
    and owner_id = (select auth.uid())::text
  );

drop policy if exists "Parcel ad owners can delete images" on storage.objects;
create policy "Parcel ad owners can delete images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'parcel-ads'
    and owner_id = (select auth.uid())::text
  );
