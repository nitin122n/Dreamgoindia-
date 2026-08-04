-- Allow email/password login without confirmation emails.
-- Marks any previously unconfirmed users as confirmed.
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email_confirmed_at IS NULL
  AND deleted_at IS NULL;
