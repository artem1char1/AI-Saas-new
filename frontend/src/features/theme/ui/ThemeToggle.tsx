import { useI18n } from '@/shared/lib/i18n'
import { Moon, Sun } from '@/shared/ui/icons'

import { useTheme } from '../model/ThemeProvider'

import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? t('theme.toDark') : t('theme.toLight')}
      title={theme === 'light' ? t('theme.toDark') : t('theme.toLight')}
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  )
}
