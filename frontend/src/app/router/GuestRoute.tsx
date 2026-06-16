import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/features/auth-session'
import { useOrganization } from '@/features/organization-setup'
import { AuthSkeleton } from '@/shared/ui/skeleton'

export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const { organization, isReady } = useOrganization()

  if (isInitializing || (isAuthenticated && !isReady)) {
    return <AuthSkeleton />
  }

  if (isAuthenticated) {
    return <Navigate to={organization ? '/dashboard' : '/onboarding/organization'} replace />
  }

  return <Outlet />
}
