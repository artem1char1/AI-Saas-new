import { apiFetch } from '@/shared/api'

import type { HealthStatus } from '../model/types'

export function fetchHealthStatus(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>('/health', {
    skipAuth: true,
    suppressToast: true,
  })
}
