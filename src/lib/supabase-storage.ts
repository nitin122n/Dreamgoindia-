import { supabase } from "@/lib/supabase";

/** Parse a public Supabase storage URL into bucket + path */
export function parseStoragePublicUrl(
  url: string | null | undefined
): { bucket: string; path: string } | null {
  if (!url) return null;
  try {
    const marker = "/storage/v1/object/public/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const rest = url.slice(idx + marker.length);
    const slash = rest.indexOf("/");
    if (slash <= 0) return null;
    const bucket = decodeURIComponent(rest.slice(0, slash));
    const path = decodeURIComponent(rest.slice(slash + 1).split("?")[0] ?? "");
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

/** Delete one or more public storage objects (best-effort; ignores missing files) */
export async function deleteStorageByPublicUrls(urls: Array<string | null | undefined>) {
  const byBucket = new Map<string, string[]>();

  for (const url of urls) {
    const parsed = parseStoragePublicUrl(url);
    if (!parsed) continue;
    const list = byBucket.get(parsed.bucket) ?? [];
    list.push(parsed.path);
    byBucket.set(parsed.bucket, list);
  }

  for (const [bucket, paths] of byBucket) {
    const unique = [...new Set(paths)];
    if (!unique.length) continue;
    const { error } = await supabase.storage.from(bucket).remove(unique);
    if (error) {
      console.warn(`Storage delete failed (${bucket}):`, error.message);
    }
  }
}
