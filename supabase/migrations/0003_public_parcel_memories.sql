-- Public visibility for parcel memories.
-- Owners choose whether a memory is visible to other users.

alter table public.parcel_memories
  add column if not exists is_public boolean not null default true;

update public.parcel_memories
set is_public = true
where is_public is null;

alter table public.parcel_memories enable row level security;

drop policy if exists "Parcel memories are publicly readable" on public.parcel_memories;
create policy "Public parcel memories are readable"
on public.parcel_memories
for select
using (is_public = true or (select auth.uid()) = user_id);

create index if not exists idx_parcel_memories_public
on public.parcel_memories(parcel_id)
where is_public = true;

create or replace function public.save_parcel_memory(p_parcel_id uuid, p_photo_path text, p_note text)
returns public.parcel_memories
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.save_parcel_memory(p_parcel_id, p_photo_path, p_note, true);
end;
$$;

drop function if exists public.save_parcel_memory(uuid,text,text,boolean);
create function public.save_parcel_memory(
  p_parcel_id uuid,
  p_photo_path text,
  p_note text,
  p_is_public boolean default true
)
returns public.parcel_memories
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.parcel_memories;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (
    select 1 from public.parcels p
    where p.id = p_parcel_id and p.owner_id = v_user_id
  ) then raise exception 'NOT_PARCEL_OWNER'; end if;
  if p_photo_path is null or char_length(trim(p_photo_path)) = 0 then raise exception 'PHOTO_REQUIRED'; end if;

  insert into public.parcel_memories
    (parcel_id, user_id, photo_path, note, is_public, updated_at)
  values
    (p_parcel_id, v_user_id, p_photo_path, nullif(trim(p_note), ''), coalesce(p_is_public, true), now())
  on conflict (parcel_id) do update
    set user_id = excluded.user_id,
        photo_path = excluded.photo_path,
        note = excluded.note,
        is_public = excluded.is_public,
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.save_parcel_memory(uuid,text,text) to authenticated;
grant execute on function public.save_parcel_memory(uuid,text,text,boolean) to authenticated;
