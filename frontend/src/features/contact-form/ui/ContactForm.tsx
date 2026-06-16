import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  createContact,
  fetchContact,
  updateContact,
  type Contact,
} from '@/entities/contact'
import { useI18n } from '@/shared/lib/i18n'
import {
  digitsFromStoredPhone,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from '@/shared/lib/masks'
import { FormPageSkeleton } from '@/shared/ui/skeleton'
import { EmailInput } from '@/shared/ui/EmailInput'
import { PhoneInput } from '@/shared/ui/PhoneInput'

import styles from './ContactForm.module.css'

type ContactFormProps = {
  contactId?: string
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  position: '',
}

type FieldErrors = {
  email?: string
  phone?: string
}

export function ContactForm({ contactId }: ContactFormProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const isEdit = Boolean(contactId)

  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isLoading, setIsLoading] = useState(Boolean(contactId))

  useEffect(() => {
    if (!contactId) return

    const load = async () => {
      setIsLoading(true)
      try {
        const contact: Contact = await fetchContact(contactId)
        setForm({
          name: contact.name,
          email: contact.email ?? '',
          phone: contact.phone ? digitsFromStoredPhone(contact.phone) : '',
          company_name: contact.company_name ?? '',
          position: contact.position ?? '',
        })
      } catch {
        // API errors are handled globally via toast
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [contactId, t])

  const validateFields = (): FieldErrors => {
    const nextErrors: FieldErrors = {}

    if (!isValidEmail(form.email)) {
      nextErrors.email = t('contacts.invalidEmail')
    }

    if (!isValidPhone(form.phone)) {
      nextErrors.phone = t('contacts.invalidPhone')
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextFieldErrors = validateFields()
    setFieldErrors(nextFieldErrors)

    if (Object.keys(nextFieldErrors).length > 0) {
      return
    }

    const payload = {
      name: form.name.trim(),
      email: normalizeEmail(form.email) || undefined,
      phone: normalizePhone(form.phone),
      company_name: form.company_name.trim() || undefined,
      position: form.position.trim() || undefined,
    }

    try {
      if (isEdit && contactId) {
        await updateContact(contactId, payload)
        navigate(`/contacts/${contactId}`)
      } else {
        const created = await createContact(payload)
        navigate(`/contacts/${created.id}`)
      }
    } catch {
      // API errors are handled globally via toast
    }
  }

  if (isLoading) return <FormPageSkeleton fields={5} />

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="card" style={{ padding: '1.5rem' }}>
      <h2 className="pageTitle">{isEdit ? t('contacts.editTitle') : t('contacts.newTitle')}</h2>

      <div className="field" style={{ marginTop: '1rem' }}>
        <label>{t('common.name')}</label>
        <input
          className="input"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
      </div>

      <div className="field">
        <label>{t('common.email')}</label>
        <EmailInput
          className="input"
          value={form.email}
          invalid={Boolean(fieldErrors.email)}
          onChange={(email) => {
            setForm({ ...form, email })
            if (fieldErrors.email) {
              setFieldErrors((current) => ({ ...current, email: undefined }))
            }
          }}
          onBlur={() => {
            if (form.email && !isValidEmail(form.email)) {
              setFieldErrors((current) => ({ ...current, email: t('contacts.invalidEmail') }))
            }
          }}
        />
        {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
      </div>

      <div className="field">
        <label>{t('common.phone')}</label>
        <PhoneInput
          className="input"
          value={form.phone}
          invalid={Boolean(fieldErrors.phone)}
          onChange={(phone) => {
            setForm({ ...form, phone })
            if (fieldErrors.phone) {
              setFieldErrors((current) => ({ ...current, phone: undefined }))
            }
          }}
          onBlur={() => {
            if (form.phone && !isValidPhone(form.phone)) {
              setFieldErrors((current) => ({ ...current, phone: t('contacts.invalidPhone') }))
            }
          }}
        />
        {fieldErrors.phone && <p className={styles.fieldError}>{fieldErrors.phone}</p>}
      </div>

      <div className="field">
        <label>{t('common.company')}</label>
        <input
          className="input"
          value={form.company_name}
          onChange={(event) => setForm({ ...form, company_name: event.target.value })}
        />
      </div>

      <div className="field">
        <label>{t('common.position')}</label>
        <input
          className="input"
          value={form.position}
          onChange={(event) => setForm({ ...form, position: event.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" className="button buttonPrimary">
          {isEdit ? t('common.save') : t('contacts.create')}
        </button>
        <button type="button" className="button buttonSecondary" onClick={() => navigate(-1)}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
