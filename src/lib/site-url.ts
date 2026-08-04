/** Live production site — auth emails always use this (never localhost). */
export const PRODUCTION_SITE_URL = "https://www.dreamgoindia.com";

function isLocalHost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Origin for auth email links (password reset).
 * Always prefers the live site so mobile users are never sent to localhost.
 */
export function getAuthEmailOrigin(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");

  if (fromEnv && !isLocalHost(fromEnv)) return fromEnv;
  return PRODUCTION_SITE_URL;
}

/** @deprecated use getAuthEmailOrigin — kept for any non-email callers */
export function getSiteUrl(): string {
  return getAuthEmailOrigin();
}

export function getAuthRedirectUrl(path: string): string {
  const base = getAuthEmailOrigin();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Password-reset emails always open the live reset page. */
export function getPasswordResetRedirectUrl(): string {
  return `${PRODUCTION_SITE_URL}/auth/reset-password`;
}
