import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Loader2, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (val) => z.email().safeParse(val).success || /^\+?[\d\s-]{10,}$/.test(val),
      "Enter a valid email or phone number"
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fieldClass =
  "h-12 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-primary focus:ring-primary/20";

function isEmailVerificationReturn(): boolean {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const type = (query.get("type") || hash.get("type") || "").toLowerCase();
  return (
    type === "signup" ||
    type === "email" ||
    type === "email_change" ||
    Boolean(query.get("code")) ||
    Boolean(hash.get("access_token"))
  );
}

export default function LoginPage() {
  const { signIn, user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fromEmailVerify, setFromEmailVerify] = useState(false);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Finish email verification when Supabase redirects here with tokens/code
  useEffect(() => {
    if (!isEmailVerificationReturn()) return;

    let cancelled = false;

    const finishVerification = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code && isSupabaseConfigured) {
          await supabase.auth.exchangeCodeForSession(code);
        }
        if (cancelled) return;
        setFromEmailVerify(true);
        toast.success("Email verified. Please sign in.");
        if (isSupabaseConfigured) await supabase.auth.signOut();
        window.history.replaceState({}, "", "/auth/login");
      } catch {
        if (!cancelled) {
          toast.error("Verification link invalid or expired. Try signing in.");
          window.history.replaceState({}, "", "/auth/login");
        }
      }
    };

    void finishVerification();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Stay on login after email verification until they submit the form
    if (fromEmailVerify) return;
    if (user && !loading && profile) {
      const dest = from?.startsWith("/dashboard")
        ? from
        : from && !from.startsWith("/admin")
          ? from
          : "/dashboard";
      navigate(dest, { replace: true });
    }
  }, [user, loading, profile, navigate, from, fromEmailVerify]);

  useEffect(() => {
    if (pendingRedirect && user && !loading && profile) {
      const dest = from?.startsWith("/dashboard")
        ? from
        : from && !from.startsWith("/admin")
          ? from
          : "/dashboard";
      navigate(dest, { replace: true });
    }
  }, [pendingRedirect, user, loading, profile, navigate, from]);

  const onSubmit = async (data: LoginFormValues) => {
    const isEmail = z.email().safeParse(data.identifier).success;
    if (!isEmail) {
      toast.error("Phone login coming soon. Please use your email address.");
      return;
    }

    const { error } = await signIn(data.identifier, data.password);
    if (error) {
      toast.error(error.message || "Invalid credentials");
      return;
    }
    toast.success("Welcome back!");
    setFromEmailVerify(false);
    setPendingRedirect(true);
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Login to continue your adventure">
      <SEO title="Login" noIndex />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="identifier" className="text-sm font-semibold text-gray-900">
            Email or Phone
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="identifier"
              placeholder="Enter your email or phone number"
              className={`${fieldClass} pl-10`}
              {...register("identifier")}
            />
          </div>
          {errors.identifier && (
            <p className="text-xs text-red-500">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
              Password
            </Label>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`${fieldClass} pl-10 pr-10`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-1 h-12 w-full rounded-full text-base font-semibold shadow-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link to="/auth/signup" className="font-bold text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
