import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { fetchMe, logout as logoutRequest, refreshToken, type AuthResponse, type AuthUser } from '@/entities/auth'
import {
  clearSession,
  getRefreshToken,
  loadSession,
  saveSession,
  type StoredSession,
} from '@/entities/session'
import { setAuthHandlers } from '@/shared/api/base'
import { setAccessToken } from '@/shared/api/authToken'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (response: AuthResponse) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

function persistSession(session: StoredSession): void {
  saveSession(session)
  setAccessToken(session.tokens.access_token)
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    persistSession(response)
    setUser(response.user)
  }, [])

  const clearAuth = useCallback(() => {
    clearSession()
    setAccessToken(null)
    setUser(null)
  }, [])

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refresh = getRefreshToken()
    if (!refresh) {
      clearAuth()
      return false
    }

    try {
      const tokens = await refreshToken(refresh)
      const stored = loadSession()
      const nextSession: StoredSession = {
        user: stored?.user ?? {
          id: '',
          email: '',
          full_name: '',
          is_active: true,
          last_login_at: null,
        },
        tokens,
      }

      persistSession(nextSession)

      const currentUser = await fetchMe()
      saveSession({ ...nextSession, user: currentUser })
      setUser(currentUser)
      return true
    } catch {
      clearAuth()
      return false
    }
  }, [clearAuth])

  const login = useCallback(
    (response: AuthResponse) => {
      applyAuthResponse(response)
    },
    [applyAuthResponse],
  )

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()

    if (refresh) {
      try {
        await logoutRequest(refresh)
      } catch {
        // ignore logout API errors and clear local session anyway
      }
    }

    clearAuth()
  }, [clearAuth])

  useEffect(() => {
    setAuthHandlers({ refresh: refreshSession })

    return () => {
      setAuthHandlers(null)
    }
  }, [refreshSession])

  useEffect(() => {
    const initialize = async () => {
      const stored = loadSession()
      if (!stored) {
        setIsInitializing(false)
        return
      }

      persistSession(stored)

      try {
        const currentUser = await fetchMe()
        saveSession({ ...stored, user: currentUser })
        setUser(currentUser)
      } catch {
        await refreshSession()
      } finally {
        setIsInitializing(false)
      }
    }

    void initialize()
  }, [refreshSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      logout,
    }),
    [user, isInitializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
