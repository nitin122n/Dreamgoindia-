-- Editable admin panel password (hashed; verified at /admin/login)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS admin_panel_password_hash TEXT;

-- SHA-256 of default password "dreamindia123"
UPDATE public.settings
SET admin_panel_password_hash = '2a33d3c7642c78c0cf4f80409517bf36373806af7fe3120f63031200792a25d8'
WHERE id = 1
  AND (admin_panel_password_hash IS NULL OR btrim(admin_panel_password_hash) = '');
