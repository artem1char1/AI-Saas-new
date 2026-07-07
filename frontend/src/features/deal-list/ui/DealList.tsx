import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchContacts, type Contact } from '@/entities/contact'
import { DEAL_PRIORITIES, DEAL_STATUSES, deleteDeal, fetchDeals, type Deal } from '@/entities/deal'
import { useI18n, useLocaleCode } from '@/shared/lib/i18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ListRowsOnlySkeleton } from '@/shared/ui/skeleton'
import { Briefcase } from '@/shared/ui/icons'

import styles from './DealList.module.css'

function statusBarClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'qualification':
      return styles.statusBarQualification
    case 'proposal':
      return styles.statusBarProposal
    case 'negotiation':
      return styles.statusBarNegotiation
    case 'won':
      return styles.statusBarWon
    case 'lost':
      return styles.statusBarLost
    default:
      return styles.statusBarNew
  }
}

function statusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'qualification':
      return styles.statusQualification
    case 'proposal':
      return styles.statusProposal
    case 'negotiation':
      return styles.statusNegotiation
    case 'won':
      return styles.statusWon
    case 'lost':
      return styles.statusLost
    default:
      return styles.statusNew
  }
}

function priorityBadgeClass(priority: string | null): string {
  switch (priority?.toLowerCase()) {
    case 'high':
      return styles.priorityHigh
    case 'low':
      return styles.priorityLow
    default:
      return styles.priorityMedium
  }
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale)
}

function isOverdue(expectedCloseDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const closeDate = new Date(expectedCloseDate)
  closeDate.setHours(0, 0, 0, 0)
  return closeDate < today
}

export function DealList() {
  const { t } = useI18n()
  const locale = useLocaleCode()
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [contactFilter, setContactFilter] = useState('')

  const load = async () => {
    setIsLoading(true)
    try {
      const [dealsData, contactsData] = await Promise.all([fetchDeals(), fetchContacts()])
      setDeals(dealsData)
      setContacts(contactsData)
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const contactName = (id: string) => contacts.find((c) => c.id === id)?.name ?? t('common.dash')

  const statusLabel = (status: string) => {
    const key = `deals.status.${status.toLowerCase()}`
    const translated = t(key)
    return translated === key ? status : translated
  }

  const priorityLabel = (priority: string | null) => {
    if (!priority) return t('deals.priority.medium')
    const key = `deals.priority.${priority.toLowerCase()}`
    const translated = t(key)
    return translated === key ? priority : translated
  }

  const contactNameMap = useMemo(() => {
    return new Map(contacts.map((contact) => [contact.id, contact.name]))
  }, [contacts])

  const filteredDeals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return deals.filter((deal) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        deal.title.toLowerCase().includes(normalizedSearch) ||
        (contactNameMap.get(deal.contact_id) ?? '').toLowerCase().includes(normalizedSearch)

      const matchesStatus = !statusFilter || deal.status === statusFilter
      const matchesPriority = !priorityFilter || (deal.priority ?? 'medium') === priorityFilter
      const matchesContact = !contactFilter || deal.contact_id === contactFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesContact
    })
  }, [contactFilter, contactNameMap, deals, priorityFilter, search, statusFilter])

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
    setContactFilter('')
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDeal(id)
      await load()
    } catch {
      // API errors are handled globally via toast
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="pageTitle">{t('deals.title')}</h1>
          <p className="pageSubtitle">{t('deals.subtitle')}</p>
        </div>
        <Link to="/deals/new" className="button buttonPrimary">
          + {t('deals.new')}
        </Link>
      </div>

      <section className="card">
        <div className="cardBody">
          <div className={styles.filters}>
            <input
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('deals.filters.searchPlaceholder')}
            />
            <select
              className="select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">{t('deals.filters.allStatuses')}</option>
              {DEAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="">{t('deals.filters.allPriorities')}</option>
              {DEAL_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabel(priority)}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={contactFilter}
              onChange={(event) => setContactFilter(event.target.value)}
            >
              <option value="">{t('deals.filters.allContacts')}</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
            <button type="button" className="button buttonGhost" onClick={resetFilters}>
              {t('deals.filters.reset')}
            </button>
          </div>

          {isLoading ? (
            <ListRowsOnlySkeleton rows={6} />
          ) : deals.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={22} />}
              title={t('deals.empty')}
              description={t('deals.emptyDescription')}
              action={{ label: t('deals.create'), to: '/deals/new' }}
            />
          ) : filteredDeals.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={22} />}
              title={t('deals.filters.emptyTitle')}
              description={t('deals.filters.emptyDescription')}
            />
          ) : (
            <div className={styles.list}>
              {filteredDeals.map((deal) => {
                const showOverdue =
                  deal.expected_close_date &&
                  isOverdue(deal.expected_close_date) &&
                  deal.status !== 'won' &&
                  deal.status !== 'lost'

                return (
                  <div key={deal.id} className={styles.row}>
                    <div
                      className={`${styles.statusBar} ${statusBarClass(deal.status)}`}
                      aria-hidden="true"
                    />

                    <div className={styles.rowMain}>
                      <div className={styles.rowTop}>
                        <Link to={`/deals/${deal.id}`} className={styles.titleLink}>
                          {deal.title}
                        </Link>
                        <div className={styles.badges}>
                          <span className={`${styles.badge} ${priorityBadgeClass(deal.priority)}`}>
                            {priorityLabel(deal.priority)}
                          </span>
                          <span className={`${styles.badge} ${statusBadgeClass(deal.status)}`}>
                            {statusLabel(deal.status)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.meta}>
                        <span>{contactName(deal.contact_id)}</span>
                        {deal.amount && (
                          <span className={styles.amount}>
                            ₽{Number(deal.amount).toLocaleString(locale)}
                          </span>
                        )}
                      </div>

                      <div className={styles.dates}>
                        {deal.expected_close_date ? (
                          <span className={showOverdue ? styles.dateOverdue : styles.dateHighlight}>
                            {t('deals.expectedClose')}: {formatDate(deal.expected_close_date, locale)}
                          </span>
                        ) : null}
                        <span>
                          {t('deals.listUpdated')}: {formatDate(deal.updated_at, locale)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className="button buttonGhost"
                        onClick={() => void handleDelete(deal.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
