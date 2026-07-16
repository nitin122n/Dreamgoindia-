import { ProtectedRoute } from "@/components/guards/ProtectedRoute";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return <ProtectedRoute roles={["admin"]}>{children}</ProtectedRoute>;
}
