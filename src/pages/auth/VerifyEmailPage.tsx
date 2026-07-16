import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "your email";

  return (
    <AuthLayout title="Verify Your Email" subtitle="One more step before you start exploring">
      <SEO title="Verify Email" noIndex />

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <p className="mb-2 text-sm text-gray-600">
          We&apos;ve sent a verification link to
        </p>
        <p className="mb-4 font-semibold text-gray-900">{email}</p>
        <p className="mb-6 text-xs text-gray-500">
          Click the link in the email to verify your account. Check your spam folder if you
          don&apos;t see it within a few minutes.
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
