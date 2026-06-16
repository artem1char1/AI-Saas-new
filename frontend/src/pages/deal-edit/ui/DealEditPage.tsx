import { useParams } from 'react-router-dom'

import { DealForm } from '@/features/deal-form'
import { useI18n } from '@/shared/lib/i18n'

export function DealEditPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const { t } = useI18n()

  if (!dealId) return <p className="error">{t('deals.notFound')}</p>

  return <DealForm dealId={dealId} />
}
