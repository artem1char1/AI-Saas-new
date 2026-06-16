import { Navigate, Outlet } from 'react-router-dom'

import { useOrganization } from '@/features/organization-setup'
import { AppBootstrapSkeleton } from '@/shared/ui/skeleton'

export function OrganizationOnboardingRoute() {
  const { organization, isLoading, isReady } = useOrganization()

  if (!isReady || isLoading) {
    return <AppBootstrapSkeleton />
  }

  if (organization) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
