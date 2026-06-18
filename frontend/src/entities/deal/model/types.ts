export type Deal = {
  id: string
  organization_id: string
  contact_id: string
  title: string
  amount: string | null
  currency: string | null
  status: string
  priority: string | null
  expected_close_date: string | null
  last_contact_at: string | null
  next_action: string | null
  next_action_at: string | null
  loss_reason: string | null
  created_at: string
  updated_at: string
}

export type DealCreate = {
  title: string
  amount?: number
  status?: string
  priority?: string
  contact_id: string
  expected_close_date?: string
  next_action?: string
  next_action_at?: string
  loss_reason?: string
}

export type DealUpdate = Partial<DealCreate>

export type DealPatch = Omit<Partial<DealCreate>, 'next_action' | 'next_action_at' | 'loss_reason'> & {
  next_action?: string | null
  next_action_at?: string | null
  loss_reason?: string | null
}
