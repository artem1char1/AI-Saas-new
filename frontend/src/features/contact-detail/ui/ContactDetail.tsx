import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchContact, type Contact } from '@/entities/contact'
import { useI18n } from '@/shared/lib/i18n'
import { formatPhoneForDisplay } from '@/shared/lib/masks'
import { ContactDetailSkeleton } from '@/shared/ui/skeleton'

import styles from './ContactDetail.module.css'

type ContactDetailProps = {
  contactId: string
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const { t } = useI18n()
  const [contact, setContact] = useState<Contact | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setContact(await fetchContact(contactId))
        setHasError(false)
      } catch {
        setHasError(true)
        // API errors are handled globally via toast
      }
    }

    void load()
  }, [contactId, t])

  if (hasError) return <p className="error">{t('contacts.notFound')}</p>
  if (!contact) return <ContactDetailSkeleton />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="muted">{t('nav.contacts')}</p>
          <h1 className="pageTitle">{contact.name}</h1>
        </div>
        <div className={styles.actions}>
          <Link to={`/deals/new?contact_id=${contact.id}`} className="button buttonPrimary">
            {t('contacts.createDeal')}
          </Link>
          <Link to={`/contacts/${contact.id}/edit`} className="button buttonSecondary">
            {t('common.edit')}
          </Link>
        </div>
      </div>

      <section className="card">
        <div className="cardBody">
          <div className={styles.fieldRow}><span className="muted">{t('common.email')}</span><span>{contact.email ?? t('common.dash')}</span></div>
          <div className={styles.fieldRow}>
            <span className="muted">{t('common.phone')}</span>
            <span>
              {contact.phone ? formatPhoneForDisplay(contact.phone) : t('common.dash')}
            </span>
          </div>
          <div className={styles.fieldRow}><span className="muted">{t('common.company')}</span><span>{contact.company_name ?? t('common.dash')}</span></div>
          <div className={styles.fieldRow}><span className="muted">{t('common.position')}</span><span>{contact.position ?? t('common.dash')}</span></div>
        </div>
      </section>
    </div>
  )
}
