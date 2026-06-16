export type Contact = {
  id: string
  organization_id: string
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  position: string | null
  created_at: string
  updated_at: string
}

export type ContactCreate = {
  name: string
  email?: string
  phone?: string
  company_name?: string
  position?: string
}

export type ContactUpdate = Partial<ContactCreate>
