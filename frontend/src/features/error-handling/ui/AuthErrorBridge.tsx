import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth-session'
import { setUnauthorizedHandler } from '@/shared/api/errorReporter'

export function AuthErrorBridge() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await logout()
      navigate('/login', { replace: true })
    })

    return () => setUnauthorizedHandler(null)
  }, [logout, navigate])

  return null
}
