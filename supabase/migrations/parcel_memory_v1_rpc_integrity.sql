-- V1 memory RPC integrity and delete support.
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
  v_prefix text;
  v_row public.parcel_memories;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (select 1 from public.parcels p where p.id = p_parcel_id and p.owner_id = v_user_id) then raise exception 'NOT_PARCEL_OWNER'; end if;
  v_prefix := v_user_id::text || '/' || p_parcel_id::text || '/';
  if p_photo_path is null or char_length(trim(p_photo_path)) = 0 then raise exception 'PHOTO_REQUIRED'; end if;
  if p_music_path is null or char_length(trim(p_music_path)) = 0 then raise exception 'MUSIC_REQUIRED'; end if;
  if left(trim(p_photo_path), char_length(v_prefix)) <> v_prefix then raise exception 'INVALID_PHOTO_PATH'; end if;
  if left(trim(p_music_path), char_length(v_prefix)) <> v_prefix then raise exception 'INVALID_MUSIC_PATH'; end if;
  if char_length(coalesce(p_note,'')) > 300 then raise exception 'NOTE_TOO_LONG'; end if;
  insert into public.parcel_memories (parcel_id, user_id, photo_path, note, music_path, is_public, updated_at)
  values (p_parcel_id, v_user_id, trim(p_photo_path), nullif(trim(p_note), ''), trim(p_music_path), coalesce(p_is_public, false), now())
  on conflict (parcel_id) do update set user_id=excluded.user_id, photo_path=excluded.photo_path, note=excluded.note, music_path=excluded.music_path, is_public=excluded.is_public, updated_at=now()
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.delete_parcel_memory(p_parcel_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  delete from public.parcel_memories pm using public.parcels p where pm.parcel_id=p.id and pm.parcel_id=p_parcel_id and p.owner_id=v_user_id;
  return found;
end;
$$;

revoke all on function public.save_parcel_memory(uuid,text,text,text,boolean) from public;
grant execute on function public.save_parcel_memory(uuid,text,text,text,boolean) to authenticated;
revoke all on function public.delete_parcel_memory(uuid) from public;
grant execute on function public.delete_parcel_memory(uuid) to authenticated;
