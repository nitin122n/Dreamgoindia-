import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CMS_UNLOCK_SQL_HINT, isPermissionDenied } from "@/lib/cms-mode";
import { Button } from "@/components/ui/button";

async function probeCmsAccess(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.",
    };
  }

  const { error } = await supabase.from("settings").select("id").limit(1);
  if (!error) {
    return { ok: true, message: "Connected to Supabase — admin saves go to the live website." };
  }

  if (isPermissionDenied(error)) {
    return {
      ok: false,
      message: `Database blocked (permission denied). ${CMS_UNLOCK_SQL_HINT}`,
    };
  }

  return {
    ok: false,
    message: error.message || "Could not reach Supabase CMS tables.",
  };
}

export function AdminDbStatus() {
  const qc = useQueryClient();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["admin", "cms-health"],
    queryFn: probeCmsAccess,
    staleTime: 30_000,
    retry: 1,
  });

  if (!data) return null;

  if (data.ok) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p className="flex-1 leading-snug">{data.message}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 shrink-0 text-emerald-200 hover:bg-emerald-500/20 hover:text-white"
          onClick={() => {
            void refetch();
            void qc.invalidateQueries();
          }}
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium text-amber-100">Admin saves will fail until database access is fixed</p>
          <p className="leading-snug text-amber-100/90">{data.message}</p>
          <ol className="list-decimal space-y-1 pl-4 text-amber-100/85">
            <li>
              Open{" "}
              <a
                href="https://supabase.com/dashboard/project/erhlxhvpefhchrjuvzxa/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                Supabase SQL Editor
              </a>
            </li>
            <li>
              Paste and run{" "}
              <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
                supabase/migrations/013_fix_admin_cms_complete.sql
              </code>
            </li>
            <li>Click Refresh below, then try Save again in admin</li>
          </ol>
          <Button
            type="button"
            size="sm"
            className="mt-1 bg-amber-500 text-black hover:bg-amber-400"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Recheck connection
          </Button>
        </div>
      </div>
    </div>
  );
}
