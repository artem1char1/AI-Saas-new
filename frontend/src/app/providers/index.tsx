import type { ReactNode } from 'react'

import { AppRouter } from '@/app/router'

type AppProvidersProps = {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return children ?? <AppRouter />
}
