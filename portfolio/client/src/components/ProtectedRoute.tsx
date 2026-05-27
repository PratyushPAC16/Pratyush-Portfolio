import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't redirect while session is being rehydrated from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-400">
        Checking session…
      </div>
    );
  }

  // Admin route is intentionally accessible unauthenticated — it shows the login form
  // Only redirect away if we somehow need to guard a different route.
  // For /admin specifically, AdminPage itself handles the login/dashboard split.
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
