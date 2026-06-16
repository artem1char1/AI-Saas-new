import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { register } from '@/entities/auth'
import { useAuth } from '@/features/auth-session'
import { useI18n } from '@/shared/lib/i18n'

export function RegisterForm() {
  const navigate = useNavigate()
  const { login: saveAuth } = useAuth()
  const { t } = useI18n()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await register({ email, password, full_name: fullName })
      saveAuth(response)
      navigate('/onboarding/organization', { replace: true })
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <h2 className="pageTitle">{t('auth.registerTitle')}</h2>
      <p className="pageSubtitle">{t('auth.registerSubtitle')}</p>

      <div className="field" style={{ marginTop: '1.5rem' }}>
        <label htmlFor="full_name">{t('auth.fullName')}</label>
        <input
          id="full_name"
          className="input"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
      </div>

      <div className="field">
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
          minLength={8}
        />
      </div>

      <button type="submit" className="button buttonPrimary" style={{ width: '100%' }} disabled={isLoading}>
        {isLoading ? t('auth.signingUp') : t('auth.signUp')}
      </button>

      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="linkButton">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  )
}
