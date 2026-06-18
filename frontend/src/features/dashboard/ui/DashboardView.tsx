import { useEffect, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import { fetchActivities } from '@/entities/activity'
import { fetchContacts } from '@/entities/contact'
import {
  fetchDashboardSummary,
  type AiInsightKind,
  type DashboardSummary,
  type TodayStatKind,
  type TopDealDashboard,
} from '@/entities/deal-risk'
import { fetchDeals } from '@/entities/deal'
import { useOrganization } from '@/features/organization-setup'
import { useI18n, useLocaleCode, activityTypeLabel } from '@/shared/lib/i18n'
import { DashboardSkeleton } from '@/shared/ui/skeleton'
import { Calendar, FileText, Mail, Phone } from '@/shared/ui/icons'

import { DashboardOnboarding } from './DashboardOnboarding'
import { DashboardSectionEmpty } from './DashboardSectionEmpty'

import styles from './DashboardView.module.css'

function formatMoney(value: string | null, locale: string): string {
  if (!value) return '₽0'
  const num = Number(value)
  return Number.isNaN(num) ? `₽${value}` : `₽${num.toLocaleString(locale)}`
}

function activityIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('call') || t.includes('звон')) return <Phone />
  if (t.includes('meet') || t.includes('встреч')) return <Calendar />
  if (t.includes('mail') || t.includes('email')) return <Mail />
  return <FileText />
}

const TODAY_STAT_KEYS: Record<TodayStatKind, string> = {
  high_risk: 'dashboard.todayHighRisk',
  overdue_next_action: 'dashboard.todayOverdueAction',
  no_contact_7d: 'dashboard.todayNoContact',
}

const AI_INSIGHT_KEYS: Record<AiInsightKind, string> = {
  needs_attention: 'dashboard.aiInsightNeedsAttention',
  no_next_step: 'dashboard.aiInsightNoNextStep',
  overdue_close: 'dashboard.aiInsightOverdueClose',
}

function topDealSubtitle(
  deal: TopDealDashboard,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (deal.subtitle_kind === 'closing') {
    if (deal.days_to_close === null) return t('dashboard.topDealClosingOverdue')
    if (deal.days_to_close < 0) return t('dashboard.topDealClosingOverdue')
    if (deal.days_to_close === 0) return t('dashboard.topDealClosingToday')
    return t('dashboard.topDealClosingIn', { days: deal.days_to_close })
  }

  if (deal.subtitle_kind === 'risk') {
    return t('dashboard.topDealRisk', { score: deal.risk_score })
  }

  const statusKey = `deals.status.${deal.status.toLowerCase()}`
  const translated = t(statusKey)
  return translated === statusKey ? deal.status : translated
}

