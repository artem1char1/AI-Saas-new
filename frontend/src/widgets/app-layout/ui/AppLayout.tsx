import { NavLink, useNavigate } from 'react-router-dom'

import { PageOutlet } from '@/app/router/PageOutlet'

import { useAuth } from '@/features/auth-session'
import { GlobalSearch } from '@/features/global-search'
import { LanguageToggle } from '@/features/language-switch'
import { ThemeToggle } from '@/features/theme'
import { useI18n } from '@/shared/lib/i18n'
import {
  ActivityIcon,
  Bell,
  Briefcase,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from '@/shared/ui/icons'

import styles from './AppLayout.module.css'

export function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useI18n()

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/contacts', label: t('nav.contacts'), icon: Users },
    { to: '/deals', label: t('nav.deals'), icon: Briefcase },
    { to: '/activities', label: t('nav.activities'), icon: ActivityIcon },
    { to: '/settings/profile', label: t('nav.settings'), icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Sparkles />
          </span>
          <span>{t('common.appName')}</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{user?.full_name?.[0] ?? 'U'}</div>
          <div>
            <div className={styles.userName}>{user?.full_name ?? t('common.user')}</div>
            <div className={styles.userRole}>{t('common.owner')}</div>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <GlobalSearch />

          <div className={styles.topbarActions}>
            <LanguageToggle />
            <ThemeToggle />
            <button type="button" className={styles.iconButton} aria-label={t('common.notifications')}>
              <Bell size={16} />
              <span className={styles.notificationDot} />
            </button>
            <button type="button" className="button buttonSecondary" onClick={() => void handleLogout()}>
              {t('common.logout')}
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <PageOutlet />
        </main>
      </div>
    </div>
  )
}
