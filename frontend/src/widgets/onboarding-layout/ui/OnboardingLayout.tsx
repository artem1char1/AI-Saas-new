import { useNavigate } from 'react-router-dom'

import { PageOutlet } from '@/app/router/PageOutlet'

import { useAuth } from '@/features/auth-session'
import { LanguageToggle } from '@/features/language-switch'
import { ThemeToggle } from '@/features/theme'
import { useI18n } from '@/shared/lib/i18n'
import { Sparkles } from '@/shared/ui/icons'

import styles from './OnboardingLayout.module.css'

export function OnboardingLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { t } = useI18n()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Sparkles />
          </span>
          <div>
            <h1>{t('common.appName')}</h1>
            <p>{t('onboarding.tagline')}</p>
          </div>
        </div>
      </div>

      <div className={styles.formArea}>
        <div className={styles.topActions}>
          <LanguageToggle />
          <ThemeToggle />
          <button type="button" className="button buttonSecondary" onClick={() => void handleLogout()}>
            {t('common.logout')}
          </button>
        </div>
        <div className={styles.card}>
          <PageOutlet />
        </div>
      </div>
    </div>
  )
}
