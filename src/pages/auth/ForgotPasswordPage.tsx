import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";

function friendlyResetError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) {
    return "Too many reset emails were sent. Please wait about 1 hour, then try again.";
  }
  if (msg.includes("redirect")) {
    return "Reset link setup is incomplete. Contact support or try again later.";
  }
  return message || "Failed to send reset email";
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const { error } = await resetPassword(data.email);
    if (error) {
      const friendly = friendlyResetError(error.message);
      toast.error(friendly);
      if (/rate limit/i.test(error.message)) setRateLimited(true);
      return;
    }
    setRateLimited(false);
    setSent(true);
    toast.success("Reset link sent to your email");
  };

  if (sent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent you a password reset link">
        <SEO title="Forgot Password" noIndex />
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <p className="mb-2 text-sm text-gray-600">
            We sent a reset link to <strong>{getValues("email")}</strong>
          </p>
          <p className="mb-6 text-xs text-gray-500">
            Check your inbox and spam folder. The link opens{" "}
            <strong>dreamgoindia.com</strong> and expires in about 1 hour.
          </p>
          <Link to="/auth/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your email and we'll send a reset link">
      <SEO title="Forgot Password" noIndex />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {rateLimited && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Email sending is temporarily limited by the mail service. Wait about an hour before
            requesting another reset link.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || rateLimited}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>

      <Link
        to="/auth/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
    </AuthLayout>
  );
}
