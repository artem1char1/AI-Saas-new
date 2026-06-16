import { Link } from 'react-router-dom'

import { useI18n } from '@/shared/lib/i18n'

export function ForgotPasswordForm() {
  const { t } = useI18n()

  return (
    <div>
      <h2 className="pageTitle">{t('auth.forgotTitle')}</h2>
      <p className="pageSubtitle">{t('auth.forgotSubtitle')}</p>
      <p className="muted" style={{ marginTop: '1rem' }}>
        <Link to="/login" className="linkButton">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  )
}
