import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultSettings } from "@/data/mock-data";
import type { SiteSettings } from "@/types";
import { mapSettingsRow } from "@/lib/settings-map";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type { SiteSettings };

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    if (!isSupabaseConfigured) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    if (!error && data) {
      setSettings(mapSettingsRow(data as Record<string, unknown>));
    } else {
      setSettings(defaultSettings);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSettings();
    const onUpdated = () => {
      void refreshSettings();
    };
    window.addEventListener("dgi:settings-updated", onUpdated);
    return () => window.removeEventListener("dgi:settings-updated", onUpdated);
  }, []);

  // Keep browser tab favicon in sync with settings
  useEffect(() => {
    const href = settings.favicon_url?.trim() || settings.logo_url?.trim();
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [settings.favicon_url, settings.logo_url]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
