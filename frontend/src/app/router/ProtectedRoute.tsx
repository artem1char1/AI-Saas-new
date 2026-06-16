import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth-session'
import { AppBootstrapSkeleton } from '@/shared/ui/skeleton'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <AppBootstrapSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
