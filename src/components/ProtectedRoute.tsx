import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type Props = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  const denied = !loading && requireAdmin && !!user && !isAdmin;

  useEffect(() => {
    if (denied) {
      toast({
        title: "Access denied",
        description: "This account is not approved for admin access.",
        variant: "destructive",
      });
    }
  }, [denied]);

  if (loading) {
    return <div className="p-6">Checking access...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (denied) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
