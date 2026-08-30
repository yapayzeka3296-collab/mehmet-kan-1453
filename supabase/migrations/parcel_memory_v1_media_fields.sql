-- Parcel Memory V1: add optional music metadata while preserving existing memories.
alter table public.parcel_memories
  add column if not exists music_path text;

create index if not exists idx_parcel_memories_public_parcel_id
on public.parcel_memories(parcel_id)
where is_public = true;

create or replace function public.save_parcel_memory(
  p_parcel_id uuid,
  p_photo_path text,
  p_note text,
  p_music_path text,
  p_is_public boolean default false
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
  if not exists (select 1 from public.parcels p where p.id = p_parcel_id and p.owner_id = v_user_id) then raise exception 'NOT_PARCEL_OWNER'; end if;
  if p_photo_path is null or char_length(trim(p_photo_path)) = 0 then raise exception 'PHOTO_REQUIRED'; end if;
  if p_music_path is null or char_length(trim(p_music_path)) = 0 then raise exception 'MUSIC_REQUIRED'; end if;
  if char_length(coalesce(p_note,'')) > 300 then raise exception 'NOTE_TOO_LONG'; end if;

  insert into public.parcel_memories (parcel_id, user_id, photo_path, note, music_path, is_public, updated_at)
  values (p_parcel_id, v_user_id, trim(p_photo_path), nullif(trim(p_note), ''), trim(p_music_path), coalesce(p_is_public, false), now())
  on conflict (parcel_id) do update
    set user_id = excluded.user_id,
        photo_path = excluded.photo_path,
        note = excluded.note,
        music_path = excluded.music_path,
        is_public = excluded.is_public,
        updated_at = now()
  returning * into v_row;
  return v_row;
end;
$$;

drop function if exists public.save_parcel_memory(uuid,text,text);
drop function if exists public.save_parcel_memory(uuid,text,text,boolean);
grant execute on function public.save_parcel_memory(uuid,text,text,text,boolean) to authenticated;
