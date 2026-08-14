-- Ensure the designated administrator also satisfies the frontend /yonetim profile-role guard.
-- This does not change MFA/AAL2 rules or any other user's role.
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND lower(trim(u.email)) = 'incememet3296@gmail.com'
  AND p.role IS DISTINCT FROM 'admin';

-- Keep the designated admin's profile synchronized if the profile is recreated later.
CREATE OR REPLACE FUNCTION public.ensure_designated_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF lower(trim(NEW.email)) = 'incememet3296@gmail.com' THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_designated_admin_profile ON auth.users;
CREATE TRIGGER trg_ensure_designated_admin_profile
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_designated_admin_profile();
