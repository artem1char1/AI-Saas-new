import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createActivity } from '@/entities/activity'
import { fetchContacts, type Contact } from '@/entities/contact'
import { fetchDeals, type Deal } from '@/entities/deal'
import { useI18n } from '@/shared/lib/i18n'

const ACTIVITY_TYPES = ['note', 'call', 'meeting', 'email'] as const

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ActivityForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()

  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [type, setType] = useState<(typeof ACTIVITY_TYPES)[number]>('note')
  const [content, setContent] = useState('')
  const [dealId, setDealId] = useState(searchParams.get('deal_id') ?? '')
  const [contactId, setContactId] = useState(searchParams.get('contact_id') ?? '')
  const [happenedAt, setHappenedAt] = useState(toLocalDatetimeValue(new Date()))

  useEffect(() => {
    const load = async () => {
      try {
        const [dealsData, contactsData] = await Promise.all([fetchDeals(), fetchContacts()])
        setDeals(dealsData)
        setContacts(contactsData)
      } catch {
        // API errors are handled globally via toast
      }
    }

    void load()
  }, [t])

  useEffect(() => {
    if (!dealId) return
    const deal = deals.find((item) => item.id === dealId)
    if (deal) setContactId(deal.contact_id)
  }, [dealId, deals])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await createActivity({
        type,
        content: content || undefined,
        deal_id: dealId,
        contact_id: contactId,
        happened_at: new Date(happenedAt).toISOString(),
      })
      navigate(dealId ? `/deals/${dealId}` : '/activities')
    } catch {
      // API errors are handled globally via toast
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="card" style={{ padding: '1.5rem' }}>
      <h2 className="pageTitle">{t('activities.newTitle')}</h2>

      <div className="field" style={{ marginTop: '1rem' }}>
        <label>{t('common.type')}</label>
        <select className="select" value={type} onChange={(e) => setType(e.target.value as (typeof ACTIVITY_TYPES)[number])}>
          {ACTIVITY_TYPES.map((activityType) => (
            <option key={activityType} value={activityType}>
              {t(`activities.types.${activityType}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>{t('common.content')}</label>
        <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      </div>
      <div className="field">
        <label>{t('nav.deals')}</label>
        <select className="select" value={dealId} onChange={(e) => setDealId(e.target.value)} required>
          <option value="">{t('common.selectDeal')}</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>{deal.title}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>{t('common.contact')}</label>
        <select className="select" value={contactId} onChange={(e) => setContactId(e.target.value)} required>
          <option value="">{t('common.selectContact')}</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>{contact.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>{t('common.happenedAt')}</label>
        <input className="input" type="datetime-local" value={happenedAt} onChange={(e) => setHappenedAt(e.target.value)} required />
      </div>


      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" className="button buttonPrimary">{t('activities.create')}</button>
        <button type="button" className="button buttonSecondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
      </div>
    </form>
  )
}
