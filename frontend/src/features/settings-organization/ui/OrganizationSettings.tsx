import { OrganizationSetup } from '@/features/organization-setup'
import { useI18n } from '@/shared/lib/i18n'

export function OrganizationSettings() {
  const { t } = useI18n()

  return (
    <div>
      <h1 className="pageTitle">{t('settings.orgTitle')}</h1>
      <p className="pageSubtitle">{t('settings.orgSubtitle')}</p>
      <div style={{ marginTop: '1.5rem' }}>
        <OrganizationSetup />
      </div>
    </div>
  )
}
