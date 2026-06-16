import { apiFetch } from '@/shared/api'

import type { Deal, DealCreate, DealPatch, DealUpdate } from '../model/types'

export function fetchDeals(): Promise<Deal[]> {
  return apiFetch<Deal[]>('/deals')
}

export function fetchDeal(id: string): Promise<Deal> {
  return apiFetch<Deal>(`/deals/${id}`)
}

export function createDeal(data: DealCreate): Promise<Deal> {
  return apiFetch<Deal>('/deals', { method: 'POST', body: data })
}

export function updateDeal(id: string, data: DealUpdate): Promise<Deal> {
  return apiFetch<Deal>(`/deals/${id}`, { method: 'PUT', body: data })
}

export function patchDeal(id: string, data: DealPatch): Promise<Deal> {
  return apiFetch<Deal>(`/deals/${id}`, { method: 'PATCH', body: data })
}

export function deleteDeal(id: string): Promise<void> {
  return apiFetch<void>(`/deals/${id}`, { method: 'DELETE' })
}
