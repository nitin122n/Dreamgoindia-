import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Loader2, Mail, Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_PANEL_EMAIL } from "@/lib/admin-panel-auth";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const fieldClass =
  "h-12 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-primary focus:ring-primary/20";

export default function AdminLoginPage() {
  const { signInAdminPanel, user, isAdmin, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: ADMIN_PANEL_EMAIL, password: "" },
  });

  // Already logged in as admin → go to panel
  useEffect(() => {
    if (!loading && user && profile && isAdmin) {
      navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
    }
  }, [user, profile, isAdmin, loading, navigate, from]);

  const onSubmit = async (data: FormValues) => {
    setCheckingRole(true);
    try {
      // Local admin credentials only (no Supabase email confirmation needed)
      const { error } = await signInAdminPanel(data.email, data.password);
      if (error) {
        toast.error(error.message || "Invalid credentials");
        return;
      }

      toast.success("Welcome to Admin Panel");
      navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
    } finally {
      setCheckingRole(false);
    }
  };

  return (
    <AuthLayout title="Admin Login" subtitle="Sign in to manage Dream Go India">
      <SEO title="Admin Login" noIndex />

      <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
        <Shield className="h-3.5 w-3.5" />
        Staff access only — not for customers
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="admin-email" className="text-sm font-semibold text-gray-900">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder={ADMIN_PANEL_EMAIL}
              className={`${fieldClass} pl-10`}
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin-password" className="text-sm font-semibold text-gray-900">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter admin password"
              className={`${fieldClass} pl-10 pr-11`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          className="h-12 w-full rounded-full text-base font-semibold shadow-md"
          disabled={isSubmitting || checkingRole}
        >
          {isSubmitting || checkingRole ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Enter Admin Panel"
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-600">
        Looking for trip booking?{" "}
        <Link to="/auth/login" className="font-bold text-primary hover:underline">
          Customer Login
        </Link>
      </p>
    </AuthLayout>
  );
}
