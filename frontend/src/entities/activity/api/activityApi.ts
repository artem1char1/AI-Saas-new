import { apiFetch } from '@/shared/api'

import type { Activity, ActivityCreate, ActivityUpdate } from '../model/types'

export function fetchActivities(dealId?: string): Promise<Activity[]> {
  const query = dealId ? `?deal_id=${dealId}` : ''
  return apiFetch<Activity[]>(`/activities${query}`)
}

export function createActivity(data: ActivityCreate): Promise<Activity> {
  return apiFetch<Activity>('/activities', { method: 'POST', body: data })
}

export function updateActivity(id: string, data: ActivityUpdate): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${id}`, { method: 'PUT', body: data })
}

export function deleteActivity(id: string): Promise<void> {
  return apiFetch<void>(`/activities/${id}`, { method: 'DELETE' })
}
