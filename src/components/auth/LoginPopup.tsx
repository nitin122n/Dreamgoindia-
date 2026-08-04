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
import { friendlyAuthError } from "@/lib/auth-errors";

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
  "h-11 rounded-xl border-gray-200 bg-white text-sm text-gray-900 caret-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary/20 dark:border-gray-200 dark:bg-white dark:text-gray-900 dark:caret-gray-900 dark:placeholder:text-gray-400";

const labelClass = "text-sm font-semibold text-primary dark:text-primary";

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
  const { signIn, user, loading } = useAuth();
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
      toast.error(friendlyAuthError(error.message, "Invalid credentials"));
      return;
    }

    toast.success("Welcome back!");
    setOpen(false);
    markShownThisSession();
    reset();
    navigate("/dashboard");
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
            <Label htmlFor="popup-identifier" className={labelClass}>
              Email or Phone
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="popup-identifier"
                placeholder="Enter your email or phone"
                className={`${fieldClass} pl-10`}
                autoComplete="username"
                {...register("identifier")}
              />
            </div>
            {errors.identifier && (
              <p className="text-xs text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="popup-password" className={labelClass}>
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="popup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`${fieldClass} pl-10 pr-11`}
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-primary hover:bg-primary/10"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
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
