import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { fetchMyOrganization, type Organization } from '@/entities/organization'
import { useAuth } from '@/features/auth-session'

type OrganizationContextValue = {
  organization: Organization | null
  isLoading: boolean
  isReady: boolean
  reload: () => Promise<void>
  setOrganization: (organization: Organization | null) => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

type OrganizationProviderProps = {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { isAuthenticated, isInitializing: isAuthInitializing } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganization(null)
      setHasFetched(true)
      return
    }

    setIsLoading(true)

    try {
      const data = await fetchMyOrganization()
      setOrganization(data)
    } catch {
      setOrganization(null)
    } finally {
      setIsLoading(false)
      setHasFetched(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthInitializing) {
      return
    }

    setHasFetched(false)
    void reload()
  }, [isAuthInitializing, reload])

  const isReady = !isAuthInitializing && (!isAuthenticated || hasFetched)

  const value = useMemo<OrganizationContextValue>(
    () => ({
      organization,
      isLoading,
      isReady,
      reload,
      setOrganization,
    }),
    [organization, isLoading, isReady, reload],
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganizationContext(): OrganizationContextValue {
  const context = useContext(OrganizationContext)

  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }

  return context
}
