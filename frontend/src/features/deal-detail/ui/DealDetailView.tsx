import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import type { Activity } from '@/entities/activity'
import {
  DEAL_OUTCOME_STAGES,
  DEAL_PIPELINE_STAGES,
  dealStageIndex,
  dealStatusProgress,
  isDealOutcome,
  loadOpenDeal,
  patchDeal,
  selectOpenDeal,
  selectOpenDealActivities,
  selectOpenDealContact,
  selectOpenDealError,
  selectOpenDealLoading,
  setOpenDeal,
  type Deal,
} from '@/entities/deal'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { useI18n, useLocaleCode } from '@/shared/lib/i18n'
import { DetailPageSkeleton } from '@/shared/ui/skeleton'
import { Calendar, FileText, Mail, Phone } from '@/shared/ui/icons'

import styles from './DealDetailView.module.css'

function activityIcon(type: string) {
  const value = type.toLowerCase()
  if (value.includes('call') || value.includes('звон')) return <Phone />
  if (value.includes('meet') || value.includes('встреч')) return <Calendar />
  if (value.includes('mail') || value.includes('email')) return <Mail />
  return <FileText />
}

function formatDateTime(value: string | null, locale: string): string {
  if (!value) return ''
  return new Date(value).toLocaleString(locale)
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString(locale)
}

function resolveLastContactAt(deal: Deal, activities: Activity[]): string | null {
  const timestamps = [
    deal.last_contact_at ? new Date(deal.last_contact_at).getTime() : null,
    ...activities.map((activity) => new Date(activity.happened_at).getTime()),
  ].filter((value): value is number => value !== null)

  if (timestamps.length === 0) return null
  return new Date(Math.max(...timestamps)).toISOString()
}

