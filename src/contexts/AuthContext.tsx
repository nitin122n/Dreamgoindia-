import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types";
import { mockProfiles } from "@/data/admin-mock-data";
import {
  ADMIN_PANEL_EMAIL,
  ADMIN_PANEL_SESSION_KEY,
  isAdminPanelCredentials,
} from "@/lib/admin-panel-auth";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** Local hardcoded admin login — admin panel only */
  signInAdminPanel: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildLocalAdminProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: "local-admin-panel",
    email: ADMIN_PANEL_EMAIL,
    full_name: "Admin User",
    phone: null,
    avatar_url: null,
    role: "admin",
    interests: [],
    referral_code: null,
    language: "en",
    dark_mode: false,
    created_at: now,
    updated_at: now,
  };
}

function buildLocalAdminUser(): User {
  return {
    id: "local-admin-panel",
    email: ADMIN_PANEL_EMAIL,
    app_metadata: {},
    user_metadata: { full_name: "Admin User", role: "admin" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

function hasLocalAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_PANEL_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function setLocalAdminSession(on: boolean) {
  try {
    if (on) sessionStorage.setItem(ADMIN_PANEL_SESSION_KEY, "1");
    else sessionStorage.removeItem(ADMIN_PANEL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const applyLocalAdmin = () => {
    const adminProfile = buildLocalAdminProfile();
    setProfile(adminProfile);
    setUser(buildLocalAdminUser());
    setSession(null);
  };

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) {
      setProfile(data as Profile);
      return;
    }
    if (error) {
      console.warn("Profile fetch failed:", error.message);
    }
    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser.user?.email ?? "";
    setProfile({
      id: userId,
      email,
      full_name: (authUser.user?.user_metadata?.full_name as string) ?? email.split("@")[0] ?? "User",
      phone: null,
      avatar_url: (authUser.user?.user_metadata?.avatar_url as string) ?? null,
      role: (authUser.user?.user_metadata?.role as "admin" | "customer") ?? "customer",
      interests: [],
      referral_code: null,
      language: "en",
      dark_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const refreshProfile = async () => {
    if (hasLocalAdminSession()) {
      applyLocalAdmin();
      return;
    }
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // Restore local admin panel session first (no Supabase required)
    if (hasLocalAdminSession()) {
      applyLocalAdmin();
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const mockAdmin = mockProfiles.find((p) => p.role === "admin") ?? mockProfiles[0];
      setProfile(mockAdmin);
      setUser({ id: mockAdmin.id, email: mockAdmin.email } as User);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (hasLocalAdminSession()) {
        applyLocalAdmin();
        setLoading(false);
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (hasLocalAdminSession()) {
        applyLocalAdmin();
        setLoading(false);
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAdminPanel = async (email: string, password: string) => {
    if (!isAdminPanelCredentials(email, password)) {
      return { error: new Error("Invalid admin email or password") };
    }

    // Prefer a real Supabase session when the Auth user exists
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        setLocalAdminSession(false);
        return { error: null };
      }
      console.warn(
        "Supabase auth sign-in failed; continuing with local admin panel session:",
        error.message
      );
    }

    // Local panel access — CMS still writes to Supabase when env is configured
    setLocalAdminSession(true);
    applyLocalAdmin();
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone.trim(),
        },
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setLocalAdminSession(false);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: profile?.role === "admin",
        signInAdminPanel,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
