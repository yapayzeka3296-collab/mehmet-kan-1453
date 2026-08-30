-- Harden the V1 memory write RPC: it is intentionally callable only by authenticated users.
revoke all on function public.save_parcel_memory(uuid,text,text,text,boolean) from public;
grant execute on function public.save_parcel_memory(uuid,text,text,text,boolean) to authenticated;

drop index if exists public.idx_parcel_memories_public_parcel_id;
