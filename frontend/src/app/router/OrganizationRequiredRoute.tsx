import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useOrganization } from '@/features/organization-setup'
import { AppBootstrapSkeleton } from '@/shared/ui/skeleton'

export function OrganizationRequiredRoute() {
  const { organization, isLoading, isReady } = useOrganization()
  const location = useLocation()

  if (!isReady || isLoading) {
    return <AppBootstrapSkeleton />
  }

  if (!organization) {
    return <Navigate to="/onboarding/organization" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
