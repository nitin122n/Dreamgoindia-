import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Phone, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { friendlyAuthError } from "@/lib/auth-errors";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";

const fieldClass =
  "border-gray-200 bg-white text-gray-900 caret-gray-900 placeholder:text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-900 dark:caret-gray-900 dark:placeholder:text-gray-400";

const labelClass = "text-sm font-medium text-primary dark:text-primary";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    const { error } = await signUp(data.email, data.password, data.fullName, data.phone);
    if (error) {
      toast.error(friendlyAuthError(error.message, "Signup failed. Please try again."));
      return;
    }
    toast.success("Account created! Welcome aboard.");
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Dream Go India and start exploring">
      <SEO title="Sign Up" noIndex />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className={labelClass}>
            Full Name
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="fullName"
              placeholder="Your full name"
              className={`pl-10 ${fieldClass}`}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              className={`pl-10 ${fieldClass}`}
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={labelClass}>
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className={`pl-10 ${fieldClass}`}
              {...register("phone")}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              className={`pl-10 pr-11 ${fieldClass}`}
              autoComplete="new-password"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-primary hover:bg-primary/10"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={labelClass}>
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className={`pl-10 pr-11 ${fieldClass}`}
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-primary hover:bg-primary/10"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
