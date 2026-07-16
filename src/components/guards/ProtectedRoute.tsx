import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Array<"admin" | "customer">;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  roles,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { loading, user, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles?.length && profile && !roles.includes(profile.role)) {
    return <Navigate to={profile.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}
