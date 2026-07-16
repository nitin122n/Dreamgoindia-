import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";

const AUTH_BG =
  "https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=1920&q=80";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 py-8 sm:px-6">
      {/* Full scenic background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${AUTH_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-primary" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary via-primary/90 to-transparent" />
      </div>

      {/* Mountain silhouette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 sm:h-40">
        <svg
          viewBox="0 0 1440 160"
          className="h-full w-full text-primary-dark"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            opacity="0.5"
            d="M0,100 L200,55 L400,90 L600,30 L800,75 L1000,25 L1200,70 L1440,45 L1440,160 L0,160 Z"
          />
          <path
            fill="#7f1d1d"
            opacity="0.85"
            d="M0,130 L180,95 L360,120 L540,80 L720,115 L900,70 L1100,105 L1300,85 L1440,110 L1440,160 L0,160 Z"
          />
        </svg>
      </div>

      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-6 sm:top-6"
        aria-label="Go back to home"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {/* Centered phone-sized card — never stretches full desktop width */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[400px] rounded-[1.75rem] bg-white px-6 py-8 shadow-2xl sm:px-8 sm:py-9"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo className="mb-5 justify-center [&_span]:text-base [&_span:last-child]:text-sm" />
          <h1 className="text-[1.65rem] font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{subtitle}</p>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
}
