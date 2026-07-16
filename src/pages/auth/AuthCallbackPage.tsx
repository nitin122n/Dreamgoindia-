import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (!hashParams.get("access_token")) throw new Error("No session found");
        }

        await refreshProfile();

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
        setStatus("Authentication failed");
        toast.error("Sign in failed. Please try again.");
        setTimeout(() => navigate("/auth/login", { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate, refreshProfile]);

  return (
    <AuthLayout title="Signing In" subtitle={status}>
      <SEO title="Authenticating" noIndex />
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AuthLayout>
  );
}
