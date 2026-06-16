import { useI18n } from '@/shared/lib/i18n'

import styles from './LanguageToggle.module.css'

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className={styles.toggle} role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className={locale === 'ru' ? styles.active : styles.button}
        onClick={() => setLocale('ru')}
      >
        {t('language.ru')}
      </button>
      <button
        type="button"
        className={locale === 'en' ? styles.active : styles.button}
        onClick={() => setLocale('en')}
      >
        {t('language.en')}
      </button>
    </div>
  )
}
