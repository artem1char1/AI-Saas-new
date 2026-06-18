import { apiFetch } from '@/shared/api/base'

import type { DashboardRiskSummary, DashboardSummary, DealRisk } from '../model/types'

export function fetchDealRisk(dealId: string): Promise<DealRisk> {
  return apiFetch<DealRisk>(`/deals/${dealId}/risk`)
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/dashboard/summary')
}

export function fetchDashboardRiskSummary(): Promise<DashboardRiskSummary> {
  return apiFetch<DashboardRiskSummary>('/dashboard/risk-summary')
}
