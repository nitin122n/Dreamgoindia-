import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/** Admin panel local login — used only by /admin/login (bypasses Supabase email confirm). */
export const ADMIN_PANEL_EMAIL = "dreamgoindia5@gmail.com";
/** Default password until changed in Admin → Settings */
export const DEFAULT_ADMIN_PANEL_PASSWORD = "dreamindia123";
/** @deprecated Use DEFAULT_ADMIN_PANEL_PASSWORD */
export const ADMIN_PANEL_PASSWORD = DEFAULT_ADMIN_PANEL_PASSWORD;
export const ADMIN_PANEL_SESSION_KEY = "dgi_admin_panel_local";
const LOCAL_HASH_KEY = "dgi_admin_panel_password_hash";

/** SHA-256 of DEFAULT_ADMIN_PANEL_PASSWORD ("dreamindia123") */
export const DEFAULT_ADMIN_PANEL_PASSWORD_HASH =
  "2a33d3c7642c78c0cf4f80409517bf36373806af7fe3120f63031200792a25d8";

export async function hashAdminPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readLocalHash(): string | null {
  try {
    const v = localStorage.getItem(LOCAL_HASH_KEY);
    return v?.trim() || null;
  } catch {
    return null;
  }
}

export function writeLocalHash(hash: string): void {
  try {
    localStorage.setItem(LOCAL_HASH_KEY, hash);
  } catch {
    /* ignore */
  }
}

/** Load stored password hash from settings (or local override in demo mode). */
export async function getAdminPanelPasswordHash(): Promise<string> {
  const local = readLocalHash();
  if (local) return local;

  if (!isSupabaseConfigured) {
    return DEFAULT_ADMIN_PANEL_PASSWORD_HASH;
  }

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("admin_panel_password_hash")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.warn("Could not load admin panel password hash:", error.message);
      return DEFAULT_ADMIN_PANEL_PASSWORD_HASH;
    }

    const hash = (data as { admin_panel_password_hash?: string | null } | null)
      ?.admin_panel_password_hash;
    if (hash && hash.trim()) return hash.trim();
  } catch (e) {
    console.warn("Admin password hash fetch failed:", e);
  }

  return DEFAULT_ADMIN_PANEL_PASSWORD_HASH;
}

export async function isAdminPanelCredentials(
  email: string,
  password: string
): Promise<boolean> {
  if (email.trim().toLowerCase() !== ADMIN_PANEL_EMAIL.toLowerCase()) {
    return false;
  }
  const [typedHash, storedHash] = await Promise.all([
    hashAdminPassword(password),
    getAdminPanelPasswordHash(),
  ]);
  return typedHash === storedHash;
}

export async function verifyAdminPanelPassword(password: string): Promise<boolean> {
  const [typedHash, storedHash] = await Promise.all([
    hashAdminPassword(password),
    getAdminPanelPasswordHash(),
  ]);
  return typedHash === storedHash;
}

export function isLocalAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_PANEL_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}
