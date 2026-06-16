import { useEffect, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'



import { fetchActivities } from '@/entities/activity'

import { fetchContacts } from '@/entities/contact'

import { fetchDeals, dealStatusProgress } from '@/entities/deal'

import { useOrganization } from '@/features/organization-setup'

import { useI18n, useLocaleCode } from '@/shared/lib/i18n'

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



export function DashboardView() {

  const { t } = useI18n()

  const locale = useLocaleCode()

  const { organization, isLoading: isOrganizationLoading } = useOrganization()

  const [contacts, setContacts] = useState(0)

  const [deals, setDeals] = useState<Awaited<ReturnType<typeof fetchDeals>>>([])

  const [activities, setActivities] = useState<Awaited<ReturnType<typeof fetchActivities>>>([])

  const [isLoading, setIsLoading] = useState(true)



  useEffect(() => {

    const load = async () => {

      setIsLoading(true)

      try {

        const [contactsData, dealsData, activitiesData] = await Promise.all([

          fetchContacts(),

          fetchDeals(),

          fetchActivities(),

        ])

        setContacts(contactsData.length)

        setDeals(dealsData)

        setActivities(activitiesData)

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



  const topDeals = useMemo(

    () => [...deals].sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0)).slice(0, 4),

    [deals],

  )



  const dealsAtRisk = useMemo(

    () =>

      deals

        .filter((deal) => ['negotiation', 'proposal'].includes(deal.status.toLowerCase()))

        .slice(0, 4),

    [deals],

  )



  const hasAiData = contacts > 0 && deals.length > 0



  if (isLoading || isOrganizationLoading) {

    return <DashboardSkeleton />

  }



  const riskLabel = (status: string) => {

    if (status === 'negotiation') return t('deals.risk.high')

    if (status === 'proposal') return t('deals.risk.medium')

    return t('deals.risk.low')

  }



  const riskClass = (status: string) => {

    if (status === 'negotiation') return 'badgeDanger'

    if (status === 'proposal') return 'badgeWarning'

    return 'badgeSuccess'

  }



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



      <div className={styles.grid}>

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

            ) : dealsAtRisk.length === 0 ? (

              <DashboardSectionEmpty title={t('dashboard.noRiskyDeals')} />

            ) : (

              dealsAtRisk.map((deal) => (

                <div key={deal.id} className="listRow">

                  <div>

                    <Link to={`/deals/${deal.id}`} className="linkButton">

                      {deal.title}

                    </Link>

                    <div className="muted">{formatMoney(deal.amount, locale)}</div>

                  </div>

                  <span className={`badge ${riskClass(deal.status)}`}>

                    {riskLabel(deal.status)}

                  </span>

                </div>

              ))

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

                    <div>{activity.type}</div>

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

              topDeals.map((deal) => {

                const progress = dealStatusProgress(deal.status)

                return (

                  <div key={deal.id} className={styles.dealRow}>

                    <div className={styles.dealRowHeader}>

                      <Link to={`/deals/${deal.id}`} className="linkButton">

                        {deal.title}

                      </Link>

                      <span className="muted">{progress}%</span>

                    </div>

                    <div className="progressTrack">

                      <div className="progressFill" style={{ width: `${progress}%` }} />

                    </div>

                    <div className="muted">{formatMoney(deal.amount, locale)}</div>

                  </div>

                )

              })

            )}

          </div>

        </section>



        <section className={`card ${styles.sectionCard}`}>

          <div className="cardHeader">

            <h2>{t('dashboard.aiInsights')}</h2>

          </div>

          <div className="cardBody">

            {!hasAiData ? (
              <DashboardSectionEmpty description={t('dashboard.aiEmptyDescription')} />
            ) : (

              <div className={styles.aiCard}>

                <h3>{t('dashboard.aiTitle')}</h3>

                <p className="muted">{t('dashboard.aiDescription')}</p>

                <Link to="/deals" className="linkButton">

                  {t('dashboard.viewDeals')}

                </Link>

              </div>

            )}

          </div>

        </section>

      </div>

    </div>

  )

}


