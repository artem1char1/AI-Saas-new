import { apiFetch } from '@/shared/api/base'

import type { AiFollowup, AiFollowupListItem } from '../model/types'

export function generateFollowup(dealId: string): Promise<AiFollowup> {
  return apiFetch<AiFollowup>('/ai/followups/generate', {
    method: 'POST',
    body: { deal_id: dealId },
    suppressToast: true,
  })
}

export function fetchDealFollowups(dealId: string): Promise<AiFollowupListItem[]> {
  return apiFetch<AiFollowupListItem[]>(`/ai/followups/deal/${dealId}`)
}
