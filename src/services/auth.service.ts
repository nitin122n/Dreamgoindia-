import type { AuthError, Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in your .env file.";


export class AuthServiceError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthServiceError";
    this.code = code;
  }
}

function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new AuthServiceError(SUPABASE_NOT_CONFIGURED_MESSAGE, "SUPABASE_NOT_CONFIGURED");
  }
}

function toAuthServiceError(error: AuthError): AuthServiceError {
  return new AuthServiceError(error.message, error.code);
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: User; session: Session }> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw toAuthServiceError(error);
  }

  if (!data.user || !data.session) {
    throw new AuthServiceError("Sign in failed. Please try again.");
  }

  return { user: data.user, session: data.session };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
  phone?: string,
): Promise<{ user: User | null; session: Session | null }> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName ?? "",
        ...(phone?.trim() ? { phone: phone.trim() } : {}),
      },
    },
  });

  if (error) {
    throw toAuthServiceError(error);
  }

  return { user: data.user, session: data.session };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw toAuthServiceError(error);
  }
}

export async function signInWithGoogle(): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw toAuthServiceError(error);
  }
}

export async function resetPassword(email: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw toAuthServiceError(error);
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  ensureSupabaseConfigured();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw toAuthServiceError(error);
  }
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw toAuthServiceError(error);
  }

  return data.session;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new AuthServiceError(error.message, error.code);
  }

  return data;
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
): { unsubscribe: () => void } {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => undefined };
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return { unsubscribe: () => data.subscription.unsubscribe() };
}
