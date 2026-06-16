import { useParams } from 'react-router-dom'

import { ContactDetail } from '@/features/contact-detail'
import { useI18n } from '@/shared/lib/i18n'

export function ContactDetailPage() {
  const { contactId } = useParams<{ contactId: string }>()
  const { t } = useI18n()
  if (!contactId) return <p className="error">{t('contacts.notFound')}</p>
  return <ContactDetail contactId={contactId} />
}
