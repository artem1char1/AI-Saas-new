import { useParams } from 'react-router-dom'

import { ContactForm } from '@/features/contact-form'
import { useI18n } from '@/shared/lib/i18n'

export function ContactEditPage() {
  const { contactId } = useParams<{ contactId: string }>()
  const { t } = useI18n()
  if (!contactId) return <p className="error">{t('contacts.notFound')}</p>
  return <ContactForm contactId={contactId} />
}
