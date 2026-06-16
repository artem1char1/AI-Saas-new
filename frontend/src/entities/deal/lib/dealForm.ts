import type { Deal } from '../model/types'

export type DealFormValues = {
  title: string
  amount: string
  status: string
  priority: string
  contact_id: string
  expected_close_date: string
  next_action: string
  next_action_at: string
  loss_reason: string
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function dealToFormValues(deal: Deal): DealFormValues {
  return {
    title: deal.title,
    amount: deal.amount ?? '',
    status: deal.status,
    priority: deal.priority ?? 'medium',
    contact_id: deal.contact_id,
    expected_close_date: deal.expected_close_date ?? '',
    next_action: deal.next_action ?? '',
    next_action_at: deal.next_action_at ? toLocalDatetimeValue(new Date(deal.next_action_at)) : '',
    loss_reason: deal.loss_reason ?? '',
  }
}

export function buildDealPayload(form: DealFormValues, isEdit: boolean) {
  return {
    title: form.title.trim(),
    amount: form.amount ? Number(form.amount) : undefined,
    status: isEdit ? form.status : 'new',
    priority: form.priority || undefined,
    contact_id: form.contact_id,
    expected_close_date: form.expected_close_date || undefined,
    next_action: form.next_action.trim() || undefined,
    next_action_at: form.next_action_at ? new Date(form.next_action_at).toISOString() : undefined,
    loss_reason: form.status === 'lost' ? form.loss_reason.trim() || undefined : undefined,
  }
}
