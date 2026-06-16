import { useLocation } from 'react-router-dom'

import {
  AuthSkeleton,
  ContactDetailSkeleton,
  DashboardSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  ListPageSkeleton,
  SettingsSkeleton,
} from '@/shared/ui/skeleton'

export function RouteSkeleton() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')) {
    return <AuthSkeleton />
  }

  if (pathname.startsWith('/dashboard')) {
    return <DashboardSkeleton />
  }

  if (pathname.match(/\/(new|edit)$/)) {
    return <FormPageSkeleton />
  }

  if (pathname.match(/^\/contacts\/[^/]+$/)) {
    return <ContactDetailSkeleton />
  }

  if (pathname.match(/^\/deals\/[^/]+$/)) {
    return <DetailPageSkeleton />
  }

  if (pathname.startsWith('/settings')) {
    return <SettingsSkeleton />
  }

  if (
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/deals') ||
    pathname.startsWith('/activities')
  ) {
    return <ListPageSkeleton />
  }

  return <DashboardSkeleton />
}
