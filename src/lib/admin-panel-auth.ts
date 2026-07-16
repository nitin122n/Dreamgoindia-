/** Admin panel local login — used only by /admin/login (bypasses Supabase email confirm). */
export const ADMIN_PANEL_EMAIL = "dreamgoindia5@gmail.com";
export const ADMIN_PANEL_PASSWORD = "dreamindia123";
export const ADMIN_PANEL_SESSION_KEY = "dgi_admin_panel_local";

export function isAdminPanelCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_PANEL_EMAIL.toLowerCase() &&
    password === ADMIN_PANEL_PASSWORD
  );
}

export function isLocalAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_PANEL_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}
