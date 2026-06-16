import { useAuth } from '@/features/auth-session'
import { useI18n } from '@/shared/lib/i18n'

export function ProfileSettings() {
  const { user } = useAuth()
  const { t } = useI18n()

  return (
    <div>
      <h1 className="pageTitle">{t('settings.profileTitle')}</h1>
      <p className="pageSubtitle">{t('settings.profileSubtitle')}</p>

      <section className="card" style={{ marginTop: '1.5rem' }}>
        <div className="cardBody">
          <div className="listRow"><span className="muted">{t('common.name')}</span><span>{user?.full_name}</span></div>
          <div className="listRow"><span className="muted">{t('common.email')}</span><span>{user?.email}</span></div>
          <div className="listRow">
            <span className="muted">{t('common.status')}</span>
            <span>{user?.is_active ? t('common.active') : t('common.inactive')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
