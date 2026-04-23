import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Checking access...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm opacity-80">
          You are logged in, but this account is not an admin.
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
