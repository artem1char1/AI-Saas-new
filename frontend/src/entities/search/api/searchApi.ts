import { apiFetch } from '@/shared/api/base'

import type { SearchResponse } from '../model/types'

export function searchEntities(query: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query })
  return apiFetch<SearchResponse>(`/search?${params.toString()}`)
}
