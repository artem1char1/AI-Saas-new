import { apiFetch } from '@/shared/api'

import type { Contact, ContactCreate, ContactUpdate } from '../model/types'

export function fetchContact(id: string): Promise<Contact> {
  return apiFetch<Contact>(`/contacts/${id}`)
}

export function fetchContacts(): Promise<Contact[]> {
  return apiFetch<Contact[]>('/contacts')
}

export function createContact(data: ContactCreate): Promise<Contact> {
  return apiFetch<Contact>('/contacts', { method: 'POST', body: data })
}

export function updateContact(id: string, data: ContactUpdate): Promise<Contact> {
  return apiFetch<Contact>(`/contacts/${id}`, { method: 'PUT', body: data })
}

export function deleteContact(id: string): Promise<void> {
  return apiFetch<void>(`/contacts/${id}`, { method: 'DELETE' })
}
