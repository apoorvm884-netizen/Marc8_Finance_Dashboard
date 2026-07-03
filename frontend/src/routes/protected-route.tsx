import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { PERMISSIONS } from '@/config/constants';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredPermission?: keyof typeof PERMISSIONS;
  requiredRoles?: string[];
}

export function ProtectedRoute({ requiredPermission, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-secondary-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && user) {
    const allowedRoles = PERMISSIONS[requiredPermission];
    if (!allowedRoles.includes(user.role as never)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
