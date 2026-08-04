/** Live production site — used for auth email redirects. */
export const PRODUCTION_SITE_URL = "https://www.dreamgoindia.com";

/** Canonical public site origin for auth emails and redirects. */
export function getSiteUrl(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    // Local/dev: keep localhost so email testing still works on this machine
    if (/localhost|127\.0\.0\.1/i.test(origin)) return origin;
    return origin;
  }

  return PRODUCTION_SITE_URL;
}

export function getAuthRedirectUrl(path: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Always the live login page — used after email verification. */
export function getEmailVerificationRedirectUrl(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");
  const base = fromEnv || PRODUCTION_SITE_URL;
  return `${base}/auth/login`;
}
