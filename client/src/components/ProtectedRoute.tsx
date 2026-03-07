import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Automatically redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user && error) {
      // Redirect to login with current path as redirect param
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, user, error, navigate]);

  if (isLoading) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-white/50">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

/**
 * AdminRoute - Wraps routes that require admin role
 */
export function AdminRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [isLoading, user, error, navigate]);

  if (isLoading) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-white/50">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