export function DashboardView() {
  const { t } = useI18n()
  const locale = useLocaleCode()
  const { organization, isLoading: isOrganizationLoading } = useOrganization()
  const [contacts, setContacts] = useState(0)
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof fetchDeals>>>([])
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof fetchActivities>>>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [contactsData, dealsData, activitiesData, summaryData] = await Promise.all([
          fetchContacts(),
          fetchDeals(),
          fetchActivities(),
          fetchDashboardSummary(),
        ])
        setContacts(contactsData.length)
        setDeals(dealsData)
        setActivities(activitiesData)
        setSummary(summaryData)
      } catch {
        // API errors are handled globally via toast
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [t])

  const pipeline = useMemo(
    () => deals.reduce((sum, deal) => sum + Number(deal.amount ?? 0), 0),
    [deals],
  )

  const riskLevelLabel = (level: string) => {
    const key = `deals.risk.${level}`
    const translated = t(key)
    return translated === key ? level : translated
  }

  const riskLevelClass = (level: string) => {
    if (level === 'high') return 'badgeDanger'
    if (level === 'medium') return 'badgeWarning'
    return 'badgeSuccess'
  }

  if (isLoading || isOrganizationLoading) {
    return <DashboardSkeleton />
  }

  const topRiskyDeals = summary?.top_risky_deals ?? []
  const todayStats = (summary?.today_stats ?? []).filter((item) => item.count > 0)
  const aiInsights = summary?.ai_insights ?? []
  const upcomingActions = summary?.upcoming_actions ?? []
  const topDeals = summary?.top_deals ?? []

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="pageTitle">{t('dashboard.title')}</h1>
          <p className="pageSubtitle">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <DashboardOnboarding
        hasOrganization={organization !== null}
        hasContacts={contacts > 0}
        hasDeals={deals.length > 0}
        hasActivities={activities.length > 0}
      />

      <div className={styles.statsGrid}>
        <div className={`card ${styles.statCard}`}>
          <div className="muted">{t('dashboard.deals')}</div>
          <div className={styles.statValue}>{deals.length}</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className="muted">{t('dashboard.pipeline')}</div>
          <div className={styles.statValue}>{formatMoney(String(pipeline), locale)}</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className="muted">{t('dashboard.contacts')}</div>
          <div className={styles.statValue}>{contacts}</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className="muted">{t('dashboard.activities')}</div>
          <div className={styles.statValue}>{activities.length}</div>
        </div>
      </div>

      <section className={`card ${styles.todayCard}`}>
        <div className="cardHeader">
          <h2>{t('dashboard.todayTitle')}</h2>
        </div>
        <div className="cardBody">
          {deals.length === 0 ? (
            <DashboardSectionEmpty
              title={t('dashboard.riskEmptyTitle')}
              description={t('dashboard.riskEmptyDescription')}
              action={{ label: t('deals.create'), to: '/deals/new' }}
            />
          ) : todayStats.length === 0 ? (
            <p className={styles.todayAllClear}>{t('dashboard.todayAllClear')}</p>
          ) : (
            <div className={styles.todayList}>
              <p className={styles.todayLead}>{t('dashboard.todaySubtitle')}</p>
              <ul className={styles.insightList}>
                {todayStats.map((item) => (
                  <li key={item.kind}>{t(TODAY_STAT_KEYS[item.kind], { count: item.count })}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className={`card ${styles.upcomingCard}`}>
        <div className="cardHeader">
          <h2>{t('dashboard.upcomingActions')}</h2>
        </div>
        <div className="cardBody">
          {deals.length === 0 ? (
            <DashboardSectionEmpty
              title={t('dashboard.upcomingEmpty')}
              description={t('dashboard.upcomingEmptyDescription')}
              action={{ label: t('deals.create'), to: '/deals/new' }}
            />
          ) : upcomingActions.length === 0 ? (
            <DashboardSectionEmpty
              title={t('dashboard.upcomingEmpty')}
              description={t('dashboard.upcomingEmptyDescription')}
            />
          ) : (
            <>
              <div className={styles.upcomingGroupLabel}>{t('dashboard.upcomingToday')}</div>
              {upcomingActions.map((action) => (
                <div key={action.deal_id} className={styles.upcomingRow}>
                  <div className={styles.upcomingMain}>
                    <Link to={`/deals/${action.deal_id}`} className={styles.upcomingAction}>
                      {action.next_action}
                    </Link>
                    <div className="muted">
                      {action.title}
                      {action.company_name ? ` · ${action.company_name}` : ''}
                    </div>
                  </div>
                  <div className={styles.upcomingMeta}>
                    {action.is_overdue ? (
                      <span className="badge badgeDanger">{t('dashboard.upcomingOverdue')}</span>
                    ) : action.next_action_at ? (
                      <span className="muted">
                        {new Date(action.next_action_at).toLocaleDateString(locale)}
                      </span>
                    ) : (
                      <span className="muted">{t('dashboard.upcomingNoDate')}</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <section className={`card ${styles.sectionCard}`}>
        <div className="cardHeader">
          <h2>{t('dashboard.dealsAtRisk')}</h2>
        </div>
        <div className="cardBody">
          {deals.length === 0 ? (
            <DashboardSectionEmpty
              title={t('dashboard.riskEmptyTitle')}
              description={t('dashboard.riskEmptyDescription')}
              action={{ label: t('deals.create'), to: '/deals/new' }}
            />
          ) : topRiskyDeals.length === 0 ? (
            <DashboardSectionEmpty title={t('dashboard.noRiskyDeals')} />
          ) : (
            topRiskyDeals.map((deal) => (
              <div key={deal.deal_id} className={styles.riskDealRow}>
                <div>
                  <Link to={`/deals/${deal.deal_id}`} className="linkButton">
                    {deal.title}
                  </Link>
                  <div className="muted">
                    {deal.company_name ?? deal.contact_name ?? t('common.dash')}
                  </div>
                  {deal.main_reason && (
                    <div className="muted">
                      {t('dashboard.riskReason')}: {deal.main_reason}
                    </div>
                  )}
                </div>
                <div className={styles.riskDealMeta}>
                  <span className={`badge ${riskLevelClass(deal.risk_level)}`}>
                    {deal.risk_score} · {riskLevelLabel(deal.risk_level)}
                  </span>
                  <Link to={`/deals/${deal.deal_id}`} className="linkButton">
                    {t('dashboard.openDeal')}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className={styles.grid}>
        <section className={`card ${styles.sectionCard}`}>
          <div className="cardHeader">
            <h2>{t('dashboard.aiInsights')}</h2>
          </div>
          <div className="cardBody">
            {deals.length === 0 ? (
              <DashboardSectionEmpty
                title={t('dashboard.aiInsightsEmpty')}
                description={t('dashboard.aiInsightsEmptyDescription')}
              />
            ) : aiInsights.length === 0 ? (
              <DashboardSectionEmpty
                title={t('dashboard.aiInsightsEmpty')}
                description={t('dashboard.aiInsightsEmptyDescription')}
              />
            ) : (
              <ul className={styles.insightList}>
                {aiInsights.map((item) => (
                  <li key={item.kind} className={styles.aiInsightItem}>
                    <span className={styles.aiInsightIcon} aria-hidden>
                      ⚠
                    </span>
                    {t(AI_INSIGHT_KEYS[item.kind], { count: item.count })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={`card ${styles.sectionCard}`}>
          <div className="cardHeader">
            <h2>{t('dashboard.recentActivities')}</h2>
          </div>
          <div className="cardBody">
            {activities.length === 0 ? (
              <DashboardSectionEmpty
                title={t('dashboard.noActivities')}
                description={t('dashboard.activitiesEmptyDescription')}
                action={{ label: t('activities.emptyAction'), to: '/activities/new' }}
              />
            ) : (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className={styles.activityRow}>
                  <div className={styles.activityIcon}>{activityIcon(activity.type)}</div>
                  <div>
                    <div>{activityTypeLabel(activity.type, t)}</div>
                    <div className="muted">{activity.content ?? t('common.noContent')}</div>
                  </div>
                  <div className="muted">
                    {new Date(activity.happened_at).toLocaleString(locale)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className={`card ${styles.sectionCard}`}>
        <div className="cardHeader">
          <h2>{t('dashboard.topDeals')}</h2>
        </div>
        <div className="cardBody">
          {topDeals.length === 0 ? (
            <DashboardSectionEmpty
              title={t('dashboard.noDeals')}
              description={t('dashboard.topDealsEmptyDescription')}
              action={{ label: t('deals.create'), to: '/deals/new' }}
            />
          ) : (
            topDeals.map((deal) => (
              <div key={deal.deal_id} className={styles.dealRow}>
                <div className={styles.dealRowHeader}>
                  <Link to={`/deals/${deal.deal_id}`} className="linkButton">
                    {deal.title}
                  </Link>
                  <span className="muted">{formatMoney(deal.amount, locale)}</span>
                </div>
                <div className={styles.dealRowSubtitle}>{topDealSubtitle(deal, t)}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
