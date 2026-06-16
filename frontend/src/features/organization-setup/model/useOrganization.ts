import { useOrganizationContext } from './OrganizationProvider'

export function useOrganization() {
  return useOrganizationContext()
}
