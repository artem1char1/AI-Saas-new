export type Activity = {
  id: string
  organization_id: string
  deal_id: string
  contact_id: string
  user_id: string
  type: string
  content: string | null
  happened_at: string
  created_at: string
}

export type ActivityCreate = {
  type: string
  content?: string
  deal_id: string
  contact_id: string
  happened_at: string
}

export type ActivityUpdate = Partial<ActivityCreate>
