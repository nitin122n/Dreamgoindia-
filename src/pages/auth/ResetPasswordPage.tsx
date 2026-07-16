import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!session && !window.location.hash.includes("access_token")) {
      toast.error("Invalid or expired reset link");
    }
  }, [session]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const { error } = await updatePassword(data.password);
    if (error) {
      toast.error(error.message || "Failed to reset password");
      return;
    }
    setDone(true);
    toast.success("Password updated successfully");
    setTimeout(() => navigate("/auth/login"), 3000);
  };

  if (done) {
    return (
      <AuthLayout title="Password Updated" subtitle="Your password has been reset successfully">
        <SEO title="Reset Password" noIndex />
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <p className="mb-6 text-sm text-gray-600">Redirecting you to login...</p>
          <Link to="/auth/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      <SEO title="Reset Password" noIndex />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              className="pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="pl-10"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
