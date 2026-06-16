import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { createOrganization } from '@/entities/organization'
import { useI18n, useLocaleCode } from '@/shared/lib/i18n'
import { SettingsSkeleton } from '@/shared/ui/skeleton'

import { useOrganization } from '../model/useOrganization'

import styles from './OrganizationSetup.module.css'

type OrganizationSetupProps = {
  mode?: 'settings' | 'onboarding'
}

export function OrganizationSetup({ mode = 'settings' }: OrganizationSetupProps) {
  const navigate = useNavigate()
  const { organization, isLoading, setOrganization } = useOrganization()
  const { t } = useI18n()
  const locale = useLocaleCode()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const created = await createOrganization({ name })
      setOrganization(created)

      if (mode === 'onboarding') {
        navigate('/dashboard', { replace: true })
      }
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === 'settings' && isLoading) {
    return <SettingsSkeleton />
  }

  if (mode === 'settings' && organization) {
    return (
      <section className={`card ${styles.card}`}>
        <div className="cardBody">
          <h2>{t('settings.organization')}</h2>
          <p className={styles.orgName}>{organization.name}</p>
          <p className="muted">
            {t('common.created')} {new Date(organization.created_at).toLocaleDateString(locale)}
          </p>
        </div>
      </section>
    )
  }

  const title = mode === 'onboarding' ? t('onboarding.title') : t('settings.createOrg')
  const hint = mode === 'onboarding' ? t('onboarding.subtitle') : t('settings.createOrgHint')

  return (
    <section className={mode === 'settings' ? `card ${styles.card}` : styles.onboarding}>
      <div className={mode === 'settings' ? 'cardBody' : undefined}>
        {mode === 'onboarding' && <p className={styles.step}>{t('onboarding.step')}</p>}
        <h2 className={mode === 'onboarding' ? styles.onboardingTitle : undefined}>{title}</h2>
        <p className="muted">{hint}</p>
        <form onSubmit={(event) => void handleSubmit(event)} style={{ marginTop: '1rem' }}>
          <div className="field">
            <label htmlFor="org-name">{t('onboarding.orgNameLabel')}</label>
            <input
              id="org-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('onboarding.orgNamePlaceholder')}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="button buttonPrimary" disabled={isSubmitting}>
            {isSubmitting ? t('settings.creating') : t('onboarding.continue')}
          </button>
        </form>
      </div>
    </section>
  )
}