function calculateRiskKey(deal: Deal): 'high' | 'medium' | 'low' {
  if (isDealOutcome(deal.status)) return 'low'

  let score = 0
  if (deal.priority === 'high') score += 2
  else if (deal.priority === 'medium') score += 1

  if (deal.status === 'negotiation') score += 2
  else if (deal.status === 'proposal') score += 1

  if (!deal.next_action?.trim()) score += 3

  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

export function DealDetailView() {
  const { dealId } = useParams<{ dealId: string }>()
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const locale = useLocaleCode()

  const deal = useAppSelector(selectOpenDeal)
  const contact = useAppSelector(selectOpenDealContact)
  const activities = useAppSelector(selectOpenDealActivities)
  const isLoading = useAppSelector(selectOpenDealLoading)
  const hasError = useAppSelector(selectOpenDealError)

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!dealId) return
    void dispatch(loadOpenDeal(dealId))
  }, [dealId, dispatch])

  const lastContactAt = useMemo(
    () => (deal ? resolveLastContactAt(deal, activities) : null),
    [deal, activities],
  )

  const handleStageClick = async (stage: string) => {
    if (!deal || deal.status === stage || isUpdatingStatus) return

    setIsUpdatingStatus(true)
    try {
      const updated = await patchDeal(deal.id, { status: stage })
      dispatch(setOpenDeal(updated))
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const isWrongDeal = deal && dealId && deal.id !== dealId

  if (hasError) return <p className="error">{t('deals.notFound')}</p>
  if (isLoading || !deal || isWrongDeal) return <DetailPageSkeleton />

  const progress = dealStatusProgress(deal.status)
  const currentStageIndex = dealStageIndex(deal.status)
  const currentOutcome = isDealOutcome(deal.status) ? deal.status : null
  const riskKey = calculateRiskKey(deal)

  const riskClass =
    riskKey === 'high' ? 'badgeDanger' : riskKey === 'medium' ? 'badgeWarning' : 'badgeSuccess'

  const statusLabel = (status: string) => {
    const key = `deals.status.${status.toLowerCase()}`
    const translated = t(key)
    return translated === key ? status : translated
  }

  const renderStageButton = (stage: string, variant: 'pipeline' | 'outcome' = 'pipeline') => {
    const isPipelineStage = variant === 'pipeline'
    const isActive = isPipelineStage
      ? currentOutcome === 'won'
        ? true
        : !currentOutcome && currentStageIndex >= 0 && dealStageIndex(stage) <= currentStageIndex
      : currentOutcome === stage
    const isCurrent = deal.status === stage

    return (
      <button
        key={stage}
        type="button"
        className={styles.pipelineButton}
        disabled={isUpdatingStatus}
        onClick={() => void handleStageClick(stage)}
      >
        <span
          className={`${styles.pipelineDot} ${isActive || isCurrent ? styles.pipelineDotActive : ''} ${
            variant === 'outcome' && stage === 'won' ? styles.pipelineDotWon : ''
          } ${variant === 'outcome' && stage === 'lost' ? styles.pipelineDotLost : ''}`}
        />
        <span className={isCurrent ? styles.pipelineActive : 'muted'}>{statusLabel(stage)}</span>
      </button>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link to="/deals">{t('nav.deals')}</Link>
        <span> / </span>
        <span>{deal.title}</span>
      </div>

      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className="pageTitle">{deal.title}</h1>
            <span className={`badge ${riskClass}`}>{t(`deals.risk.${riskKey}`)}</span>
          </div>
          <div className={styles.meta}>
            <span>{deal.amount ? `₽${Number(deal.amount).toLocaleString(locale)}` : t('common.noAmount')}</span>
            <span>{progress}%</span>
            <span className="badge badgeNeutral">{statusLabel(deal.status)}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/deals/${deal.id}/edit`} className="button buttonSecondary">
            {t('common.edit')}
          </Link>
          <Link
            to={`/activities/new?deal_id=${deal.id}&contact_id=${deal.contact_id}`}
            className="button buttonPrimary"
          >
            + {t('deals.addActivity')}
          </Link>
        </div>
      </div>

      <div className={styles.pipelineCard}>
        <div className={styles.pipelineRow}>
          {DEAL_PIPELINE_STAGES.map((stage) => renderStageButton(stage))}
        </div>
        <div className={styles.pipelineOutcomes}>
          {DEAL_OUTCOME_STAGES.map((stage) => renderStageButton(stage, 'outcome'))}
        </div>
      </div>

      <div className={styles.grid}>
        <section className="card">
          <div className="cardHeader"><h2>{t('deals.about')}</h2></div>
          <div className="cardBody">
            <div className={styles.infoRow}>
              <span className="muted">{t('common.amount')}</span>
              <span>{deal.amount ? `₽${Number(deal.amount).toLocaleString(locale)}` : t('common.dash')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className="muted">{t('deals.expectedClose')}</span>
              <span>{deal.expected_close_date ?? t('common.dash')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className="muted">{t('common.contact')}</span>
              <span>{contact?.name ?? t('common.dash')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className="muted">{t('common.priority')}</span>
              <span>{deal.priority ? t(`deals.priority.${deal.priority}`) : t('common.dash')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className="muted">{t('deals.lastContact')}</span>
              <span>{lastContactAt ? formatDate(lastContactAt, locale) : t('common.dash')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className="muted">{t('common.created')}</span>
              <span>{new Date(deal.created_at).toLocaleDateString(locale)}</span>
            </div>
            {deal.status === 'lost' && (
              <div className={styles.infoRow}>
                <span className="muted">{t('deals.lossReason')}</span>
                <span>{deal.loss_reason ?? t('common.dash')}</span>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>{t('deals.nextAction')}</h2>
            <Link to={`/deals/${deal.id}/edit`} className="linkButton">
              {t('common.edit')}
            </Link>
          </div>
          <div className="cardBody">
            {deal.next_action ? (
              <div className={styles.nextActionBox}>
                <p className={styles.nextActionText}>{deal.next_action}</p>
                {deal.next_action_at && (
                  <p className="muted">
                    {t('deals.nextActionAt')}: {formatDateTime(deal.next_action_at, locale)}
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.nextActionEmpty}>
                <p className="muted">{t('deals.nextActionEmpty')}</p>
                <Link to={`/deals/${deal.id}/edit`} className="button buttonSecondary">
                  {t('deals.setNextAction')}
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>{t('deals.activities')}</h2>
            <Link to={`/activities/new?deal_id=${deal.id}&contact_id=${deal.contact_id}`} className="linkButton">
              + {t('deals.addActivity')}
            </Link>
          </div>
          <div className="cardBody">
            {activities.length === 0 ? (
              <div className="emptyState">{t('deals.activitiesEmpty')}</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{activityIcon(activity.type)}</div>
                  <div>
                    <strong>{activity.type}</strong>
                    <p className="muted">{activity.content ?? t('common.noContent')}</p>
                    <span className="muted">{formatDateTime(activity.happened_at, locale)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="cardHeader"><h2>{t('common.contact')}</h2></div>
          <div className="cardBody">
            {contact ? (
              <div className={styles.contactCard}>
                <div className={styles.avatar}>{contact.name[0]}</div>
                <div>
                  <strong>{contact.name}</strong>
                  <p className="muted">{contact.company_name ?? t('common.noCompany')}</p>
                  <p className="muted">{contact.email ?? t('common.noEmail')}</p>
                  <p className="muted">{contact.phone ?? t('common.noPhone')}</p>
                  <Link to={`/contacts/${contact.id}`} className="linkButton">{t('contacts.viewContact')}</Link>
                </div>
              </div>
            ) : (
              <div className="emptyState">{t('contacts.notFound')}</div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="cardHeader"><h2>{t('dashboard.aiInsights')}</h2></div>
          <div className="cardBody">
            <div className={styles.aiBox}>
              <h3>{t('dashboard.aiTitle')}</h3>
              <p className="muted">
                {t('deals.aiRiskText', { risk: t(`deals.risk.${riskKey}`) })}
              </p>
              {!deal.next_action?.trim() && !isDealOutcome(deal.status) && (
                <p className={styles.riskHint}>{t('deals.noNextActionRisk')}</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
