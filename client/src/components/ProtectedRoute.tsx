import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, fallback, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: !fallback,
    redirectPath: "/login",
  });
  const [, navigate] = useLocation();

  // Check admin requirement
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    if (requireAdmin && user?.role !== "admin") {
      navigate("/login?error=unauthorized");
    }
  }, [user, loading, isAuthenticated, requireAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requireAdmin && user?.role !== "admin") {
    return fallback || null;
  }

  return <>{children}</>;
}

// Admin-only route wrapper
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
}

// Customer route wrapper (any authenticated user)
export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
