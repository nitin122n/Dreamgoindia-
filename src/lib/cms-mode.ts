import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Mock CMS is ONLY for when Supabase env is missing.
 * Local admin panel login must still read/write Supabase so edits persist.
 */
export function useMockCms(): boolean {
  return !isSupabaseConfigured;
}

export function isPermissionDenied(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === "42501" ||
    /permission denied|42501|GRANT SELECT|GRANT INSERT/i.test(error.message ?? "")
  );
}

export const CMS_UNLOCK_SQL_HINT =
  "Open Supabase → SQL Editor and run supabase/migrations/013_fix_admin_cms_complete.sql so the admin panel can save to the database.";
