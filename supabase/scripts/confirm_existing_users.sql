-- Run in Supabase SQL Editor (project: erhlxhvpefhchrjuvzxa / Dream Go India).
-- Marks existing users as confirmed so they can sign in with email + password
-- without clicking a verification email.
--
-- ALSO required in Dashboard:
-- Authentication → Providers → Email → turn OFF "Confirm email"

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email_confirmed_at IS NULL
  AND deleted_at IS NULL;
