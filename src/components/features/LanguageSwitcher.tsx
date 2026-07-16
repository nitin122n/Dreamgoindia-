import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useDashboard";
import { mockProfile } from "@/data/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", native: "EN" },
  { code: "hi", label: "Hindi", native: "हिं" },
] as const;

const STORAGE_KEY = "dream-go-language";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "toggle" | "dropdown";
}

export function LanguageSwitcher({ className, variant = "toggle" }: LanguageSwitcherProps) {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();
  const displayProfile = profile ?? (!isSupabaseConfigured ? mockProfile : null);
  const [language, setLanguage] = useState(displayProfile?.language ?? "en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLanguage(stored);
    else if (displayProfile?.language) setLanguage(displayProfile.language);
  }, [displayProfile?.language]);

  const handleChange = async (code: string) => {
    setLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;

    try {
      await updateProfile.mutateAsync({ language: code });
    } catch {
      // mock fallback already saved to localStorage
    }
  };

  if (variant === "dropdown") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Languages className="h-4 w-4 text-gray-500" />
        <select
          value={language}
          onChange={(e) => handleChange(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={cn("flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700", className)}>
      {LANGUAGES.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={() => handleChange(lang.code)}
        >
          {lang.native}
        </Button>
      ))}
    </div>
  );
}

export function useLanguage() {
  const [language] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "en");
  return { language, isHindi: language === "hi" };
}
