import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Loader2, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/contexts/AuthContext";

const DELAY_MS = 15_000;
const STORAGE_KEY = "dream-go-login-popup-done";

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
  "h-11 rounded-xl border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary/20";

function alreadyShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markShownThisSession(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function LoginPopup() {
  const { signIn, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (loading || user || alreadyShownThisSession()) return;

    const timer = window.setTimeout(() => {
      if (alreadyShownThisSession()) return;
      markShownThisSession();
      setOpen(true);
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [loading, user]);

  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) markShownThisSession();
  };

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
    setOpen(false);
    markShownThisSession();
    reset();
    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) toast.error(error.message || "Google login failed");
  };

  if (user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-200 bg-white text-gray-900 sm:max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <Logo className="mb-2 justify-center" />
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-900">
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-500">
            Login to continue your adventure with Dream Go India
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="popup-identifier" className="text-sm font-semibold text-gray-900">
              Email or Phone
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="popup-identifier"
                placeholder="Enter your email or phone"
                className={`${fieldClass} pl-10`}
                {...register("identifier")}
              />
            </div>
            {errors.identifier && (
              <p className="text-xs text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="popup-password" className="text-sm font-semibold text-gray-900">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="popup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
            <div className="flex justify-end">
              <Link
                to="/auth/forgot-password"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-full text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
          </Button>
        </form>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-500">
            <span className="bg-white px-3">or continue with</span>
          </div>
        </div>

        <Button
          variant="secondary"
          type="button"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white font-medium text-gray-900"
          onClick={handleGoogleLogin}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/signup"
            onClick={() => setOpen(false)}
            className="font-bold text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
