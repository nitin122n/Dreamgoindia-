import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function getHashParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState("Completing sign-in...");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const hashParams = getHashParams();
        const authType = (searchParams.get("type") || hashParams.get("type") || "").toLowerCase();

        const code = searchParams.get("code");
        if (code && isSupabaseConfigured) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session && !hashParams.get("access_token") && !code) {
          throw new Error("No session found");
        }

        if (cancelled) return;

        // Password recovery → set new password
        if (authType === "recovery") {
          setStatus("Opening password reset...");
          navigate("/auth/reset-password", { replace: true });
          return;
        }

        await refreshProfile();
        if (cancelled) return;

        let dest = "/dashboard";
        if (isSupabaseConfigured && data.session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .single();
          if (profile?.role === "admin") dest = "/admin";
        }

        setStatus("Success! Redirecting...");
        toast.success("Signed in successfully");
        navigate(dest, { replace: true });
      } catch {
        if (cancelled) return;
        setStatus("Authentication failed");
        toast.error("Sign-in failed. Please try again.");
        setTimeout(() => navigate("/auth/login", { replace: true }), 1500);
      }
    };

    void handleCallback();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshProfile, searchParams]);

  return (
    <AuthLayout title="Almost there" subtitle={status}>
      <SEO title="Signing in" noIndex />
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AuthLayout>
  );
}
