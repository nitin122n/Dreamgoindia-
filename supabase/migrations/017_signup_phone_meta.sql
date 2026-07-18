-- Persist phone from signup user metadata onto profiles
-- Preserves role + ON CONFLICT behavior from later admin CMS migrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, referral_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name'
    ),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'phone'), ''),
    NEW.raw_user_meta_data ->> 'avatar_url',
    upper(substring(md5(random()::text) from 1 for 8)),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
