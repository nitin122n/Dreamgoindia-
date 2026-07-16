/** Ensure social/profile URLs open correctly in a new tab. */
export function normalizeExternalUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Already absolute
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Protocol-relative
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  // Common "facebook.com/..." without scheme
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function getSocialHref(
  links: Record<string, string> | null | undefined,
  platform: string
): string | null {
  return normalizeExternalUrl(links?.[platform]);
}
