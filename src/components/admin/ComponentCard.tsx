import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ComponentCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ComponentCard({ title, description, children, className }: ComponentCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-[#161b26] p-6",
        className
      )}
    >
      <header>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      </header>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
