import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { fetchHealthStatus } from '@/entities/health'
import { setBackendStatusHandler } from '@/shared/api/errorReporter'

import { BackendFallback } from '../ui/BackendFallback'

type BackendStatusContextValue = {
  isBackendAvailable: boolean
  retryConnection: () => Promise<void>
  isChecking: boolean
}

const BackendStatusContext = createContext<BackendStatusContextValue | null>(null)

type BackendStatusProviderProps = {
  children: ReactNode
}

export function BackendStatusProvider({ children }: BackendStatusProviderProps) {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  const retryConnection = useCallback(async () => {
    setIsChecking(true)
    try {
      await fetchHealthStatus()
      setIsBackendAvailable(true)
    } catch {
      setIsBackendAvailable(false)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    setBackendStatusHandler({
      setAvailable: () => setIsBackendAvailable(true),
      setUnavailable: () => setIsBackendAvailable(false),
    })

    return () => setBackendStatusHandler(null)
  }, [])

  useEffect(() => {
    void retryConnection()
  }, [retryConnection])

  const value = useMemo(
    () => ({
      isBackendAvailable,
      retryConnection,
      isChecking,
    }),
    [isBackendAvailable, isChecking, retryConnection],
  )

  return (
    <BackendStatusContext.Provider value={value}>
      {children}
      {!isBackendAvailable && (
        <BackendFallback onRetry={() => void retryConnection()} isChecking={isChecking} />
      )}
    </BackendStatusContext.Provider>
  )
}

export function useBackendStatus(): BackendStatusContextValue {
  const context = useContext(BackendStatusContext)
  if (!context) {
    throw new Error('useBackendStatus must be used within BackendStatusProvider')
  }
  return context
}
