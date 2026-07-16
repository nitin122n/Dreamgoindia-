-- Ensure public image buckets exist and allow authenticated admins to upload photos.
-- Run this in Supabase SQL Editor if buckets/policies are missing.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('trip-images', 'trip-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('destination-images', 'destination-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('gallery-images', 'gallery-images', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4']),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf'])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for all image buckets
DO $$
DECLARE
  b TEXT;
BEGIN
  FOREACH b IN ARRAY ARRAY[
    'hero-images',
    'trip-images',
    'destination-images',
    'gallery-images',
    'blog-images',
    'avatars',
    'media'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      'Public read ' || b
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L)',
      'Public read ' || b,
      b
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      'Authenticated upload ' || b
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L)',
      'Authenticated upload ' || b,
      b
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      'Authenticated update ' || b
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L)',
      'Authenticated update ' || b,
      b
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      'Authenticated delete ' || b
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L)',
      'Authenticated delete ' || b,
      b
    );
  END LOOP;
END $$;
