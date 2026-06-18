import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { patchDeal, setOpenDeal, type Deal } from '@/entities/deal'
import { useAppDispatch } from '@/app/store/hooks'
import { useI18n, useLocaleCode } from '@/shared/lib/i18n'

import styles from './DealNextActionCard.module.css'

type DealNextActionCardProps = {
  deal: Deal
}

function overdueDays(nextActionAt: string): number {
  const due = new Date(nextActionAt)
  const now = new Date()
  if (due >= now) return 0
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(1, Math.ceil((now.getTime() - due.getTime()) / msPerDay))
}

export function DealNextActionCard({ deal }: DealNextActionCardProps) {
  const { t } = useI18n()
  const locale = useLocaleCode()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isCompleting, setIsCompleting] = useState(false)

  const hasAction = Boolean(deal.next_action?.trim())
  const isOverdue = deal.next_action_at ? new Date(deal.next_action_at) < new Date() : false
  const daysLate = deal.next_action_at && isOverdue ? overdueDays(deal.next_action_at) : 0

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const updated = await patchDeal(deal.id, {
        next_action: null,
        next_action_at: null,
      })
      dispatch(setOpenDeal(updated))
      navigate(`/activities/new?deal_id=${deal.id}&contact_id=${deal.contact_id}`)
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <section className={`card ${styles.card}`}>
      <div className="cardHeader">
        <h2>
          <span className={styles.pin} aria-hidden>
            📌
          </span>{' '}
          {t('deals.nextAction')}
        </h2>
      </div>
      <div className="cardBody">
        {hasAction ? (
          <div className={styles.content}>
            <p className={styles.actionText}>{deal.next_action}</p>

            {isOverdue && daysLate > 0 && (
              <p className={styles.overdue}>
                {t('deals.nextActionOverdue', { days: daysLate })}
              </p>
            )}

            {!isOverdue && deal.next_action_at && (
              <p className="muted">
                {t('deals.nextActionAt')}:{' '}
                {new Date(deal.next_action_at).toLocaleString(locale)}
              </p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className="button buttonPrimary"
                disabled={isCompleting}
                onClick={() => void handleComplete()}
              >
                {t('deals.nextActionComplete')}
              </button>
              <Link to={`/deals/${deal.id}/edit`} className="button buttonSecondary">
                {t('deals.nextActionEdit')}
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className="muted">{t('deals.nextActionEmpty')}</p>
            <Link to={`/deals/${deal.id}/edit`} className="button buttonSecondary">
              {t('deals.setNextAction')}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
