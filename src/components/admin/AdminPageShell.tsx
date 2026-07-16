import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageShellProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminPageShell({
  title,
  description,
  action,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1400px] space-y-6", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
