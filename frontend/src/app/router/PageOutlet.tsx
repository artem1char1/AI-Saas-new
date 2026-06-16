import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { RouteSkeleton } from './RouteSkeleton'

export function PageOutlet() {
  const location = useLocation()

  return (
    <Suspense key={location.pathname} fallback={<RouteSkeleton />}>
      <Outlet />
    </Suspense>
  )
}
