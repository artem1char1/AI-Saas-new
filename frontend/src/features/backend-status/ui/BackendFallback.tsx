import { useI18n } from '@/shared/lib/i18n'

import styles from './BackendFallback.module.css'

type BackendFallbackProps = {
  onRetry: () => void
  isChecking: boolean
}

export function BackendFallback({ onRetry, isChecking }: BackendFallbackProps) {
  const { t } = useI18n()

  return (
    <div className={styles.overlay} role="alertdialog" aria-modal="true" aria-labelledby="backend-fallback-title">
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h2 id="backend-fallback-title" className={styles.title}>
          {t('errors.backendUnavailableTitle')}
        </h2>
        <p className={styles.message}>{t('errors.backendUnavailableMessage')}</p>
        <div className={styles.actions}>
          <button type="button" className="button buttonPrimary" onClick={onRetry} disabled={isChecking}>
            {isChecking ? t('errors.backendRetrying') : t('errors.backendRetry')}
          </button>
        </div>
      </div>
    </div>
  )
}
