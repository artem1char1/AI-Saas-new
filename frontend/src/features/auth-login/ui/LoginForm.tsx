import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { login } from '@/entities/auth'
import { useAuth } from '@/features/auth-session'
import { useI18n } from '@/shared/lib/i18n'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: saveAuth } = useAuth()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await login({ email, password })
      saveAuth(response)

      const redirectTo =
        typeof location.state === 'object' &&
        location.state !== null &&
        'from' in location.state &&
        typeof location.state.from === 'string'
          ? location.state.from
          : '/dashboard'

      navigate(redirectTo, { replace: true })
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <h2 className="pageTitle">{t('auth.loginTitle')}</h2>
      <p className="pageSubtitle">{t('auth.loginSubtitle')}</p>

      <div className="field" style={{ marginTop: '1.5rem' }}>
        <label htmlFor="email">{t('common.email')}</label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">{t('common.password')}</label>
        <input
          id="password"
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Link to="/forgot-password" className="linkButton">
          {t('auth.forgotLink')}
        </Link>
      </div>

      <button type="submit" className="button buttonPrimary" style={{ width: '100%' }} disabled={isLoading}>
        {isLoading ? t('auth.signingIn') : t('auth.signIn')}
      </button>

      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="linkButton">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  )
}
