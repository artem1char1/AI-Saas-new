import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteActivity, fetchActivities, type Activity } from '@/entities/activity'
import { useI18n, useLocaleCode, activityTypeLabel } from '@/shared/lib/i18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ListRowsOnlySkeleton } from '@/shared/ui/skeleton'
import { Calendar, FileText, Mail, Phone } from '@/shared/ui/icons'

import styles from './ActivityList.module.css'

function activityIcon(type: string) {
  const value = type.toLowerCase()
  if (value.includes('call') || value.includes('звон')) return <Phone />
  if (value.includes('meet') || value.includes('встреч')) return <Calendar />
  if (value.includes('mail') || value.includes('email')) return <Mail />
  return <FileText />
}

export function ActivityList() {
  const { t } = useI18n()
  const locale = useLocaleCode()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    try {
      setActivities(await fetchActivities())
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id)
      await load()
    } catch {
      // API errors are handled globally via toast
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="pageTitle">{t('activities.title')}</h1>
          <p className="pageSubtitle">{t('activities.subtitle')}</p>
        </div>
        <Link to="/activities/new" className="button buttonPrimary">+ {t('activities.new')}</Link>
      </div>

      <section className="card">
        <div className="cardBody">
          {isLoading ? (
            <ListRowsOnlySkeleton rows={6} />
          ) : activities.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title={t('activities.empty')}
              description={t('activities.emptyDescription')}
              action={{ label: t('activities.emptyAction'), to: '/activities/new' }}
            />
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className={styles.row}>
                <div className={styles.icon}>{activityIcon(activity.type)}</div>
                <div className={styles.content}>
                  <strong>{activityTypeLabel(activity.type, t)}</strong>
                  <p className="muted">{activity.content ?? t('common.noContent')}</p>
                  <Link to={`/deals/${activity.deal_id}`} className="linkButton">{t('activities.viewDeal')}</Link>
                </div>
                <div className={styles.meta}>
                  <span className="muted">{new Date(activity.happened_at).toLocaleString(locale)}</span>
                  <button type="button" className="button buttonGhost" onClick={() => void handleDelete(activity.id)}>
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
