import { Link } from 'react-router-dom'

import { useI18n } from '@/shared/lib/i18n'

import styles from './DashboardOnboarding.module.css'

type OnboardingStep = {
  id: string
  label: string
  done: boolean
  to: string
}

type DashboardOnboardingProps = {
  hasOrganization: boolean
  hasContacts: boolean
  hasDeals: boolean
  hasActivities: boolean
}

function getNextStep(steps: OnboardingStep[]): OnboardingStep | null {
  return steps.find((step) => !step.done) ?? null
}

export function DashboardOnboarding({
  hasOrganization,
  hasContacts,
  hasDeals,
  hasActivities,
}: DashboardOnboardingProps) {
  const { t } = useI18n()

  const steps: OnboardingStep[] = [
    {
      id: 'organization',
      label: t('dashboard.onboarding.createOrg'),
      done: hasOrganization,
      to: '/settings/organization',
    },
    {
      id: 'contact',
      label: t('dashboard.onboarding.addContact'),
      done: hasContacts,
      to: '/contacts/new',
    },
    {
      id: 'deal',
      label: t('dashboard.onboarding.createDeal'),
      done: hasDeals,
      to: '/deals/new',
    },
    {
      id: 'activity',
      label: t('dashboard.onboarding.addActivity'),
      done: hasActivities,
      to: '/activities/new',
    },
  ]

  const isComplete = steps.every((step) => step.done)
  if (isComplete) {
    return null
  }

  const nextStep = getNextStep(steps)

  return (
    <section className={`card ${styles.onboarding}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('dashboard.onboarding.welcome')}</h2>
        <p className={styles.subtitle}>{t('dashboard.onboarding.getStarted')}</p>
      </div>

      <ul className={styles.checklist}>
        {steps.map((step) => (
          <li
            key={step.id}
            className={`${styles.checklistItem} ${step.done ? styles.checklistItemDone : ''}`}
          >
            <span
              className={`${styles.checkIcon} ${step.done ? styles.checkIconDone : ''}`}
              aria-hidden="true"
            >
              {step.done ? '✓' : ''}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>

      {nextStep && (
        <Link to={nextStep.to} className={`button buttonPrimary ${styles.action}`}>
          {t(`dashboard.onboarding.action.${nextStep.id}`)}
        </Link>
      )}
    </section>
  )
}
