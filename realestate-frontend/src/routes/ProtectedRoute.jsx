// src/components/ProtectedRoute.jsx

import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function ProtectedRoute({
  allowedRoles = [],
  children,
  fallback = <div>No authorize to access dashboard</div>,
  redirectTo = '/',
}) {
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      window.location.href = redirectTo;
      return;
    }

    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, role, isLoading, allowedRoles, redirectTo]);

  if (isLoading) return null;

  if (!isAuthenticated) return fallback;

  if (allowedRoles.length > 0 && !role) return null;

  if (allowedRoles.length > 0) {
    return allowedRoles.includes(role) ? children : fallback;
  }

  return children;
}