-- Restore the missing notification trigger for physical certificate requests.
-- The notification is created only after a valid physical request row is inserted.
-- No authentication, ownership, certificate, or logout behavior is changed.

create or replace function public.notify_admin_physical_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
begin
  insert into public.admin_notifications(type,title,message,entity_id,metadata)
  values(
    'physical_certificate',
    'Yeni fiziksel sertifika talebi',
    'Bir kullanıcı fiziksel sertifika gönderimi istedi.',
    new.id,
    jsonb_build_object(
      'user_id',new.user_id,
      'certificate_id',new.certificate_id,
      'parcel_id',new.parcel_id,
      'tier',new.tier,
      'status',new.status
    )
  );
  return new;
end;
$$;

drop trigger if exists physical_certificate_request_notification_trigger on public.physical_certificate_requests;
create trigger physical_certificate_request_notification_trigger
after insert on public.physical_certificate_requests
for each row execute function public.notify_admin_physical_certificate_request();
