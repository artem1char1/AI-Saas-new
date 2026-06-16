import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { fetchContacts, type Contact } from '@/entities/contact'
import {
  buildDealPayload,
  createDeal,
  DEAL_OUTCOME_STAGES,
  DEAL_PIPELINE_STAGES,
  DEAL_PRIORITIES,
  dealToFormValues,
  fetchDeal,
  selectOpenDealById,
  setOpenDeal,
  updateDeal,
} from '@/entities/deal'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/shared/lib/i18n'
import { FormPageSkeleton } from '@/shared/ui/skeleton'

type DealFormProps = {
  dealId?: string
}

const emptyForm = {
  title: '',
  amount: '',
  status: 'new',
  priority: 'medium',
  contact_id: '',
  expected_close_date: '',
  next_action: '',
  next_action_at: '',
  loss_reason: '',
}

const STATUS_OPTIONS = [...DEAL_PIPELINE_STAGES, ...DEAL_OUTCOME_STAGES] as const

export function DealForm({ dealId }: DealFormProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const isEdit = Boolean(dealId)

  const cachedDeal = useAppSelector(selectOpenDealById(dealId))
  const hasCachedDeal = Boolean(cachedDeal)

  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm] = useState(() =>
    cachedDeal
      ? dealToFormValues(cachedDeal)
      : {
          ...emptyForm,
          contact_id: searchParams.get('contact_id') ?? '',
        },
  )
  const [isLoadingDeal, setIsLoadingDeal] = useState(isEdit && !hasCachedDeal)
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadContacts = async () => {
      setIsLoadingContacts(true)
      try {
        const contactsData = await fetchContacts()
        if (!cancelled) {
          setContacts(contactsData)
        }
      } catch {
        // API errors are handled globally via toast
      } finally {
        if (!cancelled) {
          setIsLoadingContacts(false)
        }
      }
    }

    void loadContacts()

    return () => {
      cancelled = true
    }
  }, [t])

  useEffect(() => {
    if (!dealId || hasCachedDeal) {
      return
    }

    let cancelled = false

    const loadDeal = async () => {
      setIsLoadingDeal(true)
      try {
        const deal = await fetchDeal(dealId)
        if (cancelled) return
        dispatch(setOpenDeal(deal))
        setForm(dealToFormValues(deal))
      } catch {
        // API errors are handled globally via toast
      } finally {
        if (!cancelled) {
          setIsLoadingDeal(false)
        }
      }
    }

    void loadDeal()

    return () => {
      cancelled = true
    }
  }, [dealId, dispatch, hasCachedDeal])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const payload = buildDealPayload(form, isEdit)

    try {
      if (isEdit && dealId) {
        const updated = await updateDeal(dealId, payload)
        dispatch(setOpenDeal(updated))
        navigate(`/deals/${dealId}`)
      } else {
        const deal = await createDeal(payload)
        dispatch(setOpenDeal(deal))
        navigate(`/deals/${deal.id}`)
      }
    } catch {
      // API errors are handled globally via toast
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingDeal) return <FormPageSkeleton fields={8} />

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="card" style={{ padding: '1.5rem' }}>
      <h2 className="pageTitle">{isEdit ? t('deals.editTitle') : t('deals.newTitle')}</h2>

      <div className="field" style={{ marginTop: '1rem' }}>
        <label>{t('common.title')}</label>
        <input
          className="input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="field">
        <label>{t('common.amount')}</label>
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
      </div>

      {isEdit && (
        <div className="field">
          <label>{t('common.status')}</label>
          <select
            className="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`deals.status.${status}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label>{t('common.priority')}</label>
        <select
          className="select"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          {DEAL_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {t(`deals.priority.${priority}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>{t('common.contact')}</label>
        <select
          className="select"
          value={form.contact_id}
          onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
          required
          disabled={isLoadingContacts}
        >
          <option value="">{t('common.selectContact')}</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>{t('common.expectedCloseDate')}</label>
        <input
          className="input"
          type="date"
          value={form.expected_close_date}
          onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
        />
      </div>

      <div className="field">
        <label>{t('deals.nextAction')}</label>
        <input
          className="input"
          value={form.next_action}
          onChange={(e) => setForm({ ...form, next_action: e.target.value })}
          placeholder={t('deals.nextActionPlaceholder')}
        />
      </div>

      <div className="field">
        <label>{t('deals.nextActionAt')}</label>
        <input
          className="input"
          type="datetime-local"
          value={form.next_action_at}
          onChange={(e) => setForm({ ...form, next_action_at: e.target.value })}
        />
      </div>

      {(isEdit ? form.status === 'lost' : false) && (
        <div className="field">
          <label>{t('deals.lossReason')}</label>
          <input
            className="input"
            value={form.loss_reason}
            onChange={(e) => setForm({ ...form, loss_reason: e.target.value })}
            placeholder={t('deals.lossReasonPlaceholder')}
          />
        </div>
      )}

      {!isEdit && contacts.length === 0 && !isLoadingContacts && (
        <p className="muted">{t('deals.createContactFirst')}</p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="submit"
          className="button buttonPrimary"
          disabled={isSubmitting || isLoadingContacts || (!isEdit && contacts.length === 0)}
        >
          {isSubmitting ? t('common.saving') : isEdit ? t('common.save') : t('deals.create')}
        </button>
        <button type="button" className="button buttonSecondary" onClick={() => navigate(-1)}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
