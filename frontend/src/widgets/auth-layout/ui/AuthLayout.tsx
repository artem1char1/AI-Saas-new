import { PageOutlet } from '@/app/router/PageOutlet'

import { LanguageToggle } from '@/features/language-switch'
import { ThemeToggle } from '@/features/theme'
import { useI18n } from '@/shared/lib/i18n'
import { Sparkles } from '@/shared/ui/icons'

import styles from './AuthLayout.module.css'

export function AuthLayout() {
  const { t } = useI18n()

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Sparkles />
          </span>
          <div>
            <h1>{t('common.appName')}</h1>
            <p>{t('auth.tagline')}</p>
          </div>
        </div>
      </div>

      <div className={styles.formArea}>
        <div className={styles.topActions}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <div className={styles.card}>
          <PageOutlet />
        </div>
      </div>
    </div>
  )
}
