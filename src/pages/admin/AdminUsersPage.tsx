import toast from "react-hot-toast";
import { format } from "date-fns";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers, useAdminUserMutations } from "@/hooks/useAdmin";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { UserRole } from "@/types";

export default function AdminUsersPage() {
  const { data: users = [], isLoading, isError, error, refetch } = useAdminUsers();
  const { updateRole } = useAdminUserMutations();

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id, role });
      toast.success(
        isSupabaseConfigured ? "Role updated in Supabase" : "Role updated (demo)"
      );
    } catch {
      toast.error("Failed to update role — check Supabase RLS grants");
    }
  };

  return (
    <AdminPageShell title="Users" description="Manage registered users and roles">
      {isError && (
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-gray-200">
          <p className="font-semibold text-primary">Could not load users from Supabase</p>
          <p className="mt-1 text-gray-400">
            {(error as Error)?.message ?? "Permission denied. Run migration 007_admin_panel_supabase_ready.sql"}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-xs font-semibold text-primary underline"
          >
            Retry
          </button>
        </div>
      )}

      <DataTable
        loading={isLoading}
        data={users}
        emptyMessage={
          isSupabaseConfigured
            ? "No users in Supabase yet. Sign up from the website or add a user in Auth."
            : "No users found."
        }
        keyExtractor={(u) => u.id}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (u) => (
              <span className="font-medium text-white">{u.full_name ?? "—"}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            cell: (u) => <span className="text-gray-300">{u.email}</span>,
          },
          {
            key: "phone",
            header: "Phone",
            cell: (u) => <span className="text-gray-400">{u.phone ?? "—"}</span>,
          },
          {
            key: "role",
            header: "Role",
            className: "min-w-[200px]",
            cell: (u) => (
              <div className="flex items-center gap-2">
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
                <Select
                  value={u.role}
                  onValueChange={(v) => handleRoleChange(u.id, v as UserRole)}
                >
                  <SelectTrigger className="h-8 w-[120px] rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ),
          },
          {
            key: "joined",
            header: "Joined",
            cell: (u) => (
              <span className="whitespace-nowrap text-gray-400">
                {format(new Date(u.created_at), "dd MMM yyyy")}
              </span>
            ),
          },
        ]}
      />
    </AdminPageShell>
  );
}
