import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteContact, fetchContacts, type Contact } from '@/entities/contact'
import { useI18n } from '@/shared/lib/i18n'
import { formatPhoneForDisplay } from '@/shared/lib/masks'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ListRowsOnlySkeleton } from '@/shared/ui/skeleton'
import { Users } from '@/shared/ui/icons'

import styles from './ContactList.module.css'

export function ContactList() {
  const { t } = useI18n()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    try {
      setContacts(await fetchContacts())
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
      await deleteContact(id)
      await load()
    } catch {
      // API errors are handled globally via toast
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="pageTitle">{t('contacts.title')}</h1>
          <p className="pageSubtitle">{t('contacts.subtitle')}</p>
        </div>
        <Link to="/contacts/new" className="button buttonPrimary">
          + {t('contacts.new')}
        </Link>
      </div>

      <section className="card">
        <div className="cardBody">
          {isLoading ? (
            <ListRowsOnlySkeleton rows={6} />
          ) : contacts.length === 0 ? (
            <EmptyState
              icon={<Users size={22} />}
              title={t('contacts.empty')}
              description={t('contacts.emptyDescription')}
              action={{ label: t('contacts.create'), to: '/contacts/new' }}
            />
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="listRow">
                <div>
                  <Link to={`/contacts/${contact.id}`} className="linkButton">
                    {contact.name}
                  </Link>
                  <div className="muted">
                    {[
                      contact.email,
                      contact.phone ? formatPhoneForDisplay(contact.phone) : null,
                      contact.company_name,
                      contact.position,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <button type="button" className="button buttonGhost" onClick={() => void handleDelete(contact.id)}>
                  {t('common.delete')}
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
