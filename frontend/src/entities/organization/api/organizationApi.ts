import { apiFetch } from '@/shared/api'

import type { Organization, OrganizationCreate } from '../model/types'

export function fetchMyOrganization(): Promise<Organization | null> {
  return apiFetch<Organization | null>('/organizations/me')
}

export function createOrganization(data: OrganizationCreate): Promise<Organization> {
  return apiFetch<Organization>('/organizations', {
    method: 'POST',
    body: data,
  })
}
